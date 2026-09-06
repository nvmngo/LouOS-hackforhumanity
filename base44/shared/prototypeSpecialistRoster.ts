// Prototype-only specialist roster for the five fictional employees in
// prototypeEmployeeAuth.ts. Entity data under `base44 dev` is in-memory and is
// wiped on every restart, so without this the Specialist table is empty and
// employee login fails with "Employee access is not configured."
// Provisioning is idempotent: it only creates profiles that are missing, so on
// a backend that already holds these specialists it is a no-op.

export const prototypeSpecialistRoster = [
  {
    contact_email: 'maya.chen@example.org',
    full_name: 'Maya Chen',
    role: 'Senior Caseworker',
    bio: 'Supports women leaving unsafe homes to find stable accommodation, with a focus on family safety planning.',
    expertise: ['Accommodation', 'Domestic / family violence support', 'Safety support'],
    languages: ['English', 'Mandarin'],
    years_experience: 8,
    availability_status: 'available',
    available_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    current_caseload: 0,
    maximum_caseload: 12,
    location: 'Sydney'
  },
  {
    contact_email: 'aisha.rahman@example.org',
    full_name: 'Aisha Rahman',
    role: 'Caseworker',
    bio: 'Works with mothers and children on wellbeing, health access and connection to community support.',
    expertise: ['Family / child support', 'Health', 'Social support'],
    languages: ['English', 'Arabic', 'Bengali'],
    years_experience: 5,
    availability_status: 'available',
    available_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    current_caseload: 0,
    maximum_caseload: 10,
    location: 'Sydney'
  },
  {
    contact_email: 'sophie.martin@example.org',
    full_name: 'Sophie Martin',
    role: 'Caseworker',
    bio: 'Helps clients stabilise income, navigate financial assistance and return to work or study.',
    expertise: ['Financial assistance', 'Employment', 'Accommodation'],
    languages: ['English', 'French'],
    years_experience: 4,
    availability_status: 'available',
    available_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    current_caseload: 0,
    maximum_caseload: 10,
    location: 'Sydney'
  },
  {
    contact_email: 'grace.williams@example.org',
    full_name: 'Grace Williams',
    role: 'Senior Caseworker',
    bio: 'Senior practitioner for legal matters, protection orders and high-risk safety responses.',
    expertise: ['Legal support', 'Safety support', 'Domestic / family violence support'],
    languages: ['English'],
    years_experience: 11,
    availability_status: 'available',
    available_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    current_caseload: 0,
    maximum_caseload: 12,
    location: 'Sydney'
  },
  {
    contact_email: 'elena.rossi@example.org',
    full_name: 'Elena Rossi',
    role: 'Caseworker',
    bio: 'Supports clients through health, mental wellbeing and social isolation alongside practical assistance.',
    expertise: ['Health', 'Social support', 'Financial assistance'],
    languages: ['English', 'Italian', 'Spanish'],
    years_experience: 6,
    availability_status: 'available',
    available_days: ['tuesday', 'wednesday', 'thursday', 'friday', 'sunday'],
    current_caseload: 0,
    maximum_caseload: 8,
    location: 'Sydney'
  }
];

const rosterEmails = new Set(prototypeSpecialistRoster.map(item => item.contact_email));
const emailOf = (item: any) => typeof item?.contact_email === 'string' ? item.contact_email.trim().toLowerCase() : '';

// Concurrent invocations of the same worker collapse onto one provisioning run.
let inFlight: Promise<void> | null = null;

// Creates any roster profile that has no Specialist record yet. Existing
// records are never modified, so a specialist deactivated on purpose stays
// deactivated. Returns nothing; callers re-read the entity afterwards.
export function ensurePrototypeSpecialists(entities: any): Promise<void> {
  if (!inFlight) inFlight = provision(entities).finally(() => { inFlight = null; });
  return inFlight;
}

async function provision(entities: any) {
  const existing = await entities.Specialist.list('-created_date', 5000);
  const known = new Set(existing.map(emailOf));
  const missing = prototypeSpecialistRoster.filter(item => !known.has(item.contact_email));
  if (missing.length) {
    await Promise.all(missing.map(item => entities.Specialist.create({
      ...item,
      upcoming_case_count: 0,
      congestion_level: 'low',
      active: true
    })));
  }
  // Always reconcile, even when this call created nothing. Separate workers
  // cannot see each other's in-flight creates, so several starting on an empty
  // table each insert the full roster, and none of them can observe the
  // duplicates in time to clean up its own run. The entity API generates its
  // own ids and offers no unique constraint, so duplicates cannot be prevented
  // outright -- instead every later call collapses them, and the table
  // converges on one profile per email.
  await removeDuplicateRosterProfiles(entities);
}

// Keeps the earliest record per roster email and drops the rest. The ordering
// is total and derived only from stored values, so every racing worker picks
// the same survivor and they converge instead of deleting each other's keeper.
export async function removeDuplicateRosterProfiles(entities: any) {
  const all = await entities.Specialist.list('-created_date', 5000);
  const grouped = new Map<string, any[]>();
  for (const item of all) {
    const email = emailOf(item);
    if (!rosterEmails.has(email)) continue;
    const bucket = grouped.get(email);
    if (bucket) bucket.push(item); else grouped.set(email, [item]);
  }
  const surplus: any[] = [];
  for (const items of grouped.values()) {
    if (items.length < 2) continue;
    items.sort((left, right) =>
      String(left.created_date || '').localeCompare(String(right.created_date || '')) ||
      String(left.id).localeCompare(String(right.id)));
    surplus.push(...items.slice(1));
  }
  // A racing worker may have deleted the same row already; that is the intended
  // outcome either way, so a failed delete is not an error.
  await Promise.all(surplus.map(item => entities.Specialist.delete(item.id).catch(() => {})));
}
