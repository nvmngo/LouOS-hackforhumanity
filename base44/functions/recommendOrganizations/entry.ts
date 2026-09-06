import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { optionalSecret } from '../../shared/optionalSecret.ts';
import { getPrototypeEmployee } from '../../shared/prototypeEmployeeAuth.ts';
import { REFERRAL_CATEGORIES, seedOrganizations, text, list, dataSourceLabel, computeOpenNow, computeEligibility, parseApproxAge, matchesCategory } from '../../shared/referralPathway.ts';

type Organization = {
  id: string;
  name: string;
  service_types?: string[];
  client_groups?: string[];
  eligibility?: string[];
  eligibility_structured?: any;
  languages?: string[];
  locations?: string[];
  service_area?: string;
  support_levels?: string[];
  availability?: string;
  hours?: any;
  availability_status?: string;
  capacity_note?: string;
  referral_method?: string;
  referral_method_type?: string;
  referral_url?: string;
  referral_notes?: string;
  contact?: string;
  notes?: string;
  source?: string;
  source_url?: string;
  retrieved_at?: string;
  last_verified_at?: string;
  confidence?: string;
  active?: boolean;
};

const referralFrictionScore = (org: Organization) => {
  const method = org.referral_method_type || 'email';
  if (method === 'phone') return 15; // no forms, immediate
  if (method === 'email') return 10;
  if (method === 'online_form') return 5;
  return 8;
};

// Deterministic, explainable scoring applied BEFORE any AI call. AI is only allowed
// to rank and explain organisations that already passed the hard filter + eligibility gate.
const scoreOrganization = (org: Organization, input: { urgency: string; language: string; location: string; secondaryNeeds: string[]; openNowStatus: string }) => {
  let score = 0;
  const supportLevels = (org.support_levels || []).map(level => level.toLowerCase());
  const urgency = input.urgency.toLowerCase();
  if (urgency === 'immediate' && supportLevels.includes('immediate')) score += 20;
  else if ((urgency === 'high' || urgency === 'immediate') && supportLevels.includes('high')) score += 15;
  else if (supportLevels.length) score += 8;
  if (input.language && (org.languages || []).some(language => language.toLowerCase().includes(input.language.toLowerCase()))) score += 12;
  if (input.location && (org.locations || []).some(location => location.toLowerCase().includes(input.location.toLowerCase()) || location.toLowerCase().includes('greater sydney') || location.toLowerCase() === 'nsw')) score += 10;
  const needHaystack = input.secondaryNeeds.join(' ').toLowerCase();
  const serviceHaystack = (org.service_types || []).join(' ').toLowerCase();
  const overlap = input.secondaryNeeds.filter(need => serviceHaystack.includes(need.toLowerCase())).length;
  score += Math.min(overlap * 10, 25);
  if (input.openNowStatus === 'open') score += 8;
  score += referralFrictionScore(org);
  score += 15; // baseline for passing the category filter + eligibility gate at all
  return Math.min(score, 100);
};

const plainLanguageReasons = (org: Organization, category: string, input: { urgency: string; language: string; openNow: ReturnType<typeof computeOpenNow> }) => {
  const reasons: string[] = [];
  if ((org.service_types || []).length) reasons.push(`Provides ${org.service_types!.slice(0, 2).join(' and ').toLowerCase()}`);
  if (matchesCategory(org, category)) reasons.push(`Specialises in ${category.toLowerCase()}`);
  if (input.urgency && (org.support_levels || []).some(level => level.toLowerCase() === input.urgency.toLowerCase())) reasons.push(`Supports ${input.urgency} urgency cases`);
  if (input.language && (org.languages || []).some(language => language.toLowerCase().includes(input.language.toLowerCase()))) reasons.push(`${input.language} language support available`);
  if (input.openNow.status === 'open') reasons.push(input.openNow.label);
  return reasons.slice(0, 4);
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
    if (prototypeEmployee) {
      const submission = await base44.asServiceRole.entities.ClientSubmission.get(body?.caseId);
      if (!submission || submission.assigned_specialist_id !== prototypeEmployee.specialist.id) return Response.json({ error: 'You are not assigned to this case.' }, { status: 403 });
    }

    const category = REFERRAL_CATEGORIES.includes(body?.category) ? body.category : '';
    if (!category) return Response.json({ error: 'A confirmed service category is required.' }, { status: 400 });
    const primaryNeed = text(body?.primaryNeed, 300);
    const secondaryNeeds = list(body?.secondaryNeeds, 12);
    const urgency = text(body?.urgency, 40);
    const language = text(body?.language, 60);
    const location = text(body?.location, 80);
    const clientAge = parseApproxAge(body?.age);
    const dependantsPresent = typeof body?.dependantsPresent === 'boolean' ? body.dependantsPresent : undefined;

    let organizations: Organization[] = [];
    let dataSource: 'directory' | 'seed_fallback' = 'directory';
    try {
      const directory = await base44.asServiceRole.entities.ExternalOrganization.filter({ active: true });
      organizations = Array.isArray(directory) ? directory : [];
    } catch { /* fall through to seed data below */ }
    if (!organizations.length) { organizations = seedOrganizations; dataSource = 'seed_fallback'; }

    const categoryMatched = organizations.filter(org => org.active !== false && matchesCategory(org, category));
    if (!categoryMatched.length) return Response.json({ recommendations: [], excluded: [], dataSource, dataSourceLabel: dataSourceLabel(dataSource), category, message: 'No organisations in the directory currently match this category.' });

    // Eligibility gate — deterministic, runs before any scoring or AI call.
    const gated = categoryMatched.map(org => ({ org, eligibility: computeEligibility(org.eligibility_structured, { age: clientAge, dependantsPresent, secondaryNeeds }) }));
    const eligible = gated.filter(item => item.eligibility.status !== 'not_eligible');
    const excluded = gated.filter(item => item.eligibility.status === 'not_eligible').map(item => ({ id: item.org.id, name: item.org.name, reason: item.eligibility.reasons[0] }));
    if (!eligible.length) return Response.json({ recommendations: [], excluded, dataSource, dataSourceLabel: dataSourceLabel(dataSource), category, message: 'No organisations matched this category that the client appears eligible for.' });

    const scored = eligible
      .map(({ org, eligibility }) => {
        const openNow = computeOpenNow(org.hours);
        return { org, eligibility, openNow, score: scoreOrganization(org, { urgency, language, location, secondaryNeeds, openNowStatus: openNow.status }) };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    const buildCard = (item: (typeof scored)[number]) => ({
      id: item.org.id, name: item.org.name, service: (item.org.service_types || [])[0] || category, score: item.score,
      reason: plainLanguageReasons(item.org, category, { urgency, language, openNow: item.openNow }).join('. '),
      why: plainLanguageReasons(item.org, category, { urgency, language, openNow: item.openNow }),
      availability: item.org.availability, languages: item.org.languages, locations: item.org.locations,
      referral_method: item.org.referral_method, referral_method_type: item.org.referral_method_type || 'email', referral_url: item.org.referral_url, referral_notes: item.org.referral_notes,
      contact: item.org.contact, service_types: item.org.service_types,
      eligibility: item.eligibility.status, eligibilityReasons: item.eligibility.reasons,
      openNowStatus: item.openNow.status, openNowLabel: item.openNow.label,
      capacityNote: item.org.capacity_note || 'Not publicly available — contact provider to confirm.',
      availabilityStatus: item.org.availability_status || 'unknown',
      freshness: freshnessNote(item.org), sourceUrl: item.org.source_url
    });

    const apiKey = optionalSecret('OPENAI_API_KEY');
    const fallbackRecommendations = () => scored.slice(0, 3).map(buildCard);

    if (!apiKey) return Response.json({ recommendations: fallbackRecommendations(), excluded, dataSource, dataSourceLabel: dataSourceLabel(dataSource), category, usingAiRanking: false });

    const prompt = `Rank up to three suitable support organisations for this client case, from the supplied shortlist only. Use only IDs from the list below; never invent an organisation. Every organisation in the shortlist has already passed a category and eligibility check — you may NOT change or contradict its "eligibility" field, only mention it. For each, write 2-4 short plain-language bullet points explaining why it matches (no technical scores or jargon). Return JSON: {"recommendations":[{"organization_id":"...","why":["...","..."]}]}.
Category: ${category}
Primary need: ${primaryNeed || 'Not recorded'}
Secondary needs: ${secondaryNeeds.join(', ') || 'None recorded'}
Urgency: ${urgency || 'Not recorded'}
Preferred language: ${language || 'Not recorded'}
Shortlist: ${JSON.stringify(scored.map(item => ({ id: item.org.id, name: item.org.name, service_types: item.org.service_types, support_levels: item.org.support_levels, languages: item.org.languages, locations: item.org.locations, eligibility: item.eligibility.status, open_now: item.openNow.status, deterministic_score: item.score })))}`;

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], response_format: { type: 'json_object' }, temperature: 0.1, max_tokens: 900 })
    });
    if (!aiResponse.ok) return Response.json({ recommendations: fallbackRecommendations(), excluded, dataSource, dataSourceLabel: dataSourceLabel(dataSource), category, usingAiRanking: false });
    const result = await aiResponse.json();
    const parsed = JSON.parse(result?.choices?.[0]?.message?.content || '{}');
    const byId = new Map(scored.map(item => [item.org.id, item]));
    const recommendations = (Array.isArray(parsed.recommendations) ? parsed.recommendations : [])
      .map((item: any) => {
        const match = byId.get(item.organization_id);
        if (!match) return null;
        const why = list(item.why, 4);
        const card = buildCard(match);
        return why.length ? { ...card, why, reason: why.join('. ') } : card;
      })
      .filter(Boolean)
      .slice(0, 3);

    return Response.json({ recommendations: recommendations.length ? recommendations : fallbackRecommendations(), excluded, dataSource, dataSourceLabel: dataSourceLabel(dataSource), category, usingAiRanking: recommendations.length > 0 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Organisation matching failed.' }, { status: 500 });
  }
}
