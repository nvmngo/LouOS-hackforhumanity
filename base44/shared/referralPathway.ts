// Shared helpers for the Referral Pathway functions (suggestReferralCategory,
// recommendOrganizations, draftReferralEmail). Kept deliberately small and
// dependency-free to match the existing function style in this repo.

export const text = (value: unknown, limit = 2000) => typeof value === 'string' ? value.trim().slice(0, limit) : '';
export const list = (value: unknown, limit = 20) => Array.isArray(value) ? value.filter(item => typeof item === 'string').slice(0, limit) : [];

// Same professional category labels already produced by matchSpecialist / caseReport.js,
// so a category chosen here maps cleanly onto supportNeeds.secondaryNeeds.
export const REFERRAL_CATEGORIES = [
  'Accommodation',
  'Domestic / family violence support',
  'Financial assistance',
  'Legal support',
  'Health',
  'Employment',
  'Family / child support',
  'Social support',
  'Other'
] as const;

// Loose keyword matching so a category can be compared against an organisation's
// free-text service_types / client_groups without requiring an exact label match.
export const categoryKeywords: Record<string, string[]> = {
  'Accommodation': ['housing', 'accommodation', 'shelter', 'homeless', 'tenanc'],
  'Domestic / family violence support': ['domestic', 'family violence', 'dfv', 'safety planning'],
  'Financial assistance': ['financial', 'benefits', 'centrelink', 'debt', 'material assistance', 'food', 'emergency relief'],
  'Legal support': ['legal', 'law', 'protection order', 'court'],
  'Health': ['health', 'medical', 'clinic', 'wellbeing', 'mental health', 'counselling', 'crisis'],
  'Employment': ['employment', 'job', 'career', 'work'],
  'Family / child support': ['family', 'child', 'parenting'],
  'Social support': ['social', 'community', 'peer support'],
  'Other': []
};

type DayHours = { open?: string; close?: string };
export type ServiceHours = {
  mon?: DayHours; tue?: DayHours; wed?: DayHours; thu?: DayHours; fri?: DayHours; sat?: DayHours; sun?: DayHours;
  is24_7?: boolean;
  hours_note?: string;
};

export type EligibilityStructured = {
  gender?: string[];
  min_age?: number;
  max_age?: number;
  service_area_postcodes?: string[];
  dfv_related?: boolean;
  income_tested?: boolean;
  dependants_ok?: boolean;
  other_requirements?: string[];
};

export type SeedOrganization = {
  id: string;
  name: string;
  service_types: string[];
  client_groups: string[];
  eligibility: string[];
  eligibility_structured?: EligibilityStructured;
  languages: string[];
  locations: string[];
  service_area?: string;
  support_levels: string[];
  availability: string;
  hours?: ServiceHours;
  availability_status?: 'accepting_referrals' | 'not_accepting_referrals' | 'unknown';
  capacity_note?: string;
  referral_method: string;
  referral_method_type?: 'email' | 'phone' | 'online_form' | 'in_person';
  referral_url?: string;
  contact: string;
  notes?: string;
  source?: string;
  source_url?: string;
  confidence?: 'high' | 'medium' | 'low';
  active: boolean;
};

// Real, well-known NSW/national entry-point and specialist phone services. These are
// intake/assessment/referral lines rather than hyper-local shelter-level records —
// deliberately so: their contact details are stable and independently verifiable
// (each has a source_url), unlike a specific local service's direct line, which
// this project has no way to verify automatically. Populating more granular local
// services is a curation task for someone at Lou's Place, not something to invent.
// Used only when the ExternalOrganization entity has not been populated yet, so the
// demo remains reliable — never presented as anything other than what it is.
export const seedOrganizations: SeedOrganization[] = [
  {
    id: 'link2home', name: 'Link2Home', service_types: ['Homelessness information, assessment and referral', 'Emergency accommodation referral'],
    client_groups: ['Adults', 'Families', 'Young people'], eligibility: ['Anyone in NSW who is homeless or at risk of homelessness'],
    eligibility_structured: {}, languages: ['English', 'Interpreter service (TIS National)'], locations: ['NSW'], service_area: 'NSW (statewide)',
    support_levels: ['Low', 'Medium', 'High', 'Immediate'], availability: 'Phone line answered 24/7',
    hours: { is24_7: true, hours_note: 'Full accommodation and support referrals only available 9am–10pm daily; overnight calls (10pm–9am) receive safety information and assessment only, with referral to emergency services if needed.' },
    availability_status: 'unknown', capacity_note: 'Not publicly available — Link2Home assesses and refers case-by-case.',
    referral_method: 'Self-referral by phone', referral_method_type: 'phone', contact: '1800 152 152',
    notes: 'NSW Government’s statewide homelessness information, assessment and referral line. Refers on to specific accommodation/support services rather than being the accommodation itself.',
    source: 'curated', source_url: 'https://www.nsw.gov.au/housing-and-construction/if-you-need-emergency-accommodation', confidence: 'high', active: true
  },
  {
    id: '1800respect', name: '1800RESPECT', service_types: ['Domestic, family and sexual violence counselling', 'Safety planning', 'Referral'],
    client_groups: ['Women', 'Men', 'People affected by family or sexual violence'], eligibility: ['Anyone in Australia experiencing or at risk of domestic, family or sexual violence'],
    eligibility_structured: { dfv_related: true }, languages: ['English', 'Interpreter service'], locations: ['NSW', 'National'], service_area: 'National',
    support_levels: ['Medium', 'High', 'Immediate'], availability: 'Phone, text and online chat available 24/7',
    hours: { is24_7: true }, availability_status: 'unknown', capacity_note: 'Not publicly available — contact to confirm.',
    referral_method: 'Self-referral by phone, text or online chat', referral_method_type: 'phone', contact: '1800 737 732',
    notes: 'National DFV counselling and referral line.', source: 'curated', source_url: 'https://1800respect.org.au/calling-1800respect', confidence: 'high', active: true
  },
  {
    id: 'nsw-mental-health-line', name: 'NSW Mental Health Line', service_types: ['Mental health advice', 'Crisis triage', 'Referral to NSW Health mental health services'],
    client_groups: ['Adults', 'Young people', 'Families'], eligibility: ['Anyone in NSW concerned about their or someone else’s mental health'],
    eligibility_structured: {}, languages: ['English', 'Interpreter service'], locations: ['NSW'], service_area: 'NSW (statewide)',
    support_levels: ['Medium', 'High', 'Immediate'], availability: 'Phone line answered 24/7',
    hours: { is24_7: true }, availability_status: 'unknown', capacity_note: 'Not publicly available — contact to confirm.',
    referral_method: 'Self-referral by phone', referral_method_type: 'phone', contact: '1800 011 511',
    notes: 'Free statewide NSW Health triage and referral line.', source: 'curated', source_url: 'https://www.health.nsw.gov.au/mentalhealth/Pages/mental-health-line.aspx', confidence: 'high', active: true
  },
  {
    id: 'lifeline', name: 'Lifeline', service_types: ['Crisis support', 'Suicide prevention counselling'],
    client_groups: ['Adults', 'Young people'], eligibility: ['Anyone in Australia experiencing a personal crisis or thinking about suicide'],
    eligibility_structured: {}, languages: ['English', 'Interpreter service'], locations: ['NSW', 'National'], service_area: 'National',
    support_levels: ['High', 'Immediate'], availability: 'Phone, text and online chat available 24/7',
    hours: { is24_7: true }, availability_status: 'unknown', capacity_note: 'Not publicly available — contact to confirm.',
    referral_method: 'Self-referral by phone, text or online chat', referral_method_type: 'phone', contact: '13 11 14',
    notes: 'National crisis support line.', source: 'curated', source_url: 'https://www.lifeline.org.au/about/contact-us', confidence: 'high', active: true
  },
  {
    id: 'legal-aid-nsw', name: 'LawAccess NSW (Legal Aid NSW)', service_types: ['Legal information', 'Legal referral', 'Some legal advice'],
    client_groups: ['Adults'], eligibility: ['Anyone in NSW with a legal problem; some services are means-tested'],
    eligibility_structured: { income_tested: true }, languages: ['English', 'Interpreter service'], locations: ['NSW'], service_area: 'NSW (statewide)',
    support_levels: ['Low', 'Medium', 'High'], availability: 'Phone line Mon–Fri 9am–5pm',
    hours: { mon: { open: '09:00', close: '17:00' }, tue: { open: '09:00', close: '17:00' }, wed: { open: '09:00', close: '17:00' }, thu: { open: '09:00', close: '17:00' }, fri: { open: '09:00', close: '17:00' } },
    availability_status: 'unknown', capacity_note: 'Not publicly available — contact to confirm.',
    referral_method: 'Self-referral by phone', referral_method_type: 'phone', contact: '1300 888 529',
    notes: 'Free government legal information and referral line; refers on to Legal Aid NSW or a community legal centre as appropriate.',
    source: 'curated', source_url: 'https://www.legalaid.nsw.gov.au/', confidence: 'high', active: true
  },
  {
    id: 'vinnies-nsw', name: 'Vinnies NSW (St Vincent de Paul Society)', service_types: ['Food and everyday essentials', 'Emergency financial assistance', 'Referral'],
    client_groups: ['Adults', 'Families'], eligibility: ['Anyone in NSW experiencing financial hardship'],
    eligibility_structured: {}, languages: ['English', 'Interpreter service'], locations: ['NSW'], service_area: 'NSW (statewide, via local conferences)',
    support_levels: ['Low', 'Medium', 'High'], availability: 'Phone line Mon–Fri 9am–5pm',
    hours: { mon: { open: '09:00', close: '17:00' }, tue: { open: '09:00', close: '17:00' }, wed: { open: '09:00', close: '17:00' }, thu: { open: '09:00', close: '17:00' }, fri: { open: '09:00', close: '17:00' } },
    availability_status: 'unknown', capacity_note: 'Not publicly available — contact to confirm.',
    referral_method: 'Self-referral by phone or email', referral_method_type: 'phone', contact: '13 18 12',
    notes: 'Connects to the nearest local Vinnies conference for material and financial assistance.',
    source: 'curated', source_url: 'https://www.vinnies.org.au/nsw/find-help/assistance-with-food-and-everyday-essentials', confidence: 'high', active: true
  },
  {
    id: 'salvos-pal-nsw', name: 'Salvation Army NSW — Phone Assessment Line', service_types: ['Emergency financial assistance', 'Material aid', 'Referral'],
    client_groups: ['Adults', 'Families'], eligibility: ['Anyone in NSW experiencing financial hardship'],
    eligibility_structured: {}, languages: ['English', 'Interpreter service'], locations: ['NSW'], service_area: 'NSW (statewide)',
    support_levels: ['Low', 'Medium', 'High'], availability: 'Phone line Mon–Fri 9am–4pm',
    hours: { mon: { open: '09:00', close: '16:00' }, tue: { open: '09:00', close: '16:00' }, wed: { open: '09:00', close: '16:00' }, thu: { open: '09:00', close: '16:00' }, fri: { open: '09:00', close: '16:00' } },
    availability_status: 'unknown', capacity_note: 'Not publicly available — contact to confirm.',
    referral_method: 'Self-referral by phone', referral_method_type: 'phone', contact: '02 8775 7988',
    notes: 'NSW emergency relief assessment line.', source: 'curated', source_url: 'https://www.salvationarmy.org.au/sydneysalvos/support-services/financial-assistance/', confidence: 'medium', active: true
  },
  {
    id: 'eheadspace', name: 'eheadspace', service_types: ['Youth mental health counselling', 'Online and phone support'],
    client_groups: ['Young people'], eligibility: ['Young people aged 12–25'],
    eligibility_structured: { min_age: 12, max_age: 25 }, languages: ['English'], locations: ['NSW', 'National'], service_area: 'National (online/phone)',
    support_levels: ['Low', 'Medium', 'High'], availability: 'Hours vary — check website for current phone/chat hours',
    hours: { hours_note: 'Published hours vary between sources at time of writing — confirm current hours on the headspace website before relying on them.' },
    availability_status: 'unknown', capacity_note: 'Not publicly available — contact to confirm.',
    referral_method: 'Self-referral by phone or online chat', referral_method_type: 'phone', contact: '1800 650 890',
    notes: 'National online/phone youth mental health service, part of headspace.',
    source: 'curated', source_url: 'https://headspace.org.au/online-and-phone-support/connect-with-us/faqs/', confidence: 'medium', active: true
  }
];

export type DirectoryOrganization = {
  id: string; name: string; service_types?: string[]; client_groups?: string[]; active?: boolean;
};

export const matchesCategory = (org: DirectoryOrganization, category: string) => {
  const haystack = [...(org.service_types || []), ...(org.client_groups || [])].join(' ').toLowerCase();
  const keywords = categoryKeywords[category] || [];
  return keywords.some(keyword => haystack.includes(keyword)) || haystack.includes(category.toLowerCase());
};

export const matchesQuery = (org: DirectoryOrganization & { notes?: string }, query: string) => {
  const haystack = [org.name, ...(org.service_types || []), ...(org.client_groups || []), org.notes || ''].join(' ').toLowerCase();
  return query.toLowerCase().split(/\s+/).filter(Boolean).every(word => haystack.includes(word));
};

export const dataSourceLabel = (source: 'directory' | 'seed_fallback') =>
  source === 'directory' ? 'Directory data' : 'Sample directory data (organisation directory not yet populated)';

// ---- Open-now calculation ----------------------------------------------------
// Deterministic only — no AI, no external call. Uses the real Sydney clock.
const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

export function computeOpenNow(hours: ServiceHours | undefined | null): { status: 'open' | 'closed' | 'unknown'; label: string } {
  if (!hours) return { status: 'unknown', label: 'Hours not published' };
  if (hours.is24_7) return { status: 'open', label: hours.hours_note ? `Open now (24/7 line) — ${hours.hours_note}` : 'Open now (24/7 line, based on published hours)' };
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-AU', { timeZone: 'Australia/Sydney', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(now);
  const weekday = (parts.find(p => p.type === 'weekday')?.value || '').toLowerCase().slice(0, 3);
  const hour = Number(parts.find(p => p.type === 'hour')?.value ?? NaN);
  const minute = Number(parts.find(p => p.type === 'minute')?.value ?? NaN);
  const dayKey = dayKeys.find(key => weekday.startsWith(key));
  const today = dayKey ? (hours as Record<string, DayHours | undefined>)[dayKey] : undefined;
  if (!today || !today.open || !today.close || Number.isNaN(hour)) return { status: 'unknown', label: hours.hours_note || 'Hours not published for today' };
  const nowMinutes = hour * 60 + minute;
  const toMinutes = (value: string) => { const [h, m] = value.split(':').map(Number); return h * 60 + (m || 0); };
  const isOpen = nowMinutes >= toMinutes(today.open) && nowMinutes < toMinutes(today.close);
  return { status: isOpen ? 'open' : 'closed', label: isOpen ? `Open now, based on published hours (until ${today.close})` : `Closed now, based on published hours (opens ${today.open})` };
}

// ---- Eligibility gate ---------------------------------------------------------
// Deterministic only. Hard-excludes ONLY on an explicit, structured mismatch
// between the service's eligibility_structured and known/approved case facts.
// Missing information on either side never becomes an exclusion — it becomes
// 'needs_confirmation'. AI never runs this logic and never overrides it.
export type CaseFacts = { age?: number; dependantsPresent?: boolean; secondaryNeeds?: string[] };
export type EligibilityResult = { status: 'likely_eligible' | 'needs_confirmation' | 'not_eligible'; reasons: string[] };

export function computeEligibility(structured: EligibilityStructured | undefined | null, facts: CaseFacts): EligibilityResult {
  const reasons: string[] = [];
  let needsConfirmation = false;
  if (!structured || Object.keys(structured).length === 0) {
    return { status: 'needs_confirmation', reasons: ['This service has not published structured eligibility rules — confirm directly.'] };
  }
  if (typeof structured.min_age === 'number' || typeof structured.max_age === 'number') {
    if (typeof facts.age !== 'number') { needsConfirmation = true; reasons.push('Client age is not recorded in the approved case — confirm this service’s age range applies.'); }
    else {
      if (typeof structured.min_age === 'number' && facts.age < structured.min_age) return { status: 'not_eligible', reasons: [`Requires age ${structured.min_age}+; approved case records age ${facts.age}.`] };
      if (typeof structured.max_age === 'number' && facts.age > structured.max_age) return { status: 'not_eligible', reasons: [`Requires age up to ${structured.max_age}; approved case records age ${facts.age}.`] };
      reasons.push('Client age is within this service’s stated age range.');
    }
  }
  if (structured.dfv_related && !(facts.secondaryNeeds || []).some(need => /domestic|family violence|dfv/i.test(need))) {
    needsConfirmation = true; reasons.push('This service is DFV-specialist — confirm the case involves domestic/family violence if not already recorded.');
  }
  if (structured.income_tested) {
    needsConfirmation = true; reasons.push('This service may be means-tested — client financial situation is not recorded in the approved case, so confirm directly.');
  }
  if (Array.isArray(structured.gender) && structured.gender.length) {
    needsConfirmation = true; reasons.push(`This service is limited to: ${structured.gender.join(', ')} — client gender is not recorded in the approved case, so confirm directly.`);
  }
  if (Array.isArray(structured.service_area_postcodes) && structured.service_area_postcodes.length) {
    needsConfirmation = true; reasons.push('This service is limited to specific postcodes — the approved case does not record a postcode to check against, so confirm directly.');
  }
  if (structured.dependants_ok === false && facts.dependantsPresent) {
    return { status: 'not_eligible', reasons: ['This service does not accommodate dependants; the approved case records dependants present.'] };
  }
  if (Array.isArray(structured.other_requirements) && structured.other_requirements.length) {
    needsConfirmation = true; reasons.push(`Additional requirements published: ${structured.other_requirements.join('; ')} — confirm directly.`);
  }
  return { status: needsConfirmation ? 'needs_confirmation' : 'likely_eligible', reasons: reasons.length ? reasons : ['No published eligibility rule for this service excludes the case.'] };
}

// Best-effort, conservative parse of the free-text age already recorded on the
// case (e.g. "32" or "32 years"). Returns undefined rather than guessing.
export function parseApproxAge(ageText: string | undefined | null): number | undefined {
  const match = String(ageText || '').match(/\d{1,3}/);
  if (!match) return undefined;
  const value = Number(match[0]);
  return value > 0 && value < 120 ? value : undefined;
}
