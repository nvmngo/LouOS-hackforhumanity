import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const text = (value: unknown) => typeof value === 'string' ? value.slice(0, 2000).trim() : '';
const list = (value: unknown) => Array.isArray(value) ? value.filter(item => typeof item === 'string').slice(0, 12) : [];

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const source = body?.source === 'paper' ? 'paper' : 'online';
    const data = body?.data && typeof body.data === 'object' ? body.data : {};
    const priorities = source === 'paper' ? (Array.isArray(data.problems) ? data.problems.map((item: any) => text(item?.priority)) : []) : [data.priority1, data.priority2, data.priority3].map(text);
    const urgency = priorities.some(value => /immediate/i.test(value)) ? 'immediate' : priorities.some(value => /high/i.test(value)) ? 'high' : priorities.some(value => /medium/i.test(value)) ? 'medium' : 'low';
    const categories = source === 'paper' ? (Array.isArray(data.problems) ? data.problems.map((item: any) => text(item?.category)).filter(Boolean) : []) : list(data.problemCategories);
    const submissionData = {
      source,
      client_name: text(source === 'paper' ? data.client_name : data.fullName),
      preferred_name: text(source === 'paper' ? data.preferred_name : data.preferredName),
      contact: text(source === 'paper' ? data.contact : data.phoneOrContact),
      preferred_language: text(source === 'paper' ? data.preferred_language : data.preferredLanguage),
      main_need: text(source === 'paper' ? data.main_need : data.helpToday) || 'General support',
      problem_categories: categories,
      urgency,
      summary: text(source === 'paper' ? data.summary : [data.reasonToday, data.recentEvents, data.urgentAttention].filter(Boolean).join(' ')),
      raw_answers: data,
      status: 'matching'
    };
    const submission = await base44.entities.ClientSubmission.create(submissionData);
    const specialists = await base44.entities.Specialist.filter({ active: true });
    const searchable = `${submissionData.main_need} ${submissionData.summary} ${categories.join(' ')}`.toLowerCase();
    const ranked = specialists.filter((item: any) => item.availability_status !== 'unavailable' && item.current_caseload < item.maximum_caseload).map((item: any) => {
      const expertiseScore = (item.expertise || []).reduce((score: number, skill: string) => score + (searchable.includes(skill.toLowerCase()) ? 24 : 0), 0);
      const languageScore = submissionData.preferred_language && (item.languages || []).some((language: string) => language.toLowerCase() === submissionData.preferred_language.toLowerCase()) ? 15 : 0;
      const availabilityScore = item.availability_status === 'available' ? 30 : 12;
      const capacityScore = Math.round((1 - item.current_caseload / item.maximum_caseload) * 20);
      return { item, score: expertiseScore + languageScore + availabilityScore + capacityScore };
    }).sort((a: any, b: any) => b.score - a.score);
    if (!ranked.length) {
      await base44.entities.ClientSubmission.update(submission.id, { status: 'review_needed' });
      return Response.json({ submissionId: submission.id, status: 'review_needed' });
    }
    const match = ranked[0];
    await base44.entities.ClientSubmission.update(submission.id, { status: 'matched', assigned_specialist_id: match.item.id, assigned_specialist_name: match.item.full_name, match_score: match.score });
    return Response.json({ submissionId: submission.id, status: 'matched', specialistName: match.item.full_name });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Specialist matching failed.' }, { status: 500 });
  }
}