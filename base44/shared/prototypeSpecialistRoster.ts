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

// Creates any roster profile that has no Specialist record yet. Existing
// records are never modified, so a specialist deactivated on purpose stays
// deactivated. Returns nothing; callers re-read the entity afterwards.
export async function ensurePrototypeSpecialists(entities: any) {
  const existing = await entities.Specialist.list('-created_date', 5000);
  const known = new Set(existing.map((item: any) => typeof item?.contact_email === 'string' ? item.contact_email.trim().toLowerCase() : ''));
  const missing = prototypeSpecialistRoster.filter(item => !known.has(item.contact_email));
  if (!missing.length) return;
  await Promise.all(missing.map(item => entities.Specialist.create({
    ...item,
    upcoming_case_count: 0,
    congestion_level: 'low',
    active: true
  })));
}
