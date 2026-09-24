import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import type { Sql } from "@/lib/db";
import { hasPerm } from "@/lib/permissions";
import type {
  CommercialBrief,
  FinanceEntry,
  FinanceKind,
  Lead,
  LeadActivity,
  LeadActivityKind,
  LeadSource,
  LeadStage,
  LeadTemperature,
} from "@/lib/types";
import {
  EXPENSE_CATEGORIES,
  LEAD_ACTIVITY_KINDS,
  LEAD_SOURCES,
  LEAD_STAGES,
  LEAD_TEMPS,
  REVENUE_CATEGORIES,
} from "@/lib/types";
import { nid, toIso } from "@/lib/utils";
import { ensureActor, notify, writeActivity, writeAudit } from "./actor";
import { asNum, asString } from "./map";

const STAGE_WEIGHT: Record<LeadStage, number> = {
  new: 0.1,
  contacted: 0.2,
  qualified: 0.4,
  proposal: 0.6,
  negotiation: 0.8,
  won: 1,
  lost: 0,
};

const STAGE_SCORE: Record<LeadStage, number> = {
  new: 18,
  contacted: 32,
  qualified: 52,
  proposal: 70,
  negotiation: 84,
  won: 100,
  lost: 0,
};

function asStage(v: unknown): LeadStage {
  const s = asString(v, "new");
  return (LEAD_STAGES as readonly string[]).includes(s) ? (s as LeadStage) : "new";
}
function asSource(v: unknown): LeadSource {
  const s = asString(v, "inbound");
  return (LEAD_SOURCES as readonly string[]).includes(s) ? (s as LeadSource) : "inbound";
}
function asTemp(v: unknown): LeadTemperature {
  const s = asString(v, "warm");
  return (LEAD_TEMPS as readonly string[]).includes(s) ? (s as LeadTemperature) : "warm";
}
function asKind(v: unknown): LeadActivityKind {
  const s = asString(v, "note");
  return (LEAD_ACTIVITY_KINDS as readonly string[]).includes(s) ? (s as LeadActivityKind) : "note";
}

function scoreLead(stage: LeadStage, temp: LeadTemperature, value: number, nextFollowUp: string | null): number {
  let n = STAGE_SCORE[stage];
  if (temp === "hot") n += 12;
  if (temp === "cold") n -= 8;
  if (value >= 1_000_000) n += 8;
  if (nextFollowUp && nextFollowUp < new Date().toISOString().slice(0, 10) && stage !== "won" && stage !== "lost") n -= 10;
  return Math.max(0, Math.min(100, n));
}

function mapLead(r: Record<string, unknown>): Lead {
  return {
    id: asString(r.id),
    orgId: asString(r.org_id),
    name: asString(r.name),
    company: asString(r.company),
    email: r.email ? asString(r.email) : null,
    phone: r.phone ? asString(r.phone) : null,
    title: asString(r.title),
    source: asSource(r.source),
    stage: asStage(r.stage),
    temperature: asTemp(r.temperature),
    valueInr: asNum(r.value_inr),
    score: asNum(r.score),
    ownerId: r.owner_id ? asString(r.owner_id) : null,
    nextFollowUp: r.next_follow_up ? String(r.next_follow_up).slice(0, 10) : null,
    lastContactAt: r.last_contact_at ? toIso(r.last_contact_at) : null,
    city: r.city ? asString(r.city) : null,
    website: r.website ? asString(r.website) : null,
    industry: r.industry ? asString(r.industry) : null,
    notes: asString(r.notes),
    lostReason: r.lost_reason ? asString(r.lost_reason) : null,
    convertedProjectId: r.converted_project_id ? asString(r.converted_project_id) : null,
    createdAt: toIso(r.created_at),
    updatedAt: toIso(r.updated_at),
  };
}

function mapActivity(r: Record<string, unknown>): LeadActivity {
  return {
    id: asString(r.id),
    leadId: asString(r.lead_id),
    actorId: r.actor_id ? asString(r.actor_id) : null,
    kind: asKind(r.kind),
    body: asString(r.body),
    nextFollowUp: r.next_follow_up ? String(r.next_follow_up).slice(0, 10) : null,
    createdAt: toIso(r.created_at),
  };
}

function mapFinance(r: Record<string, unknown>): FinanceEntry {
  const kind = asString(r.kind, "expense") as FinanceKind;
  const status = asString(r.status, "posted");
  return {
    id: asString(r.id),
    orgId: asString(r.org_id),
    kind: kind === "revenue" ? "revenue" : "expense",
    category: asString(r.category, "other"),
    amountInr: asNum(r.amount_inr),
    entryDate: String(r.entry_date).slice(0, 10),
    title: asString(r.title),
    notes: asString(r.notes),
    vendor: r.vendor ? asString(r.vendor) : null,
    leadId: r.lead_id ? asString(r.lead_id) : null,
    projectId: r.project_id ? asString(r.project_id) : null,
    status: status === "pending" ? "pending" : "posted",
    createdBy: r.created_by ? asString(r.created_by) : null,
    createdAt: toIso(r.created_at),
  };
}

function requireLeadView(role: string) {
  if (!hasPerm(role as never, "lead.view")) throw new Error("Forbidden");
}
function requireLeadManage(role: string) {
  if (!hasPerm(role as never, "lead.manage")) throw new Error("Forbidden");
}
function requireFinanceView(role: string) {
  if (!hasPerm(role as never, "finance.view")) throw new Error("Forbidden");
}
function requireFinanceManage(role: string) {
  if (!hasPerm(role as never, "finance.manage")) throw new Error("Forbidden");
}

const seeded = new Set<string>();

export async function ensureCommercialSeed(sql: Sql, orgId: string, actorId: string): Promise<void> {
  if (seeded.has(orgId)) return;
  try {
    const existing = await sql`select id from leads where org_id = ${orgId} limit 1`;
    if (existing[0]) {
      seeded.add(orgId);
      return;
    }
    const ceo = await sql`select id from profiles where org_id = ${orgId} and role = ${"ceo"} limit 1`;
    const founder = await sql`select id from profiles where org_id = ${orgId} and role = ${"founder"} limit 1`;
    const sales = await sql`select id from profiles where org_id = ${orgId} and title ilike ${"%product%"} limit 1`;
    const owner = founder[0] ? String(founder[0].id) : ceo[0] ? String(ceo[0].id) : actorId;
    const aisha = sales[0] ? String(sales[0].id) : owner;
    const today = new Date();
    const d = (offset: number) => {
      const x = new Date(today);
      x.setDate(x.getDate() + offset);
      return x.toISOString().slice(0, 10);
    };
    const ym = (monthsAgo: number, day = 5) => {
      const x = new Date(today.getFullYear(), today.getMonth() - monthsAgo, day);
      return x.toISOString().slice(0, 10);
    };

    const leads: Array<Record<string, unknown>> = [
      { id: "ld_hospital", name: "Dr. Kavya Reddy", company: "Aarogya Hospitals", email: "kavya@aarogya.example", phone: "+91 98480 11001", title: "CIO", source: "referral", stage: "won", temp: "hot", value: 1850000, city: "Hyderabad", industry: "Healthcare", next: null, notes: "Hospital OS live. Expansion wards in discussion." },
      { id: "ld_resto", name: "Sameer Patel", company: "Nava Kitchen Group", email: "sameer@nava.example", phone: "+91 98200 22002", title: "Founder", source: "inbound", stage: "proposal", temp: "hot", value: 940000, city: "Mumbai", industry: "Hospitality", next: d(2), notes: "Kitchen display + inventory. Proposal sent last week." },
      { id: "ld_estate", name: "Priya Menon", company: "Coastal Estates", email: "priya@coastal.example", phone: "+91 98470 33003", title: "Head of Sales", source: "partner", stage: "negotiation", temp: "hot", value: 1200000, city: "Kochi", industry: "Real estate", next: d(1), notes: "Commission engine and listing portal. Legal review." },
      { id: "ld_review", name: "Arun Iyer", company: "BrightBite QSR", email: "arun@brightbite.example", phone: "+91 98840 44004", title: "Ops Director", source: "website", stage: "qualified", temp: "warm", value: 480000, city: "Chennai", industry: "QSR", next: d(0), notes: "Google review automation for 40 outlets." },
      { id: "ld_kiosk", name: "Mehul Shah", company: "Orbit Malls", email: "mehul@orbit.example", phone: "+91 98790 55005", title: "CX Lead", source: "event", stage: "contacted", temp: "warm", value: 620000, city: "Ahmedabad", industry: "Retail", next: d(-1), notes: "AI kiosk pilot for two properties." },
      { id: "ld_clinic", name: "Nandini Rao", company: "Lotus Clinics", email: "nandini@lotus.example", phone: "+91 99000 66006", title: "Practice Manager", source: "outbound", stage: "new", temp: "warm", value: 310000, city: "Bengaluru", industry: "Healthcare", next: d(3), notes: "Inbound from hospital referral. Wants appointment API." },
      { id: "ld_lost", name: "Vikram Das", company: "Northwind Logistics", email: "vikram@northwind.example", phone: "+91 98100 77007", title: "IT Head", source: "outbound", stage: "lost", temp: "cold", value: 750000, city: "Delhi", industry: "Logistics", next: null, notes: "Chose an incumbent. Revisit in two quarters." },
      { id: "ld_agency", name: "Leila Costa", company: "Harbor Brands", email: "leila@harbor.example", phone: "+1 415 555 0199", title: "CMO", source: "inbound", stage: "qualified", temp: "hot", value: 2100000, city: "Remote", industry: "Consumer", next: d(4), notes: "Reputation + review stack for D2C." },
    ];

    for (const L of leads) {
      const stage = asStage(L.stage);
      const temp = asTemp(L.temp);
      const value = Number(L.value);
      const next = L.next ? String(L.next) : null;
      const sc = scoreLead(stage, temp, value, next);
      await sql`insert into leads (
        id, org_id, name, company, email, phone, title, source, stage, temperature, value_inr, score,
        owner_id, next_follow_up, city, industry, notes, lost_reason, created_by, last_contact_at
      ) values (
        ${String(L.id)}, ${orgId}, ${String(L.name)}, ${String(L.company)}, ${String(L.email)}, ${String(L.phone)},
        ${String(L.title)}, ${String(L.source)}, ${stage}, ${temp}, ${value}, ${sc},
        ${stage === "new" ? aisha : owner}, ${next}, ${String(L.city)}, ${String(L.industry)}, ${String(L.notes)},
        ${stage === "lost" ? "Chose incumbent" : null}, ${actorId},
        ${stage === "new" ? null : new Date().toISOString()}
      )`;
    }

    await sql`insert into lead_activities (id, org_id, lead_id, actor_id, kind, body, next_follow_up) values
      (${nid("la")}, ${orgId}, ${"ld_resto"}, ${owner}, ${"email"}, ${"Sent proposal: KDS + inventory, 12-week delivery."}, ${d(2)}),
      (${nid("la")}, ${orgId}, ${"ld_estate"}, ${owner}, ${"call"}, ${"Walked commission rules. Legal wants SLA language."}, ${d(1)}),
      (${nid("la")}, ${orgId}, ${"ld_kiosk"}, ${aisha}, ${"follow_up"}, ${"Pilot scope agreed. Waiting on facilities date."}, ${d(-1)}),
      (${nid("la")}, ${orgId}, ${"ld_review"}, ${owner}, ${"meet"}, ${"Demoed reply copilot on two stores."}, ${d(0)})`;

    const money: Array<[string, string, number, string, string, string | null]> = [
      ["revenue", "project", 620000, ym(5), "Aarogya Hospitals — discovery + design", "ld_hospital"],
      ["revenue", "project", 740000, ym(3), "Aarogya Hospitals — appointment API", "ld_hospital"],
      ["revenue", "project", 490000, ym(1, 12), "Aarogya Hospitals — portal milestone", "ld_hospital"],
      ["revenue", "project", 890000, ym(0, 4), "Aarogya Hospitals — go-live", "ld_hospital"],
      ["revenue", "license", 120000, ym(1, 20), "Hospital OS annual license", "ld_hospital"],
      ["revenue", "retainer", 180000, ym(4), "Nava Kitchen — discovery retainer", "ld_resto"],
      ["revenue", "support", 45000, ym(2), "Hospital OS support window", "ld_hospital"],
      ["revenue", "project", 220000, ym(0, 8), "BrightBite evaluation sprint", "ld_review"],
      ["revenue", "retainer", 160000, ym(0, 6), "Harbor Brands discovery", "ld_agency"],
      ["expense", "payroll", 420000, ym(5, 28), "April payroll", null],
      ["expense", "payroll", 435000, ym(4, 28), "May payroll", null],
      ["expense", "payroll", 448000, ym(3, 28), "June payroll", null],
      ["expense", "payroll", 452000, ym(2, 28), "July payroll", null],
      ["expense", "payroll", 460000, ym(1, 28), "August payroll", null],
      ["expense", "payroll", 468000, ym(0, 1), "September payroll", null],
      ["expense", "tools", 42000, ym(0, 3), "Design + analytics stack", null],
      ["expense", "cloud", 28500, ym(0, 4), "Neon, object storage, inference", null],
      ["expense", "vendors", 64000, ym(1, 10), "HL7 contractor", null],
      ["expense", "marketing", 18000, ym(1, 6), "Partner event booth", null],
      ["expense", "office", 35000, ym(0, 2), "Bengaluru studio", null],
      ["expense", "tax", 52000, ym(2, 15), "GST installment", null],
    ];
    for (const [kind, cat, amt, date, title, leadId] of money) {
      await sql`insert into finance_entries (
        id, org_id, kind, category, amount_inr, entry_date, title, lead_id, status, created_by
      ) values (
        ${nid("fin")}, ${orgId}, ${kind}, ${cat}, ${amt}, ${date}, ${title}, ${leadId}, ${"posted"}, ${actorId}
      )`;
    }
    seeded.add(orgId);
  } catch {
    /* table may not exist until migration */
  }
}

export async function commercialBrief(sql: Sql, orgId: string): Promise<CommercialBrief | null> {
  try {
    const y = new Date().getFullYear();
    const monthStart = `${y}-${String(new Date().getMonth() + 1).padStart(2, "0")}-01`;
    const today = new Date().toISOString().slice(0, 10);
    const yearStart = `${y}-01-01`;
    const revY = await sql<{ s: number }>`select coalesce(sum(amount_inr),0)::int as s from finance_entries where org_id = ${orgId} and kind = ${"revenue"} and status = ${"posted"} and entry_date >= ${yearStart}`;
    const costY = await sql<{ s: number }>`select coalesce(sum(amount_inr),0)::int as s from finance_entries where org_id = ${orgId} and kind = ${"expense"} and status = ${"posted"} and entry_date >= ${yearStart}`;
    const revM = await sql<{ s: number }>`select coalesce(sum(amount_inr),0)::int as s from finance_entries where org_id = ${orgId} and kind = ${"revenue"} and status = ${"posted"} and entry_date >= ${monthStart}`;
    const costM = await sql<{ s: number }>`select coalesce(sum(amount_inr),0)::int as s from finance_entries where org_id = ${orgId} and kind = ${"expense"} and status = ${"posted"} and entry_date >= ${monthStart}`;
    const pipe = await sql<{ value: number; stage: string }>`select value_inr as value, stage from leads where org_id = ${orgId} and stage not in (${"won"}, ${"lost"})`;
    let pipelineOpen = 0;
    let pipelineWeighted = 0;
    for (const p of pipe) {
      pipelineOpen += Number(p.value);
      pipelineWeighted += Math.round(Number(p.value) * (STAGE_WEIGHT[asStage(p.stage)] ?? 0));
    }
    const openLeads = await sql<{ c: number }>`select count(*)::int as c from leads where org_id = ${orgId} and stage not in (${"won"}, ${"lost"})`;
    const wonMonth = await sql<{ c: number }>`select count(*)::int as c from leads where org_id = ${orgId} and stage = ${"won"} and updated_at >= ${monthStart}`;
    const overdue = await sql<{ c: number }>`select count(*)::int as c from leads where org_id = ${orgId} and stage not in (${"won"}, ${"lost"}) and next_follow_up is not null and next_follow_up < ${today}`;
    const dueToday = await sql<{ c: number }>`select count(*)::int as c from leads where org_id = ${orgId} and stage not in (${"won"}, ${"lost"}) and next_follow_up = ${today}`;
    const follow = await sql`
      select id, name, company, stage, next_follow_up, value_inr from leads
      where org_id = ${orgId} and stage not in (${"won"}, ${"lost"}) and next_follow_up is not null
      order by next_follow_up asc limit 8`;
    const revenueYtd = revY[0]?.s ?? 0;
    const costYtd = costY[0]?.s ?? 0;
    const profitYtd = revenueYtd - costYtd;
    return {
      revenueYtd,
      costYtd,
      profitYtd,
      marginPct: revenueYtd > 0 ? Math.round((profitYtd / revenueYtd) * 100) : 0,
      revenueMonth: revM[0]?.s ?? 0,
      costMonth: costM[0]?.s ?? 0,
      profitMonth: (revM[0]?.s ?? 0) - (costM[0]?.s ?? 0),
      pipelineOpen,
      pipelineWeighted,
      openLeads: openLeads[0]?.c ?? 0,
      wonMonth: wonMonth[0]?.c ?? 0,
      overdueFollowups: overdue[0]?.c ?? 0,
      dueTodayFollowups: dueToday[0]?.c ?? 0,
      followups: follow.map((r) => ({
        id: asString(r.id),
        name: asString(r.name),
        company: asString(r.company),
        stage: asStage(r.stage),
        nextFollowUp: r.next_follow_up ? String(r.next_follow_up).slice(0, 10) : null,
        valueInr: asNum(r.value_inr),
      })),
    };
  } catch {
    return null;
  }
}

export async function countOverdueFollowUps(sql: Sql, orgId: string): Promise<number> {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const rows = await sql<{ c: number }>`select count(*)::int as c from leads where org_id = ${orgId} and stage not in (${"won"}, ${"lost"}) and next_follow_up is not null and next_follow_up < ${today}`;
    return rows[0]?.c ?? 0;
  } catch {
    return 0;
  }
}

export const listLeads = createServerFn({ method: "GET" })
  .validator((data: { stage?: string; q?: string; ownerId?: string } = {}) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    requireLeadView(me.role);
    await ensureCommercialSeed(sql, org.id, me.id);
    const clauses = ["org_id = $1"];
    const params: unknown[] = [org.id];
    if (data.stage && data.stage !== "all") {
      params.push(data.stage);
      clauses.push(`stage = $${params.length}`);
    }
    if (data.ownerId) {
      params.push(data.ownerId);
      clauses.push(`owner_id = $${params.length}`);
    }
    if (data.q?.trim()) {
      params.push(`%${data.q.trim()}%`);
      clauses.push(`(name ilike $${params.length} or company ilike $${params.length} or coalesce(email,'') ilike $${params.length})`);
    }
    const rows = await sql.query(
      `select * from leads where ${clauses.join(" and ")} order by case temperature when 'hot' then 0 when 'warm' then 1 else 2 end, next_follow_up nulls last, updated_at desc`,
      params,
    );
    return rows.map(mapLead);
  });

export const getLead = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .middleware([authMiddleware])
  .handler(async ({ context, data: id }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    requireLeadView(me.role);
    const rows = await sql`select * from leads where id = ${id} and org_id = ${org.id}`;
    if (!rows[0]) return null;
    const activities = (await sql`select * from lead_activities where lead_id = ${id} order by created_at desc limit 40`).map(mapActivity);
    const money = (await sql`select * from finance_entries where lead_id = ${id} order by entry_date desc`).map(mapFinance);
    return { lead: mapLead(rows[0]), activities, money };
  });

export type LeadInput = {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  title?: string;
  source?: string;
  stage?: string;
  temperature?: string;
  valueInr?: number;
  ownerId?: string;
  nextFollowUp?: string;
  city?: string;
  website?: string;
  industry?: string;
  notes?: string;
  lostReason?: string;
};

export const createLead = createServerFn({ method: "POST" })
  .validator((data: LeadInput) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    requireLeadManage(me.role);
    const name = data.name.trim();
    if (!name) throw new Error("Name is required");
    const stage = asStage(data.stage);
    const temp = asTemp(data.temperature);
    const value = Math.max(0, Math.round(data.valueInr ?? 0));
    const next = data.nextFollowUp || null;
    const id = nid("ld");
    const sc = scoreLead(stage, temp, value, next);
    await sql`insert into leads (
      id, org_id, name, company, email, phone, title, source, stage, temperature, value_inr, score,
      owner_id, next_follow_up, city, website, industry, notes, created_by
    ) values (
      ${id}, ${org.id}, ${name}, ${data.company?.trim() ?? ""}, ${data.email?.trim().toLowerCase() || null},
      ${data.phone?.trim() || null}, ${data.title?.trim() ?? ""}, ${asSource(data.source)}, ${stage}, ${temp},
      ${value}, ${sc}, ${data.ownerId || me.id}, ${next}, ${data.city?.trim() || null}, ${data.website?.trim() || null},
      ${data.industry?.trim() || null}, ${data.notes?.trim() ?? ""}, ${me.id}
    )`;
    await writeActivity(sql, org.id, me.id, "lead", id, "created", `Opened lead ${name}`);
    await writeAudit(sql, org.id, me.id, "lead.created", "lead", id, name);
    if (data.ownerId && data.ownerId !== me.id) {
      await notify(sql, org.id, data.ownerId, "lead", "Lead assigned to you", name, `/leads/${id}`);
    }
    return { id };
  });

export const updateLead = createServerFn({ method: "POST" })
  .validator((data: LeadInput & { id: string }) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    requireLeadManage(me.role);
    const current = await sql`select * from leads where id = ${data.id} and org_id = ${org.id}`;
    if (!current[0]) throw new Error("Not found");
    const prevStage = asStage(current[0].stage);
    const stage = asStage(data.stage ?? prevStage);
    const temp = asTemp(data.temperature ?? current[0].temperature);
    const value = data.valueInr === undefined ? asNum(current[0].value_inr) : Math.max(0, Math.round(data.valueInr));
    const next = data.nextFollowUp === undefined ? (current[0].next_follow_up ? String(current[0].next_follow_up).slice(0, 10) : null) : data.nextFollowUp || null;
    const sc = scoreLead(stage, temp, value, next);
    await sql`update leads set
      name = ${data.name.trim() || asString(current[0].name)},
      company = ${data.company ?? asString(current[0].company)},
      email = ${data.email === undefined ? current[0].email : data.email.trim().toLowerCase() || null},
      phone = ${data.phone === undefined ? current[0].phone : data.phone.trim() || null},
      title = ${data.title ?? asString(current[0].title)},
      source = ${asSource(data.source ?? current[0].source)},
      stage = ${stage},
      temperature = ${temp},
      value_inr = ${value},
      score = ${sc},
      owner_id = ${data.ownerId === undefined ? current[0].owner_id : data.ownerId || null},
      next_follow_up = ${next},
      city = ${data.city === undefined ? current[0].city : data.city.trim() || null},
      website = ${data.website === undefined ? current[0].website : data.website.trim() || null},
      industry = ${data.industry === undefined ? current[0].industry : data.industry.trim() || null},
      notes = ${data.notes ?? asString(current[0].notes)},
      lost_reason = ${data.lostReason === undefined ? current[0].lost_reason : data.lostReason || null},
      updated_at = now()
      where id = ${data.id}`;
    if (stage !== prevStage) {
      await writeActivity(sql, org.id, me.id, "lead", data.id, "stage", `Moved ${asString(current[0].name)} to ${stage}`);
      if (stage === "won" && value > 0) {
        const billed = await sql`select id from finance_entries where lead_id = ${data.id} and kind = ${"revenue"} limit 1`;
        if (!billed[0] && hasPerm(me.role, "finance.manage")) {
          await sql`insert into finance_entries (
            id, org_id, kind, category, amount_inr, entry_date, title, lead_id, status, created_by
          ) values (
            ${nid("fin")}, ${org.id}, ${"revenue"}, ${"project"}, ${value}, ${new Date().toISOString().slice(0, 10)},
            ${`Won — ${asString(current[0].company) || asString(current[0].name)}`}, ${data.id}, ${"posted"}, ${me.id}
          )`;
        }
      }
    }
    return { ok: true };
  });

export const addLeadActivity = createServerFn({ method: "POST" })
  .validator((data: { leadId: string; kind?: string; body: string; nextFollowUp?: string }) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    requireLeadManage(me.role);
    const lead = await sql`select * from leads where id = ${data.leadId} and org_id = ${org.id}`;
    if (!lead[0]) throw new Error("Not found");
    const body = data.body.trim();
    if (!body) throw new Error("Write what happened");
    const id = nid("la");
    const next = data.nextFollowUp || null;
    await sql`insert into lead_activities (id, org_id, lead_id, actor_id, kind, body, next_follow_up)
      values (${id}, ${org.id}, ${data.leadId}, ${me.id}, ${asKind(data.kind)}, ${body}, ${next})`;
    const stage = asStage(lead[0].stage);
    const temp = asTemp(lead[0].temperature);
    const value = asNum(lead[0].value_inr);
    const sc = scoreLead(stage, temp, value, next);
    await sql`update leads set
      last_contact_at = now(),
      next_follow_up = ${next ?? lead[0].next_follow_up},
      score = ${sc},
      updated_at = now()
      where id = ${data.leadId}`;
    if (lead[0].owner_id && String(lead[0].owner_id) !== me.id) {
      await notify(sql, org.id, String(lead[0].owner_id), "lead", "Follow-up logged", asString(lead[0].name), `/leads/${data.leadId}`);
    }
    return { id };
  });

export const listFinance = createServerFn({ method: "GET" })
  .validator((data: { kind?: string } = {}) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    requireFinanceView(me.role);
    await ensureCommercialSeed(sql, org.id, me.id);
    const rows = data.kind
      ? await sql`select * from finance_entries where org_id = ${org.id} and kind = ${data.kind} order by entry_date desc, created_at desc`
      : await sql`select * from finance_entries where org_id = ${org.id} order by entry_date desc, created_at desc`;
    return rows.map(mapFinance);
  });

export const createFinance = createServerFn({ method: "POST" })
  .validator((data: {
    kind: FinanceKind;
    category: string;
    amountInr: number;
    entryDate: string;
    title: string;
    notes?: string;
    vendor?: string;
    leadId?: string;
    projectId?: string;
    status?: "posted" | "pending";
  }) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    requireFinanceManage(me.role);
    const title = data.title.trim();
    if (!title) throw new Error("Title is required");
    const amount = Math.round(data.amountInr);
    if (!Number.isFinite(amount) || amount === 0) throw new Error("Amount is required");
    const allowed = data.kind === "revenue" ? REVENUE_CATEGORIES : EXPENSE_CATEGORIES;
    const category = (allowed as readonly string[]).includes(data.category) ? data.category : "other";
    const id = nid("fin");
    await sql`insert into finance_entries (
      id, org_id, kind, category, amount_inr, entry_date, title, notes, vendor, lead_id, project_id, status, created_by
    ) values (
      ${id}, ${org.id}, ${data.kind}, ${category}, ${Math.abs(amount)}, ${data.entryDate}, ${title},
      ${data.notes?.trim() ?? ""}, ${data.vendor?.trim() || null}, ${data.leadId || null}, ${data.projectId || null},
      ${data.status ?? "posted"}, ${me.id}
    )`;
    await writeAudit(sql, org.id, me.id, "finance.posted", "finance", id, `${data.kind} ${title}`);
    return { id };
  });

export const getFinanceBoard = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    requireFinanceView(me.role);
    await ensureCommercialSeed(sql, org.id, me.id);
    const brief = await commercialBrief(sql, org.id);
    const entries = (await sql`select * from finance_entries where org_id = ${org.id} order by entry_date desc limit 80`).map(mapFinance);
    const byMonth = await sql<{ month: string; revenue: number; cost: number }>`
      select to_char(date_trunc('month', entry_date), 'YYYY-MM') as month,
        coalesce(sum(case when kind = 'revenue' and status = 'posted' then amount_inr else 0 end),0)::int as revenue,
        coalesce(sum(case when kind = 'expense' and status = 'posted' then amount_inr else 0 end),0)::int as cost
      from finance_entries
      where org_id = ${org.id}
      group by 1
      order by 1`;
    const byCategory = await sql<{ category: string; kind: string; amount: number }>`
      select category, kind, coalesce(sum(amount_inr),0)::int as amount
      from finance_entries
      where org_id = ${org.id} and status = ${"posted"}
      group by category, kind
      order by amount desc`;
    const byLead = await sql<{ lead_id: string; name: string; amount: number }>`
      select f.lead_id, l.company as name, coalesce(sum(f.amount_inr),0)::int as amount
      from finance_entries f
      join leads l on l.id = f.lead_id
      where f.org_id = ${org.id} and f.kind = ${"revenue"} and f.status = ${"posted"} and f.lead_id is not null
      group by f.lead_id, l.company
      order by amount desc`;
    return {
      brief,
      entries,
      byMonth: byMonth.map((r) => ({
        month: String(r.month),
        revenue: Number(r.revenue),
        cost: Number(r.cost),
        profit: Number(r.revenue) - Number(r.cost),
      })),
      byCategory: byCategory.map((r) => ({ category: String(r.category), kind: String(r.kind), amount: Number(r.amount) })),
      byLead: byLead.map((r) => ({ leadId: String(r.lead_id), name: String(r.name), amount: Number(r.amount) })),
    };
  });
