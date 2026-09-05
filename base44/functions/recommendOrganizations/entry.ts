import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { secrets } from 'base44:runtime';

const demoOrganizations = [
  {id:'harbour-womens',name:'Harbour Women’s Support Centre',service_types:['Transitional housing','DFV support','Safety planning'],client_groups:['Women','Women with children'],eligibility:['Experiencing housing instability or family violence'],languages:['English','Vietnamese interpreter','Mandarin interpreter'],locations:['Inner Sydney'],support_levels:['High','Immediate'],availability:'Limited places this week',referral_method:'Warm referral by phone',contact:'02 9000 0101',notes:'Children can stay with their parent.'},
  {id:'safe-steps',name:'SafeSteps Community Housing',service_types:['Emergency accommodation','Housing advocacy'],client_groups:['Adults','Families with children'],eligibility:['At risk of homelessness'],languages:['English','Interpreter service'],locations:['Greater Sydney'],support_levels:['Medium','High','Immediate'],availability:'Same-day assessment',referral_method:'Online referral',contact:'referrals@safesteps.example',notes:'After-hours intake available.'},
  {id:'inner-sydney-hub',name:'Inner Sydney Support Hub',service_types:['Financial counselling','Housing support','Benefits advocacy'],client_groups:['Adults','Families'],eligibility:['Lives in or near Inner Sydney'],languages:['English','Vietnamese','Arabic'],locations:['Inner Sydney'],support_levels:['Low','Medium','High'],availability:'Appointments within three days',referral_method:'Email referral',contact:'02 9000 0188',notes:'No emergency accommodation onsite.'},
  {id:'family-legal-care',name:'Family Legal Care NSW',service_types:['Family law','Protection orders','Legal information'],client_groups:['Women','Parents','People affected by family violence'],eligibility:['NSW resident needing family-law support'],languages:['English','Interpreter service'],locations:['NSW','Remote'],support_levels:['Medium','High'],availability:'Phone advice within two days',referral_method:'Secure online referral',contact:'02 9000 0199',notes:'Legal advice only; no housing service.'}
];

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({error:'Unauthorized'}, {status:401});
    const body = await req.json();
    const summary = typeof body?.summary === 'string' ? body.summary.trim().slice(0,6000) : '';
    const categories = Array.isArray(body?.categories) ? body.categories.filter((x: unknown)=>typeof x==='string').slice(0,12) : [];
    const urgency = typeof body?.urgency === 'string' ? body.urgency.slice(0,40) : '';
    if (!summary) return Response.json({error:'A case summary is required.'}, {status:400});
    const organizations = demoOrganizations;
    const prompt = `Rank up to three suitable support organisations for this client case. Use only IDs from the supplied list. Consider services, eligibility, client group, language, location, urgency, availability and referral method. Do not invent facts. Return JSON: {"recommendations":[{"organization_id":"...","score":0,"reason":"...","service":"..."}]}.\nCase summary: ${summary}\nCategories: ${categories.join(', ')}\nUrgency: ${urgency}\nOrganisations: ${JSON.stringify(organizations)}`;
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${secrets.get('OPENAI_API_KEY')}`},body:JSON.stringify({model:'gpt-4o-mini',messages:[{role:'user',content:prompt}],response_format:{type:'json_object'},temperature:0.1,max_tokens:900})});
    const result = await aiResponse.json();
    if (!aiResponse.ok) return Response.json({error:result?.error?.message||'Recommendations could not be prepared.'},{status:502});
    const parsed = JSON.parse(result?.choices?.[0]?.message?.content||'{}');
    const byId = new Map(organizations.map((item: any)=>[item.id,item]));
    const recommendations = (Array.isArray(parsed.recommendations)?parsed.recommendations:[]).map((item: any)=>{const organization:any=byId.get(item.organization_id);return organization?{...organization,score:Math.max(0,Math.min(100,(Number(item.score)||0)<=10?(Number(item.score)||0)*10:Number(item.score)||0)),reason:String(item.reason||'').slice(0,500),service:String(item.service||organization.service_types?.[0]||'Support').slice(0,120)}:null}).filter(Boolean).slice(0,3);
    return Response.json({recommendations,usingDemoData:true});
  } catch (error) {
    return Response.json({error:error instanceof Error?error.message:'Organisation matching failed.'},{status:500});
  }
}