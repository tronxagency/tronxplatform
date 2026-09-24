/** Canonical Founder & CEO identity for TRONX. */
export const OWNER = {
  name: "Vides",
  email: "videshthota889@gmail.com",
  phone: "6305003695",
  title: "Founder & CEO",
  username: "vides",
  location: "Bengaluru",
  code: "TX-1001",
} as const;

/** Canonical Founder seat — agency inbox with full founder access. */
export const FOUNDER = {
  name: "TRONX Agency",
  email: "tronx.agency@gmail.com",
  phone: "6305003695",
  title: "Founder",
  username: "tronx.agency",
  location: "Bengaluru",
  code: "TX-1000",
} as const;

export function isOwnerEmail(email: string | null | undefined): boolean {
  return (email ?? "").trim().toLowerCase() === OWNER.email;
}

export function isFounderEmail(email: string | null | undefined): boolean {
  return (email ?? "").trim().toLowerCase() === FOUNDER.email;
}

export function isLeadershipEmail(email: string | null | undefined): boolean {
  return isOwnerEmail(email) || isFounderEmail(email);
}
