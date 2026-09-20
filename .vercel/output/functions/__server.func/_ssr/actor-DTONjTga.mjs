import { S as toIso, s as ROLES, y as nid } from "./utils-B9mDzDE2.mjs";
import { r as getSql } from "./db-CW38GPXf.mjs";
import { r as canEnroll } from "./permissions-D6YDvOLx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/actor-DTONjTga.js
function asString(v, fallback = "") {
	if (v == null) return fallback;
	return String(v);
}
function asNum(v) {
	const n = Number(v);
	return Number.isFinite(n) ? n : 0;
}
function mapOrg(r) {
	return {
		id: asString(r.id),
		name: asString(r.name),
		slug: asString(r.slug)
	};
}
function asRole(v) {
	const s = asString(v, "employee");
	return ROLES.includes(s) ? s : "employee";
}
function asStatus(v) {
	if (v === "disabled" || v === "invited") return v;
	return "active";
}
function mapProfile(r) {
	return {
		id: asString(r.id),
		orgId: asString(r.org_id),
		userId: r.user_id ? asString(r.user_id) : null,
		email: r.email ? asString(r.email) : null,
		displayName: asString(r.display_name),
		title: asString(r.title, "Member"),
		role: asRole(r.role),
		status: asStatus(r.status),
		avatarKey: asString(r.avatar_key, "slate"),
		lastSeenAt: r.last_seen_at ? toIso(r.last_seen_at) : null,
		createdAt: toIso(r.created_at),
		employeeCode: r.employee_code ? asString(r.employee_code) : null,
		phone: r.phone ? asString(r.phone) : null,
		gender: r.gender ? asString(r.gender) : null,
		dob: r.dob ? asString(r.dob) : null,
		emergencyContact: r.emergency_contact ? asString(r.emergency_contact) : null,
		employmentType: asString(r.employment_type, "full_time") || "full_time",
		location: r.location ? asString(r.location) : null,
		workEmail: r.work_email ? asString(r.work_email) : null,
		username: r.username ? asString(r.username) : null,
		bio: asString(r.bio),
		skills: asString(r.skills).split(",").map((s) => s.trim()).filter(Boolean),
		notes: asString(r.notes),
		managerId: r.manager_id ? asString(r.manager_id) : null,
		teamLeadId: r.team_lead_id ? asString(r.team_lead_id) : null,
		departmentId: r.department_id ? asString(r.department_id) : null,
		teamId: r.team_id ? asString(r.team_id) : null,
		joiningDate: r.joining_date ? asString(r.joining_date) : null
	};
}
function mapDepartment(r) {
	return {
		id: asString(r.id),
		orgId: asString(r.org_id),
		name: asString(r.name),
		description: asString(r.description),
		headId: r.head_id ? asString(r.head_id) : null
	};
}
function mapAnnouncement(r) {
	return {
		id: asString(r.id),
		authorId: r.author_id ? asString(r.author_id) : null,
		title: asString(r.title),
		body: asString(r.body),
		scope: asString(r.scope, "company"),
		createdAt: toIso(r.created_at)
	};
}
function mapTeam(r, memberIds = []) {
	return {
		id: asString(r.id),
		orgId: asString(r.org_id),
		name: asString(r.name),
		description: asString(r.description),
		leadId: r.lead_id ? asString(r.lead_id) : null,
		departmentId: r.department_id ? asString(r.department_id) : null,
		memberIds
	};
}
function mapProject(r, memberIds = []) {
	const total = asNum(r.task_total);
	const done = asNum(r.task_done);
	return {
		id: asString(r.id),
		orgId: asString(r.org_id),
		name: asString(r.name),
		description: asString(r.description),
		ownerId: r.owner_id ? asString(r.owner_id) : null,
		teamId: r.team_id ? asString(r.team_id) : null,
		status: r.status ?? "active",
		priority: r.priority ?? "medium",
		startDate: r.start_date ? asString(r.start_date) : null,
		dueDate: r.due_date ? asString(r.due_date) : null,
		colorKey: asString(r.color_key, "mist"),
		createdAt: toIso(r.created_at),
		memberIds,
		taskTotal: total,
		taskDone: done,
		progress: total > 0 ? Math.round(done / total * 100) : 0
	};
}
function mapTask(r) {
	const status = asString(r.status, "todo") || "todo";
	return {
		id: asString(r.id),
		orgId: asString(r.org_id),
		projectId: r.project_id ? asString(r.project_id) : null,
		parentId: r.parent_id ? asString(r.parent_id) : null,
		title: asString(r.title),
		description: asString(r.description),
		creatorId: r.creator_id ? asString(r.creator_id) : null,
		assigneeId: r.assignee_id ? asString(r.assignee_id) : null,
		teamId: r.team_id ? asString(r.team_id) : null,
		status,
		priority: r.priority ?? "medium",
		startDate: r.start_date ? asString(r.start_date) : null,
		dueDate: r.due_date ? asString(r.due_date) : null,
		estimatedMinutes: asNum(r.estimated_minutes),
		actualMinutes: asNum(r.actual_minutes),
		blocked: Boolean(r.blocked) || status === "blocked",
		blockedReason: asString(r.blocked_reason),
		tags: asString(r.tags).split(",").map((s) => s.trim()).filter(Boolean),
		createdAt: toIso(r.created_at),
		updatedAt: toIso(r.updated_at),
		checklistTotal: asNum(r.checklist_total),
		checklistDone: asNum(r.checklist_done),
		commentCount: asNum(r.comment_count),
		subtaskCount: asNum(r.subtask_count)
	};
}
function mapMilestone(r) {
	return {
		id: asString(r.id),
		projectId: asString(r.project_id),
		title: asString(r.title),
		dueDate: r.due_date ? asString(r.due_date) : null,
		status: r.status === "done" ? "done" : "open"
	};
}
function mapComment(r) {
	return {
		id: asString(r.id),
		taskId: asString(r.task_id),
		authorId: r.author_id ? asString(r.author_id) : null,
		body: asString(r.body),
		createdAt: toIso(r.created_at)
	};
}
function mapChecklist(r) {
	return {
		id: asString(r.id),
		taskId: asString(r.task_id),
		title: asString(r.title),
		done: Boolean(r.done),
		position: asNum(r.position)
	};
}
function mapChannel(r, unread = 0) {
	const type = asString(r.type, "company");
	return {
		id: asString(r.id),
		orgId: asString(r.org_id),
		type,
		name: asString(r.name),
		projectId: r.project_id ? asString(r.project_id) : null,
		teamId: r.team_id ? asString(r.team_id) : null,
		unread
	};
}
function mapMessage(r, reactions = []) {
	return {
		id: asString(r.id),
		channelId: asString(r.channel_id),
		authorId: r.author_id ? asString(r.author_id) : null,
		body: asString(r.body),
		parentId: r.parent_id ? asString(r.parent_id) : null,
		createdAt: toIso(r.created_at),
		editedAt: r.edited_at ? toIso(r.edited_at) : null,
		reactions
	};
}
function mapAttachment(r) {
	return {
		id: asString(r.id),
		name: asString(r.name),
		mime: asString(r.mime),
		sizeBytes: asNum(r.size_bytes),
		projectId: r.project_id ? asString(r.project_id) : null,
		taskId: r.task_id ? asString(r.task_id) : null,
		messageId: r.message_id ? asString(r.message_id) : null,
		uploadedBy: r.uploaded_by ? asString(r.uploaded_by) : null,
		createdAt: toIso(r.created_at)
	};
}
function mapNotification(r) {
	return {
		id: asString(r.id),
		type: asString(r.type),
		title: asString(r.title),
		body: asString(r.body),
		href: asString(r.href),
		read: Boolean(r.read),
		createdAt: toIso(r.created_at)
	};
}
function mapTime(r) {
	return {
		id: asString(r.id),
		profileId: asString(r.profile_id),
		taskId: r.task_id ? asString(r.task_id) : null,
		startedAt: toIso(r.started_at),
		endedAt: r.ended_at ? toIso(r.ended_at) : null,
		minutes: asNum(r.minutes),
		note: asString(r.note)
	};
}
function mapEvent(r) {
	return {
		id: asString(r.id),
		title: asString(r.title),
		startsAt: toIso(r.starts_at),
		endsAt: toIso(r.ends_at),
		type: asString(r.type, "meeting"),
		projectId: r.project_id ? asString(r.project_id) : null
	};
}
function mapActivity(r) {
	return {
		id: asString(r.id),
		actorId: r.actor_id ? asString(r.actor_id) : null,
		entityType: asString(r.entity_type),
		entityId: asString(r.entity_id),
		action: asString(r.action),
		summary: asString(r.summary),
		createdAt: toIso(r.created_at)
	};
}
var TASK_SELECT = `
  t.*,
  (select count(*)::int from checklist_items c where c.task_id = t.id) as checklist_total,
  (select count(*)::int from checklist_items c where c.task_id = t.id and c.done) as checklist_done,
  (select count(*)::int from comments c where c.task_id = t.id) as comment_count,
  (select count(*)::int from tasks s where s.parent_id = t.id) as subtask_count
`;
function day(offset) {
	const d = /* @__PURE__ */ new Date();
	d.setDate(d.getDate() + offset);
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function ago(hours) {
	return (/* @__PURE__ */ new Date(Date.now() - hours * 36e5)).toISOString();
}
function atHour(offsetDays, hour, minute = 0) {
	const d = /* @__PURE__ */ new Date();
	d.setDate(d.getDate() + offsetDays);
	d.setHours(hour, minute, 0, 0);
	return d.toISOString();
}
async function seedOrganization(sql, orgId, ceoId, ceoName) {
	if ((await sql`select id from projects where org_id = ${orgId} limit 1`)[0]) return;
	const depAi = "dep_ai";
	const depEng = "dep_eng";
	const depDesign = "dep_design";
	const depOps = "dep_ops";
	const depMkt = "dep_mkt";
	const depSales = "dep_sales";
	const depFin = "dep_fin";
	const depHr = "dep_hr";
	await sql`insert into departments (id, org_id, name, description) values
    (${depAi}, ${orgId}, ${"AI & Automation"}, ${"Applied research, copilots and operational automation."}),
    (${depEng}, ${orgId}, ${"Software Development"}, ${"Product engineering across web, API and platform."}),
    (${depDesign}, ${orgId}, ${"Design"}, ${"Product, brand and interface design."}),
    (${depOps}, ${orgId}, ${"Operations"}, ${"Delivery, facilities and internal systems."}),
    (${depMkt}, ${orgId}, ${"Marketing"}, ${"Brand, growth and communications."}),
    (${depSales}, ${orgId}, ${"Sales"}, ${"Pipeline, accounts and partnerships."}),
    (${depFin}, ${orgId}, ${"Finance"}, ${"Planning, billing and controls."}),
    (${depHr}, ${orgId}, ${"HR"}, ${"People operations and enrollment."})`;
	for (const p of [
		{
			id: "seed_kiran",
			name: "Kiran Rao",
			title: "Founder & Director",
			role: "founder",
			avatar: "ink",
			email: "kiran@tronx.dev",
			code: "TX-1002",
			phone: "+91 98000 10002",
			location: "Bengaluru",
			skills: "strategy,product,partnerships",
			bio: "Co-builds the company agenda with the CEO. Protects focus."
		},
		{
			id: "seed_maya",
			name: "Maya Shah",
			title: "Engineering Manager",
			role: "manager",
			avatar: "dusk",
			email: "maya@tronx.dev",
			code: "TX-1003",
			phone: "+91 98000 10003",
			location: "Bengaluru",
			skills: "engineering,delivery,mentoring",
			bio: "Runs software delivery across hospital, restaurant and estate."
		},
		{
			id: "seed_aisha",
			name: "Aisha Khan",
			title: "Product Manager",
			role: "manager",
			avatar: "pine",
			email: "aisha@tronx.dev",
			code: "TX-1004",
			phone: "+91 98000 10004",
			location: "Hyderabad",
			skills: "product,growth,analytics",
			bio: "Owns review automation and the real-estate pipeline."
		},
		{
			id: "seed_prakash",
			name: "Prakash",
			title: "Engineering Lead",
			role: "team_lead",
			avatar: "slate",
			email: "prakash@tronx.dev",
			code: "TX-1005",
			phone: "+91 98000 10005",
			location: "Bengaluru",
			skills: "backend,architecture,api",
			bio: "Leads the MERN team on hospital and restaurant platforms."
		},
		{
			id: "seed_jordan",
			name: "Jordan Hale",
			title: "Design Lead",
			role: "team_lead",
			avatar: "sand",
			email: "jordan@tronx.dev",
			code: "TX-1006",
			phone: "+91 98000 10006",
			location: "Remote",
			skills: "product-design,systems,brand",
			bio: "Holds the visual system and design quality bar."
		},
		{
			id: "seed_hemanth",
			name: "Hemanth",
			title: "Backend Engineer",
			role: "employee",
			avatar: "stone",
			email: "hemanth@tronx.dev",
			code: "TX-1007",
			phone: "+91 98000 10007",
			location: "Bengaluru",
			skills: "postgres,node,integrations",
			bio: "Appointment APIs, identity and clinic integrations."
		},
		{
			id: "seed_infran",
			name: "Infran",
			title: "Full-stack Engineer",
			role: "employee",
			avatar: "zinc",
			email: "infran@tronx.dev",
			code: "TX-1008",
			phone: "+91 98000 10008",
			location: "Chennai",
			skills: "react,node,kds",
			bio: "Kitchen display, HL7 adapter and viewing scheduler."
		},
		{
			id: "seed_harsha",
			name: "Harsha",
			title: "Product Designer",
			role: "employee",
			avatar: "sand",
			email: "harsha@tronx.dev",
			code: "TX-1009",
			phone: "+91 98000 10009",
			location: "Bengaluru",
			skills: "ui,a11y,motion",
			bio: "Patient portal, menu builder and kiosk attract loop."
		},
		{
			id: "seed_faiziya",
			name: "Faiziya",
			title: "AI Engineer",
			role: "employee",
			avatar: "dusk",
			email: "faiziya@tronx.dev",
			code: "TX-1010",
			phone: "+91 98000 10010",
			location: "Bengaluru",
			skills: "llm,eval,voice",
			bio: "Reply copilot, kiosk voice and occupancy vision."
		},
		{
			id: "seed_ravi",
			name: "Ravi",
			title: "Frontend Engineer",
			role: "employee",
			avatar: "ink",
			email: "ravi@tronx.dev",
			code: "TX-1011",
			phone: "+91 98000 10011",
			location: "Pune",
			skills: "react,typescript,charts",
			bio: "Ward board, reputation dashboard, inventory UI."
		},
		{
			id: "seed_lena",
			name: "Lena Ortiz",
			title: "Operations Lead",
			role: "team_lead",
			avatar: "mist",
			email: "lena@tronx.dev",
			code: "TX-1012",
			phone: "+91 98000 10012",
			location: "Bengaluru",
			skills: "ops,vendor,process",
			bio: "Keeps delivery, vendors and internal systems moving."
		},
		{
			id: "seed_noah",
			name: "Noah Kim",
			title: "Marketing Associate",
			role: "employee",
			avatar: "pine",
			email: "noah@tronx.dev",
			code: "TX-1013",
			phone: "+91 98000 10013",
			location: "Remote",
			skills: "content,campaigns,brand",
			bio: "Campaigns around restaurant SaaS and review automation."
		}
	]) await sql`insert into profiles (
      id, org_id, email, work_email, display_name, title, role, avatar_key, last_seen_at,
      employee_code, phone, employment_type, location, skills, bio, joining_date, status
    ) values (
      ${p.id}, ${orgId}, ${p.email}, ${p.email}, ${p.name}, ${p.title}, ${p.role}, ${p.avatar}, ${ago(Math.random() * 8)},
      ${p.code}, ${p.phone}, ${"full_time"}, ${p.location}, ${p.skills}, ${p.bio}, ${day(-180)}, ${"active"}
    )`;
	await sql`update profiles set bio = ${"Sets the company direction and owns the operating cadence."},
    skills = ${"leadership,product,operations"}, location = ${"Bengaluru"}, employment_type = ${"full_time"}
    where id = ${ceoId}`;
	const kiran = "seed_kiran";
	const maya = "seed_maya";
	const aisha = "seed_aisha";
	const prakash = "seed_prakash";
	const jordan = "seed_jordan";
	const hemanth = "seed_hemanth";
	const infran = "seed_infran";
	const harsha = "seed_harsha";
	const faiziya = "seed_faiziya";
	const ravi = "seed_ravi";
	const lena = "seed_lena";
	const noah = "seed_noah";
	await sql`update departments set head_id = ${faiziya} where id = ${depAi}`;
	await sql`update departments set head_id = ${maya} where id = ${depEng}`;
	await sql`update departments set head_id = ${jordan} where id = ${depDesign}`;
	await sql`update departments set head_id = ${lena} where id = ${depOps}`;
	await sql`update departments set head_id = ${noah} where id = ${depMkt}`;
	await sql`update departments set head_id = ${aisha} where id = ${depSales}`;
	await sql`update departments set head_id = ${kiran} where id = ${depFin}`;
	await sql`update departments set head_id = ${kiran} where id = ${depHr}`;
	await sql`update profiles set department_id = ${depEng}, manager_id = ${ceoId} where id = ${maya}`;
	await sql`update profiles set department_id = ${depSales}, manager_id = ${ceoId} where id = ${aisha}`;
	await sql`update profiles set department_id = ${depEng}, manager_id = ${maya}, team_lead_id = ${prakash} where id in (${prakash}, ${hemanth}, ${infran}, ${ravi})`;
	await sql`update profiles set department_id = ${depDesign}, manager_id = ${maya}, team_lead_id = ${jordan} where id in (${jordan}, ${harsha})`;
	await sql`update profiles set department_id = ${depAi}, manager_id = ${maya}, team_lead_id = ${prakash} where id = ${faiziya}`;
	await sql`update profiles set department_id = ${depOps}, manager_id = ${kiran} where id = ${lena}`;
	await sql`update profiles set department_id = ${depMkt}, manager_id = ${aisha} where id = ${noah}`;
	await sql`update profiles set department_id = ${depFin}, manager_id = ${ceoId} where id = ${kiran}`;
	await sql`update profiles set department_id = ${depEng} where id = ${ceoId}`;
	const eng = "seed_team_eng";
	const design = "seed_team_design";
	const ai = "seed_team_ai";
	const ops = "seed_team_ops";
	await sql`insert into teams (id, org_id, name, description, lead_id, department_id) values
    (${eng}, ${orgId}, ${"MERN Team"}, ${"Hospital, restaurant and estate platforms."}, ${prakash}, ${depEng}),
    (${design}, ${orgId}, ${"Product Design"}, ${"Interface, brand and design systems."}, ${jordan}, ${depDesign}),
    (${ai}, ${orgId}, ${"Applied AI"}, ${"Copilots, kiosk and automation."}, ${faiziya}, ${depAi}),
    (${ops}, ${orgId}, ${"Ops Desk"}, ${"Internal delivery and vendor ops."}, ${lena}, ${depOps})`;
	const teamMembers = [
		[eng, ceoId],
		[eng, maya],
		[eng, prakash],
		[eng, hemanth],
		[eng, infran],
		[eng, ravi],
		[design, harsha],
		[design, jordan],
		[design, ceoId],
		[ai, faiziya],
		[ai, ceoId],
		[ai, prakash],
		[ops, lena],
		[ops, kiran]
	];
	for (const [tid, pid] of teamMembers) await sql`insert into team_members (team_id, profile_id) values (${tid}, ${pid})`;
	await sql`update profiles set team_id = ${eng} where id in (${maya}, ${prakash}, ${hemanth}, ${infran}, ${ravi}, ${ceoId})`;
	await sql`update profiles set team_id = ${design} where id in (${jordan}, ${harsha})`;
	await sql`update profiles set team_id = ${ai} where id = ${faiziya}`;
	await sql`update profiles set team_id = ${ops} where id in (${lena}, ${kiran})`;
	const hospital = "seed_prj_hospital";
	const restaurant = "seed_prj_restaurant";
	const reviews = "seed_prj_reviews";
	const kiosk = "seed_prj_kiosk";
	const estate = "seed_prj_estate";
	await sql`insert into projects (id, org_id, name, description, owner_id, team_id, status, priority, start_date, due_date, color_key) values
    (${hospital}, ${orgId}, ${"Hospital Management Platform"}, ${"Patient portal, appointments, EHR integrations and ward operations for multi-clinic networks."}, ${ceoId}, ${eng}, ${"active"}, ${"urgent"}, ${day(-40)}, ${day(28)}, ${"mist"}),
    (${restaurant}, ${orgId}, ${"Restaurant SaaS"}, ${"Orders, KDS, inventory and analytics for restaurant groups."}, ${prakash}, ${eng}, ${"active"}, ${"high"}, ${day(-32)}, ${day(21)}, ${"dusk"}),
    (${reviews}, ${orgId}, ${"Google Review Automation"}, ${"Review collection, response drafts and reputation analytics."}, ${aisha}, ${ai}, ${"active"}, ${"high"}, ${day(-24)}, ${day(14)}, ${"pine"}),
    (${kiosk}, ${orgId}, ${"AI Kiosk"}, ${"In-venue assistant kiosk with voice, vision and queue management."}, ${faiziya}, ${ai}, ${"active"}, ${"medium"}, ${day(-18)}, ${day(45)}, ${"sand"}),
    (${estate}, ${orgId}, ${"Real Estate Platform"}, ${"Listings, agent CRM, viewing scheduler and document vault."}, ${prakash}, ${eng}, ${"planning"}, ${"medium"}, ${day(-6)}, ${day(60)}, ${"slate"})`;
	const allPeople = [
		ceoId,
		kiran,
		maya,
		aisha,
		prakash,
		jordan,
		hemanth,
		infran,
		harsha,
		faiziya,
		ravi,
		lena,
		noah
	];
	for (const pid of allPeople) for (const prj of [
		hospital,
		restaurant,
		reviews
	]) await sql`insert into project_members (project_id, profile_id) values (${prj}, ${pid}) on conflict do nothing`;
	for (const pid of [
		ceoId,
		faiziya,
		prakash,
		harsha,
		ravi,
		maya
	]) await sql`insert into project_members (project_id, profile_id) values (${kiosk}, ${pid}) on conflict do nothing`;
	for (const pid of [
		ceoId,
		prakash,
		infran,
		aisha,
		harsha,
		maya
	]) await sql`insert into project_members (project_id, profile_id) values (${estate}, ${pid}) on conflict do nothing`;
	await sql`insert into milestones (id, project_id, title, due_date, status) values
    (${"ms_h1"}, ${hospital}, ${"Patient portal beta"}, ${day(-4)}, ${"done"}),
    (${"ms_h2"}, ${hospital}, ${"Appointment API live"}, ${day(3)}, ${"open"}),
    (${"ms_h3"}, ${hospital}, ${"EHR integration"}, ${day(18)}, ${"open"}),
    (${"ms_r1"}, ${restaurant}, ${"Orders MVP"}, ${day(-2)}, ${"done"}),
    (${"ms_r2"}, ${restaurant}, ${"KDS rollout"}, ${day(9)}, ${"open"}),
    (${"ms_g1"}, ${reviews}, ${"Reply copilot"}, ${day(6)}, ${"open"}),
    (${"ms_k1"}, ${kiosk}, ${"Voice prototype"}, ${day(12)}, ${"open"}),
    (${"ms_e1"}, ${estate}, ${"Listings schema"}, ${day(20)}, ${"open"})`;
	const tasks = [
		{
			id: "t_h_portal",
			project: hospital,
			title: "Hospital patient portal",
			desc: "Patient-facing portal for appointments, records and prescriptions.",
			assignee: ceoId,
			status: "in_review",
			priority: "urgent",
			due: 0,
			est: 960,
			act: 840,
			tags: "frontend,portal"
		},
		{
			id: "t_h_api",
			project: hospital,
			title: "Patient appointment API",
			desc: "REST endpoints for booking, reschedule, cancel and slot search. Validation required before 6 PM.",
			assignee: hemanth,
			status: "in_progress",
			priority: "urgent",
			due: 0,
			est: 480,
			act: 300,
			tags: "backend,api"
		},
		{
			id: "t_h_valid",
			project: hospital,
			title: "Appointment request validation",
			desc: "Server-side validation for slots, insurance and overlapping bookings.",
			assignee: hemanth,
			status: "todo",
			priority: "high",
			due: 1,
			est: 240,
			act: 0,
			tags: "backend"
		},
		{
			id: "t_h_ehr",
			project: hospital,
			title: "EHR HL7 adapter",
			desc: "Inbound/outbound HL7 mapping for patient demographics.",
			assignee: infran,
			status: "blocked",
			priority: "high",
			due: 5,
			est: 720,
			act: 240,
			tags: "integration",
			blocked: "Waiting on clinic VPN credentials"
		},
		{
			id: "t_h_ui",
			project: hospital,
			title: "Ward operations board",
			desc: "Realtime board for bed occupancy and nurse assignments.",
			assignee: ravi,
			status: "todo",
			priority: "medium",
			due: 8,
			est: 360,
			act: 0,
			tags: "frontend"
		},
		{
			id: "t_h_auth",
			project: hospital,
			title: "Patient identity verification",
			desc: "OTP + ID document check for first-time portal access.",
			assignee: prakash,
			status: "completed",
			priority: "high",
			due: -6,
			est: 400,
			act: 420,
			tags: "security"
		},
		{
			id: "t_h_rx",
			project: hospital,
			title: "Prescription refill flow",
			desc: "Refill requests routed to the assigned physician.",
			assignee: ceoId,
			status: "changes_requested",
			priority: "high",
			due: 2,
			est: 320,
			act: 180,
			tags: "frontend"
		},
		{
			id: "t_h_qa",
			project: hospital,
			title: "Portal accessibility pass",
			desc: "WCAG AA pass on patient-facing screens.",
			assignee: harsha,
			status: "in_review",
			priority: "medium",
			due: 1,
			est: 180,
			act: 160,
			tags: "design,a11y"
		},
		{
			id: "t_h_lab",
			project: hospital,
			title: "Lab results timeline",
			desc: "Chronological lab results with downloadable PDFs.",
			assignee: ravi,
			status: "backlog",
			priority: "low",
			due: 14,
			est: 280,
			act: 0,
			tags: "frontend"
		},
		{
			id: "t_r_orders",
			project: restaurant,
			title: "Restaurant order API",
			desc: "Create, pay and route dine-in and takeaway orders.",
			assignee: prakash,
			status: "in_progress",
			priority: "urgent",
			due: 0,
			est: 600,
			act: 400,
			tags: "backend,api"
		},
		{
			id: "t_r_kds",
			project: restaurant,
			title: "Kitchen display system",
			desc: "Ticket routing, bump, recall and station filters.",
			assignee: infran,
			status: "in_progress",
			priority: "high",
			due: 4,
			est: 520,
			act: 200,
			tags: "frontend,kds"
		},
		{
			id: "t_r_auth",
			project: restaurant,
			title: "Staff PIN authentication",
			desc: "Device-local PIN with role-aware POS permissions.",
			assignee: hemanth,
			status: "completed",
			priority: "high",
			due: -8,
			est: 240,
			act: 250,
			tags: "security"
		},
		{
			id: "t_r_menu",
			project: restaurant,
			title: "Menu builder",
			desc: "Modifiers, availability windows and photo pipeline.",
			assignee: harsha,
			status: "in_review",
			priority: "medium",
			due: 2,
			est: 300,
			act: 220,
			tags: "design,frontend"
		},
		{
			id: "t_r_inv",
			project: restaurant,
			title: "Inventory depletion",
			desc: "Auto-decrement stock from KDS completion events.",
			assignee: ravi,
			status: "todo",
			priority: "medium",
			due: 7,
			est: 360,
			act: 0,
			tags: "backend"
		},
		{
			id: "t_r_an",
			project: restaurant,
			title: "Restaurant analytics v1",
			desc: "Hourly covers, item mix, voids and average ticket.",
			assignee: ceoId,
			status: "todo",
			priority: "low",
			due: 12,
			est: 400,
			act: 0,
			tags: "analytics"
		},
		{
			id: "t_r_pay",
			project: restaurant,
			title: "Split tender payments",
			desc: "Card + cash + voucher on a single check.",
			assignee: infran,
			status: "backlog",
			priority: "medium",
			due: 16,
			est: 280,
			act: 0,
			tags: "payments"
		},
		{
			id: "t_g_collect",
			project: reviews,
			title: "Review request journeys",
			desc: "SMS/email journeys timed after fulfilled orders.",
			assignee: aisha,
			status: "completed",
			priority: "high",
			due: -3,
			est: 240,
			act: 230,
			tags: "growth"
		},
		{
			id: "t_g_draft",
			project: reviews,
			title: "Reply copilot",
			desc: "Draft public replies in brand voice with sentiment guardrails.",
			assignee: faiziya,
			status: "in_progress",
			priority: "high",
			due: 1,
			est: 480,
			act: 300,
			tags: "ai"
		},
		{
			id: "t_g_dash",
			project: reviews,
			title: "Reputation dashboard",
			desc: "Location-level rating trend and topic clusters.",
			assignee: ravi,
			status: "in_review",
			priority: "medium",
			due: 3,
			est: 320,
			act: 280,
			tags: "frontend,analytics"
		},
		{
			id: "t_g_mod",
			project: reviews,
			title: "Moderation queue",
			desc: "Flag reviews that need a human before auto-reply.",
			assignee: ceoId,
			status: "todo",
			priority: "high",
			due: 0,
			est: 200,
			act: 0,
			tags: "ops"
		},
		{
			id: "t_g_lang",
			project: reviews,
			title: "Multilingual replies",
			desc: "Detect review language and draft in-kind.",
			assignee: faiziya,
			status: "backlog",
			priority: "low",
			due: 20,
			est: 360,
			act: 0,
			tags: "ai"
		},
		{
			id: "t_k_voice",
			project: kiosk,
			title: "Kiosk wake-word + barge-in",
			desc: "Local wake-word with interruption handling.",
			assignee: faiziya,
			status: "in_progress",
			priority: "high",
			due: 6,
			est: 600,
			act: 180,
			tags: "ai,voice"
		},
		{
			id: "t_k_ui",
			project: kiosk,
			title: "Kiosk attract loop",
			desc: "Idle motion, language picker, high-contrast mode.",
			assignee: harsha,
			status: "todo",
			priority: "medium",
			due: 8,
			est: 280,
			act: 0,
			tags: "design"
		},
		{
			id: "t_k_q",
			project: kiosk,
			title: "Queue ticket printer",
			desc: "Print + SMS ticket with estimated wait.",
			assignee: hemanth,
			status: "todo",
			priority: "medium",
			due: 11,
			est: 240,
			act: 0,
			tags: "hardware"
		},
		{
			id: "t_k_vis",
			project: kiosk,
			title: "Vision occupancy estimate",
			desc: "Anonymous headcount to feed wait-time model.",
			assignee: faiziya,
			status: "blocked",
			priority: "low",
			due: 30,
			est: 480,
			act: 0,
			tags: "ai,vision",
			blocked: "Legal review of camera policy"
		},
		{
			id: "t_e_list",
			project: estate,
			title: "Listings data model",
			desc: "Property, unit, media and amenity schema.",
			assignee: prakash,
			status: "in_progress",
			priority: "high",
			due: 4,
			est: 320,
			act: 80,
			tags: "backend"
		},
		{
			id: "t_e_crm",
			project: estate,
			title: "Agent CRM pipeline",
			desc: "Lead stages, viewing notes and follow-ups.",
			assignee: aisha,
			status: "todo",
			priority: "medium",
			due: 10,
			est: 400,
			act: 0,
			tags: "product"
		},
		{
			id: "t_e_cal",
			project: estate,
			title: "Viewing scheduler",
			desc: "Public booking page with agent buffers.",
			assignee: infran,
			status: "backlog",
			priority: "medium",
			due: 18,
			est: 360,
			act: 0,
			tags: "frontend"
		},
		{
			id: "t_e_docs",
			project: estate,
			title: "Document vault",
			desc: "Offer letters, KYC packs, e-sign status.",
			assignee: ceoId,
			status: "backlog",
			priority: "low",
			due: 24,
			est: 440,
			act: 0,
			tags: "docs"
		}
	];
	for (const t of tasks) await sql`insert into tasks (
      id, org_id, project_id, title, description, creator_id, assignee_id, team_id,
      status, priority, start_date, due_date, estimated_minutes, actual_minutes,
      blocked, blocked_reason, tags, created_at, updated_at
    ) values (
      ${t.id}, ${orgId}, ${t.project}, ${t.title}, ${t.desc}, ${maya}, ${t.assignee}, ${eng},
      ${t.status}, ${t.priority}, ${day(t.due - 6)}, ${day(t.due)}, ${t.est}, ${t.act},
      ${Boolean(t.blocked)}, ${t.blocked ?? ""}, ${t.tags}, ${ago(40 - t.due)}, ${ago(Math.max(1, 8 - t.due))}
    )`;
	await sql`insert into tasks (id, org_id, project_id, parent_id, title, description, creator_id, assignee_id, status, priority, due_date, estimated_minutes, tags)
    values
    (${"t_h_api_slots"}, ${orgId}, ${hospital}, ${"t_h_api"}, ${"Slot search by physician"}, ${""}, ${prakash}, ${hemanth}, ${"in_progress"}, ${"high"}, ${day(0)}, ${120}, ${"backend"}),
    (${"t_h_api_book"}, ${orgId}, ${hospital}, ${"t_h_api"}, ${"Create booking + conflict check"}, ${""}, ${prakash}, ${hemanth}, ${"todo"}, ${"urgent"}, ${day(0)}, ${120}, ${"backend"}),
    (${"t_h_portal_home"}, ${orgId}, ${hospital}, ${"t_h_portal"}, ${"Home dashboard widgets"}, ${""}, ${jordan}, ${ravi}, ${"completed"}, ${"medium"}, ${day(-1)}, ${80}, ${"frontend"})`;
	await sql`insert into task_dependencies (task_id, depends_on_id) values
    (${"t_h_valid"}, ${"t_h_api"}),
    (${"t_r_inv"}, ${"t_r_kds"}),
    (${"t_e_cal"}, ${"t_e_list"})`;
	const checks = [
		[
			"t_h_api",
			"OpenAPI spec merged",
			true
		],
		[
			"t_h_api",
			"Slot search with timezone",
			true
		],
		[
			"t_h_api",
			"Overlap validation",
			false
		],
		[
			"t_h_api",
			"Insurance eligibility hook",
			false
		],
		[
			"t_h_portal",
			"Appointments list",
			true
		],
		[
			"t_h_portal",
			"Records viewer",
			true
		],
		[
			"t_h_portal",
			"Empty states",
			false
		],
		[
			"t_r_kds",
			"Ticket grouping",
			true
		],
		[
			"t_r_kds",
			"Bump + recall",
			false
		],
		[
			"t_g_draft",
			"Tone presets",
			true
		],
		[
			"t_g_draft",
			"Hallucination filter",
			false
		]
	];
	let ci = 0;
	for (const [taskId, title, done] of checks) {
		ci += 1;
		await sql`insert into checklist_items (id, task_id, title, done, position)
      values (${`chk_${ci}`}, ${taskId}, ${title}, ${done}, ${ci})`;
	}
	await sql`insert into comments (id, org_id, task_id, author_id, body, created_at) values
    (${"c1"}, ${orgId}, ${"t_h_api"}, ${maya}, ${"@Hemanth please finish patient appointment API by 6 PM."}, ${ago(5)}),
    (${"c2"}, ${orgId}, ${"t_h_api"}, ${hemanth}, ${"Working on it. Slot search is in review."}, ${ago(4.2)}),
    (${"c3"}, ${orgId}, ${"t_h_api"}, ${prakash}, ${"Great. Please also add validation."}, ${ago(3.8)}),
    (${"c4"}, ${orgId}, ${"t_h_ehr"}, ${infran}, ${"Blocked on clinic VPN. Raised with ops."}, ${ago(9)}),
    (${"c5"}, ${orgId}, ${"t_r_orders"}, ${prakash}, ${"Need the tax-inclusive price flag before we lock the receipt."}, ${ago(7)}),
    (${"c6"}, ${orgId}, ${"t_g_draft"}, ${faiziya}, ${"Guardrail evals look good on the last 200 reviews."}, ${ago(2)})`;
	const chGeneral = "seed_ch_general";
	const chDev = "seed_ch_dev";
	const chAi = "seed_ch_ai";
	const chDesign = "seed_ch_design";
	const chHosp = "seed_ch_hospital";
	const chRest = "seed_ch_restaurant";
	const chEngDep = "seed_ch_engdep";
	await sql`insert into channels (id, org_id, type, name, project_id, team_id, department_id) values
    (${chGeneral}, ${orgId}, ${"company"}, ${"general"}, ${null}, ${null}, ${null}),
    (${chDev}, ${orgId}, ${"team"}, ${"mern-team"}, ${null}, ${eng}, ${null}),
    (${chAi}, ${orgId}, ${"team"}, ${"applied-ai"}, ${null}, ${ai}, ${null}),
    (${chDesign}, ${orgId}, ${"team"}, ${"design"}, ${null}, ${design}, ${null}),
    (${chEngDep}, ${orgId}, ${"department"}, ${"engineering"}, ${null}, ${null}, ${depEng}),
    (${chHosp}, ${orgId}, ${"project"}, ${"hospital-platform"}, ${hospital}, ${null}, ${null}),
    (${chRest}, ${orgId}, ${"project"}, ${"restaurant-platform"}, ${restaurant}, ${null}, ${null})`;
	for (const ch of [
		chGeneral,
		chDev,
		chAi,
		chDesign,
		chHosp,
		chRest,
		chEngDep
	]) for (const pid of allPeople) await sql`insert into channel_members (channel_id, profile_id, last_read_at)
        values (${ch}, ${pid}, ${ago(6)}) on conflict do nothing`;
	const msgs = [
		[
			chGeneral,
			ceoId,
			"Standup at 10. Bring blockers only — keep it tight.",
			20
		],
		[
			chGeneral,
			aisha,
			"Review automation is on track for Thursday demo.",
			18
		],
		[
			chDev,
			prakash,
			"Please don't merge into hospital/main without the migration check.",
			14
		],
		[
			chDev,
			hemanth,
			"Appointment API branch is up: feat/hospital-appointments.",
			12
		],
		[
			chDev,
			ravi,
			"Need the occupancy payload shape for the ward board.",
			9
		],
		[
			chHosp,
			maya,
			"@Hemanth please finish patient appointment API by 6 PM.",
			8
		],
		[
			chHosp,
			hemanth,
			"Working on it.",
			7
		],
		[
			chHosp,
			prakash,
			"Great. Please also add validation.",
			6
		],
		[
			chRest,
			prakash,
			"KDS staging is live with yesterday's order dump.",
			11
		],
		[
			chRest,
			infran,
			"Bump animation still feels late on 4K displays. Looking.",
			10
		],
		[
			chAi,
			faiziya,
			"Reply copilot eval set is in /files. Flag anything off-brand.",
			5
		],
		[
			chDesign,
			harsha,
			"Uploaded the kiosk attract-loop frames.",
			4
		],
		[
			chEngDep,
			maya,
			"Sprint review Friday. Bring a demo, not a slide.",
			3
		]
	];
	let mi = 0;
	for (const [ch, author, body, hours] of msgs) {
		mi += 1;
		await sql`insert into messages (id, channel_id, author_id, body, created_at)
      values (${`msg_${mi}`}, ${ch}, ${author}, ${body}, ${ago(hours)})`;
	}
	await sql`insert into message_reactions (message_id, profile_id, emoji) values
    (${"msg_2"}, ${prakash}, ${"up"}),
    (${"msg_6"}, ${hemanth}, ${"check"}),
    (${"msg_11"}, ${ceoId}, ${"up"})`;
	await sql`insert into attachments (id, org_id, name, mime, size_bytes, project_id, task_id, uploaded_by, created_at) values
    (${"f1"}, ${orgId}, ${"hospital-api-spec.yaml"}, ${"text/yaml"}, ${24012}, ${hospital}, ${"t_h_api"}, ${hemanth}, ${ago(12)}),
    (${"f2"}, ${orgId}, ${"patient-portal-flows.pdf"}, ${"application/pdf"}, ${1284e3}, ${hospital}, ${"t_h_portal"}, ${harsha}, ${ago(20)}),
    (${"f3"}, ${orgId}, ${"kds-stations.fig"}, ${"application/octet-stream"}, ${84e5}, ${restaurant}, ${"t_r_kds"}, ${harsha}, ${ago(16)}),
    (${"f4"}, ${orgId}, ${"reply-eval-set.csv"}, ${"text/csv"}, ${88e3}, ${reviews}, ${"t_g_draft"}, ${faiziya}, ${ago(6)}),
    (${"f5"}, ${orgId}, ${"kiosk-attract-loop.mp4"}, ${"video/mp4"}, ${184e5}, ${kiosk}, ${"t_k_ui"}, ${harsha}, ${ago(4)})`;
	await sql`insert into notifications (id, org_id, profile_id, type, title, body, href, read, created_at) values
    (${nid("ntf")}, ${orgId}, ${ceoId}, ${"task"}, ${"New task assigned"}, ${"Moderation queue was assigned to you."}, ${"/tasks/t_g_mod"}, ${false}, ${ago(1.2)}),
    (${nid("ntf")}, ${orgId}, ${ceoId}, ${"mention"}, ${"You were mentioned"}, ${"Hemanth mentioned you in #hospital-platform."}, ${"/chat?channel=seed_ch_hospital"}, ${false}, ${ago(3)}),
    (${nid("ntf")}, ${orgId}, ${ceoId}, ${"deadline"}, ${"Deadline today"}, ${"Patient appointment API is due today."}, ${"/tasks/t_h_api"}, ${false}, ${ago(6)}),
    (${nid("ntf")}, ${orgId}, ${ceoId}, ${"review"}, ${"Task moved to review"}, ${"Hospital patient portal is waiting on review."}, ${"/tasks/t_h_portal"}, ${true}, ${ago(10)}),
    (${nid("ntf")}, ${orgId}, ${ceoId}, ${"blocked"}, ${"Work blocked"}, ${"EHR HL7 adapter is blocked on VPN credentials."}, ${"/tasks/t_h_ehr"}, ${true}, ${ago(15)}),
    (${nid("ntf")}, ${orgId}, ${ceoId}, ${"announce"}, ${"Company announcement"}, ${"Friday sprint reviews are now 30 minutes."}, ${"/"}, ${false}, ${ago(2)})`;
	await sql`insert into time_entries (id, org_id, profile_id, task_id, started_at, ended_at, minutes, note) values
    (${nid("te")}, ${orgId}, ${ceoId}, ${"t_h_portal"}, ${ago(30)}, ${ago(26)}, ${240}, ${"Portal review pass"}),
    (${nid("te")}, ${orgId}, ${ceoId}, ${"t_g_mod"}, ${ago(8)}, ${ago(6.5)}, ${90}, ${"Queue UX"}),
    (${nid("te")}, ${orgId}, ${hemanth}, ${"t_h_api"}, ${ago(7)}, ${ago(3)}, ${240}, ${"Appointment endpoints"}),
    (${nid("te")}, ${orgId}, ${prakash}, ${"t_r_orders"}, ${ago(9)}, ${ago(5)}, ${240}, ${"Order routing"}),
    (${nid("te")}, ${orgId}, ${faiziya}, ${"t_g_draft"}, ${ago(6)}, ${ago(2)}, ${240}, ${"Eval harness"})`;
	await sql`insert into calendar_events (id, org_id, title, starts_at, ends_at, type, project_id, created_by) values
    (${nid("ev")}, ${orgId}, ${"Restaurant API review"}, ${atHour(0, 10)}, ${atHour(0, 11)}, ${"meeting"}, ${restaurant}, ${ceoId}),
    (${nid("ev")}, ${orgId}, ${"Team standup"}, ${atHour(0, 12)}, ${atHour(0, 12, 25)}, ${"meeting"}, ${null}, ${ceoId}),
    (${nid("ev")}, ${orgId}, ${"Hospital UI review"}, ${atHour(0, 14)}, ${atHour(0, 15)}, ${"meeting"}, ${hospital}, ${ceoId}),
    (${nid("ev")}, ${orgId}, ${"AI Kiosk testing"}, ${atHour(0, 16)}, ${atHour(0, 17)}, ${"meeting"}, ${kiosk}, ${faiziya}),
    (${nid("ev")}, ${orgId}, ${"Daily report"}, ${atHour(0, 18)}, ${atHour(0, 18, 30)}, ${"meeting"}, ${null}, ${ceoId}),
    (${nid("ev")}, ${orgId}, ${"Review automation demo"}, ${atHour(1, 11)}, ${atHour(1, 12)}, ${"meeting"}, ${reviews}, ${aisha})`;
	const acts = [
		[
			maya,
			"task",
			"t_g_mod",
			"assigned",
			"Assigned Moderation queue",
			1.2
		],
		[
			hemanth,
			"task",
			"t_h_api",
			"status",
			"Moved Patient appointment API to In Progress",
			3
		],
		[
			ravi,
			"task",
			"t_h_portal",
			"status",
			"Moved Hospital patient portal to In Review",
			10
		],
		[
			infran,
			"task",
			"t_h_ehr",
			"blocked",
			"Marked EHR HL7 adapter as blocked",
			9
		],
		[
			prakash,
			"project",
			restaurant,
			"update",
			"Updated Restaurant SaaS milestone dates",
			16
		],
		[
			faiziya,
			"file",
			"f4",
			"upload",
			"Uploaded reply-eval-set.csv",
			6
		],
		[
			harsha,
			"task",
			"t_h_qa",
			"status",
			"Submitted Portal accessibility pass for review",
			8
		],
		[
			kiran,
			"employee",
			maya,
			"enrolled",
			"Enrolled Maya Shah as Engineering Manager",
			30
		]
	];
	for (const [actor, type, id, action, summary, hours] of acts) await sql`insert into activity_logs (id, org_id, actor_id, entity_type, entity_id, action, summary, created_at)
      values (${nid("act")}, ${orgId}, ${actor}, ${type}, ${id}, ${action}, ${summary}, ${ago(hours)})`;
	await sql`insert into audit_logs (id, org_id, actor_id, action, target_type, target_id, summary, created_at) values
    (${nid("aud")}, ${orgId}, ${ceoId}, ${"org.created"}, ${"organization"}, ${orgId}, ${"Created TRONX workspace"}, ${ago(40)}),
    (${nid("aud")}, ${orgId}, ${ceoId}, ${"employee.enrolled"}, ${"profile"}, ${maya}, ${"Enrolled Maya Shah"}, ${ago(38)}),
    (${nid("aud")}, ${orgId}, ${ceoId}, ${"project.created"}, ${"project"}, ${hospital}, ${"Created Hospital Management Platform"}, ${ago(39)}),
    (${nid("aud")}, ${orgId}, ${maya}, ${"task.assigned"}, ${"task"}, ${"t_h_api"}, ${"Assigned Patient appointment API to Hemanth"}, ${ago(20)})`;
	await sql`insert into announcements (id, org_id, author_id, title, body, scope, created_at) values
    (${nid("ann")}, ${orgId}, ${ceoId}, ${"Friday reviews are 30 minutes"}, ${"Bring a working demo. No slide decks unless a customer is in the room."}, ${"company"}, ${ago(2)}),
    (${nid("ann")}, ${orgId}, ${maya}, ${"Hospital cut this week"}, ${"Appointment API and validation must land before Friday. Flag blockers in #hospital-platform."}, ${"company"}, ${ago(8)})`;
}
async function authIdentity(sql, userId) {
	try {
		const rows = await sql.query(`select name, email from "user" where id = $1 limit 1`, [userId]);
		return {
			name: rows[0]?.name ?? null,
			email: rows[0]?.email ?? null
		};
	} catch {
		return {
			name: null,
			email: null
		};
	}
}
var inflight = /* @__PURE__ */ new Map();
async function ensureActor(userId) {
	const hit = inflight.get(userId);
	if (hit) return hit;
	const run = ensureActorInner(userId).finally(() => inflight.delete(userId));
	inflight.set(userId, run);
	return run;
}
async function ensureActorInner(userId) {
	const sql = await getSql();
	const existing = await sql`select * from profiles where user_id = ${userId} limit 1`;
	if (existing[0]) {
		const orgRows = await sql`select * from organizations where id = ${existing[0].org_id}`;
		const claimed = await sql`select count(*)::int as c from profiles where org_id = ${existing[0].org_id} and user_id is not null`;
		let row = existing[0];
		const title = String(row.title ?? "");
		const role = String(row.role ?? "");
		if ((claimed[0]?.c ?? 0) <= 1 && (role === "founder" || role === "employee") && (title === "Founder" || title === "Member")) {
			await sql`update profiles set role = ${"ceo"}, title = ${"Chief Executive Officer"} where id = ${row.id}`;
			row = {
				...row,
				role: "ceo",
				title: "Chief Executive Officer"
			};
		}
		await sql`update profiles set last_seen_at = now() where id = ${row.id}`;
		return {
			sql,
			me: mapProfile(row),
			org: mapOrg(orgRows[0])
		};
	}
	const identity = await authIdentity(sql, userId);
	const displayName = identity.name && identity.name.trim() || (identity.email ? identity.email.split("@")[0] : "Chief Executive");
	const email = identity.email;
	const orgs = await sql`select * from organizations limit 1`;
	if (!orgs[0]) {
		const orgId = "org_tronx";
		const profileId = userId;
		await sql`insert into organizations (id, name, slug) values (${orgId}, ${"TRONX"}, ${"tronx"})`;
		await sql`insert into profiles (id, org_id, user_id, email, display_name, title, role, avatar_key, employee_code, employment_type, location, joining_date, last_seen_at)
      values (${profileId}, ${orgId}, ${userId}, ${email}, ${displayName}, ${"Chief Executive Officer"}, ${"ceo"}, ${"mist"}, ${"TX-1001"}, ${"full_time"}, ${"Bengaluru"}, now()::date, now())`;
		await seedOrganization(sql, orgId, profileId, displayName);
		const org = (await sql`select * from organizations where id = ${orgId}`)[0];
		const me = (await sql`select * from profiles where id = ${profileId}`)[0];
		return {
			sql,
			me: mapProfile(me),
			org: mapOrg(org)
		};
	}
	const orgId = String(orgs[0].id);
	if (email) {
		const claim = await sql`select * from profiles where org_id = ${orgId} and user_id is null and (
      lower(coalesce(email, '')) = ${email.toLowerCase()}
      or lower(coalesce(work_email, '')) = ${email.toLowerCase()}
    ) limit 1`;
		if (claim[0]) {
			await sql`update profiles set user_id = ${userId}, status = ${"active"}, last_seen_at = now() where id = ${claim[0].id}`;
			return {
				sql,
				me: mapProfile({
					...claim[0],
					user_id: userId,
					status: "active"
				}),
				org: mapOrg(orgs[0])
			};
		}
	}
	if (((await sql`select count(*)::int as c from profiles where org_id = ${orgId} and user_id is not null`)[0]?.c ?? 0) === 0) {
		const profileId = userId;
		const code = await nextEmployeeCode(sql, orgId);
		try {
			await sql`insert into profiles (id, org_id, user_id, email, display_name, title, role, avatar_key, employee_code, last_seen_at)
        values (${profileId}, ${orgId}, ${userId}, ${email}, ${displayName}, ${"Chief Executive Officer"}, ${"ceo"}, ${"mist"}, ${code}, now())`;
		} catch {
			const again = await sql`select * from profiles where user_id = ${userId} limit 1`;
			if (again[0]) return {
				sql,
				me: mapProfile(again[0]),
				org: mapOrg(orgs[0])
			};
			throw new Error("Could not create profile");
		}
		await seedOrganization(sql, orgId, profileId, displayName);
		const me = (await sql`select * from profiles where id = ${profileId}`)[0];
		return {
			sql,
			me: mapProfile(me),
			org: mapOrg(orgs[0])
		};
	}
	throw new Error("No invitation found for this account. Ask a CEO, director or manager to enroll you.");
}
function requireEnroll(role) {
	if (!canEnroll(role)) throw new Error("Only the CEO, a director or a manager can enroll employees.");
}
async function writeActivity(sql, orgId, actorId, entityType, entityId, action, summary) {
	await sql`insert into activity_logs (id, org_id, actor_id, entity_type, entity_id, action, summary)
    values (${`act_${Date.now().toString(16)}${Math.random().toString(16).slice(2, 8)}`}, ${orgId}, ${actorId}, ${entityType}, ${entityId}, ${action}, ${summary})`;
}
async function writeAudit(sql, orgId, actorId, action, targetType, targetId, summary) {
	await sql`insert into audit_logs (id, org_id, actor_id, action, target_type, target_id, summary)
    values (${`aud_${Date.now().toString(16)}${Math.random().toString(16).slice(2, 8)}`}, ${orgId}, ${actorId}, ${action}, ${targetType}, ${targetId}, ${summary})`;
}
async function notify(sql, orgId, profileId, type, title, body, href) {
	if (profileId === "") return;
	await sql`insert into notifications (id, org_id, profile_id, type, title, body, href)
    values (${`ntf_${Date.now().toString(16)}${Math.random().toString(16).slice(2, 8)}`}, ${orgId}, ${profileId}, ${type}, ${title}, ${body}, ${href})`;
}
async function nextEmployeeCode(sql, orgId) {
	const rows = await sql`select employee_code from profiles where org_id = ${orgId}`;
	let max = 1e3;
	for (const r of rows) {
		const match = String(r.employee_code ?? "").match(/^TX-(\d+)$/);
		if (match) max = Math.max(max, Number(match[1]));
	}
	return `TX-${max + 1}`;
}
async function visibleProfileIds(sql, orgId, me) {
	if (me.role === "ceo" || me.role === "founder") return null;
	if (me.role === "employee") return [me.id];
	const ids = /* @__PURE__ */ new Set([me.id]);
	if (me.role === "team_lead") {
		const teams = await sql`select id from teams where org_id = ${orgId} and lead_id = ${me.id}`;
		for (const t of teams) {
			const members = await sql`select profile_id from team_members where team_id = ${t.id}`;
			for (const m of members) ids.add(m.profile_id);
		}
		const reports = await sql`select id from profiles where org_id = ${orgId} and team_lead_id = ${me.id}`;
		for (const r of reports) ids.add(r.id);
		return [...ids];
	}
	const reports = await sql`
    select id from profiles where org_id = ${orgId} and (
      manager_id = ${me.id}
      or department_id in (select id from departments where head_id = ${me.id})
    )`;
	for (const r of reports) ids.add(r.id);
	return [...ids];
}
//#endregion
export { writeActivity as C, visibleProfileIds as S, mapTeam as _, mapAttachment as a, notify as b, mapComment as c, mapMessage as d, mapMilestone as f, mapTask as g, mapProject as h, mapAnnouncement as i, mapDepartment as l, mapProfile as m, ensureActor as n, mapChannel as o, mapNotification as p, mapActivity as r, mapChecklist as s, TASK_SELECT as t, mapEvent as u, mapTime as v, writeAudit as w, requireEnroll as x, nextEmployeeCode as y };
