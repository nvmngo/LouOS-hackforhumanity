import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { getPrototypeEmployee } from '../../shared/prototypeEmployeeAuth.ts';
import { REFERRAL_CATEGORIES, seedOrganizations, text, list, dataSourceLabel, computeOpenNow, computeEligibility, parseApproxAge, matchesCategory, matchesQuery } from '../../shared/referralPathway.ts';

// Makes the LIVE service directory itself useful even when the employee doesn't
// want an AI-ranked recommendation — the "manual discovery" workflow alongside
// recommendOrganizations' "case-based recommendation" workflow. Reads the exact
// same dataset and reuses the exact same eligibility/open-now logic (imported,
// not reimplemented), but never hard-excludes: browsing should show everything
// and label why something might not fit, not hide it. No AI call — this is
// deliberately the non-AI directory layer underneath the recommendation engine.
type Organization = {
  id: string; name: string; service_types?: string[]; client_groups?: string[]; eligibility_structured?: any;
  languages?: string[]; locations?: string[]; support_levels?: string[]; availability?: string; hours?: any;
  availability_status?: string; capacity_note?: string; referral_method?: string; referral_method_type?: string;
  referral_url?: string; referral_notes?: string; contact?: string; notes?: string; source_url?: string; retrieved_at?: string;
  last_verified_at?: string; active?: boolean;
};

const freshnessNote = (org: Organization) => {
  const checked = org.last_verified_at || org.retrieved_at;
  if (!checked) return 'Freshness not recorded';
  const days = Math.floor((Date.now() - new Date(checked).getTime()) / 86400000);
  if (Number.isNaN(days)) return 'Freshness not recorded';
  if (days <= 0) return 'Verified today';
  if (days === 1) return 'Verified 1 day ago';
  return days > 60 ? `⚠ Last verified ${days} days ago — confirm before referral` : `Verified ${days} days ago`;
};

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    let user = null;
    try { user = await base44.auth.me(); } catch { /* Prototype authentication is checked below. */ }
    const prototypeEmployee = user ? null : await getPrototypeEmployee(body, base44.asServiceRole.entities);
    if (!user && !prototypeEmployee) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (prototypeEmployee && body?.caseId) {
      const submission = await base44.asServiceRole.entities.ClientSubmission.get(body.caseId);
      if (!submission || submission.assigned_specialist_id !== prototypeEmployee.specialist.id) return Response.json({ error: 'You are not assigned to this case.' }, { status: 403 });
    }
    const query = text(body?.query, 200);
    const category = REFERRAL_CATEGORIES.includes(body?.category) ? body.category : '';
    const secondaryNeeds = list(body?.secondaryNeeds, 12);
    const clientAge = parseApproxAge(body?.age);
    const dependantsPresent = typeof body?.dependantsPresent === 'boolean' ? body.dependantsPresent : undefined;

    let organizations: Organization[] = [];
    let dataSource: 'directory' | 'seed_fallback' = 'directory';
    try {
      const directory = await base44.asServiceRole.entities.ExternalOrganization.filter({ active: true });
      organizations = Array.isArray(directory) ? directory : [];
    } catch { /* fall through to seed data below */ }
    if (!organizations.length) { organizations = seedOrganizations; dataSource = 'seed_fallback'; }

    let matched = organizations.filter(org => org.active !== false);
    if (category) matched = matched.filter(org => matchesCategory(org, category));
    if (query) matched = matched.filter(org => matchesQuery(org, query));

    const results = matched.slice(0, 100).map(org => {
      const eligibility = computeEligibility(org.eligibility_structured, { age: clientAge, dependantsPresent, secondaryNeeds });
      const openNow = computeOpenNow(org.hours);
      return {
        id: org.id, name: org.name, service: (org.service_types || [])[0] || '', service_types: org.service_types,
        availability: org.availability, languages: org.languages, locations: org.locations,
        referral_method: org.referral_method, referral_method_type: org.referral_method_type || 'email', referral_url: org.referral_url, referral_notes: org.referral_notes,
        contact: org.contact,
        eligibility: eligibility.status, eligibilityReasons: eligibility.reasons,
        openNowStatus: openNow.status, openNowLabel: openNow.label,
        capacityNote: org.capacity_note || 'Not publicly available — contact provider to confirm.',
        freshness: freshnessNote(org), sourceUrl: org.source_url
      };
    }).sort((a, b) => (a.openNowStatus === 'open' ? 0 : 1) - (b.openNowStatus === 'open' ? 0 : 1) || a.name.localeCompare(b.name));

    return Response.json({ results, total: matched.length, dataSource, dataSourceLabel: dataSourceLabel(dataSource) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'The service directory could not be loaded.' }, { status: 500 });
  }
}
