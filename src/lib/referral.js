// Mirrors base44/shared/referralPathway.ts REFERRAL_CATEGORIES. Kept as a separate
// frontend constant because functions and frontend code do not share a build step,
// matching how safety levels / support categories are already duplicated between
// src/lib/caseReport.js and base44/shared/caseNoteSuggestions.ts in this project.
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
];

export const REFERRAL_STATUSES = ['Suggested', 'Selected', 'Draft prepared', 'Sent', 'Completed', 'Cancelled'];

const newId = () => `ref-${crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;

export function createReferralRecord({ organization, category, reason, why }) {
  return {
    id: newId(),
    organisation: organization.name,
    organization_id: organization.id,
    service: organization.service || category,
    category,
    reason: reason || '',
    why: why || [],
    consent: '',
    referralDate: '',
    status: 'Suggested',
    outcome: '',
    email_subject: '',
    email_body: '',
    email_sent_at: '',
    contact: organization.contact || '',
    referral_method_type: organization.referral_method_type || 'email',
    eligibility_at_referral: organization.eligibility || 'needs_confirmation',
    eligibility_reasons: organization.eligibilityReasons || []
  };
}

export function upsertReferral(referrals = [], record) {
  const next = referrals.filter(item => item.id !== record.id);
  next.push(record);
  return next;
}

export function referralHistoryEntry({ referral, previousStatus, employee }) {
  return {
    field_path: 'referrals',
    previous_value: previousStatus || '',
    new_value: `${referral.organisation} — ${referral.status}`,
    source: 'Referral pathway',
    updated_at: new Date().toISOString(),
    approved_by: employee || 'Employee'
  };
}
