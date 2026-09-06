import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { secrets } from 'base44:runtime';
import { REFERRAL_CATEGORIES, categoryKeywords, text, list } from '../../shared/referralPathway.ts';

// Deterministic fallback so the pathway never blocks if OpenAI is unavailable.
// Scores each category by keyword overlap with the approved need text.
const keywordFallback = (searchable: string) => {
  const scored = REFERRAL_CATEGORIES.map(category => ({
    category,
    score: (categoryKeywords[category] || []).reduce((score, keyword) => score + (searchable.includes(keyword) ? 1 : 0), 0)
  })).sort((a, b) => b.score - a.score);
  return scored[0].score > 0 ? scored[0].category : 'Other';
};

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const primaryNeed = text(body?.primaryNeed, 300);
    const secondaryNeeds = list(body?.secondaryNeeds, 12);
    const safetyLevel = text(body?.safetyLevel, 60);
    if (!primaryNeed && !secondaryNeeds.length) return Response.json({ error: 'The case has no confirmed support need yet.' }, { status: 400 });

    const searchable = `${primaryNeed} ${secondaryNeeds.join(' ')} ${safetyLevel}`.toLowerCase();
    const fallbackCategory = keywordFallback(searchable);

    const apiKey = (() => { try { return secrets.get('OPENAI_API_KEY') || ''; } catch { return ''; } })();
    if (!apiKey) return Response.json({ suggestedCategory: fallbackCategory, rationale: 'Matched from the approved support need using keyword matching (AI suggestion unavailable).', usingFallback: true });

    const prompt = `A caseworker needs to choose one referral service category for a client, based only on the approved information below. Choose exactly one category from this list: ${REFERRAL_CATEGORIES.join(', ')}. Do not invent facts. Return JSON: {"category":"...","rationale":"one short plain-language sentence"}.
Approved primary need: ${primaryNeed || 'Not recorded'}
Approved secondary needs: ${secondaryNeeds.join(', ') || 'None recorded'}
Approved safety level: ${safetyLevel || 'Not assessed'}`;

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], response_format: { type: 'json_object' }, temperature: 0.1, max_tokens: 200 })
    });
    const result = await aiResponse.json();
    if (!aiResponse.ok) return Response.json({ suggestedCategory: fallbackCategory, rationale: 'AI suggestion unavailable; matched from approved support need instead.', usingFallback: true });
    const parsed = JSON.parse(result?.choices?.[0]?.message?.content || '{}');
    const category = REFERRAL_CATEGORIES.includes(parsed.category) ? parsed.category : fallbackCategory;
    return Response.json({ suggestedCategory: category, rationale: text(parsed.rationale, 300) || 'Suggested from the approved support need.', usingFallback: false });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Category suggestion failed.' }, { status: 500 });
  }
}
