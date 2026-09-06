// Prototype-only employee authentication for the five fictional specialists.
// Replace this with verified Base44 users before handling real client data.
import { ensurePrototypeSpecialists, removeDuplicateRosterProfiles } from './prototypeSpecialistRoster.ts';

const encoder = new TextEncoder();

const passwordHashes: Record<string, string> = {
  'maya.chen@example.org': 'd50a2cef50e8d45da9a5ca1095dc8aac7487946dc94f611c444dd5f17472721d',
  'aisha.rahman@example.org': 'af7ffc0372ef6aba6bcddc0eb885ed5199e8d2d61af4fb5422c556238f242041',
  'sophie.martin@example.org': '3466a28c6025d445e97726724b16f2db8009503a0146de56e93eb8e77562bdf2',
  'grace.williams@example.org': '1ad340ac9ed54d1690ac234b65f808af1c6d55af14c2f73a844457b9471eadfa',
  'elena.rossi@example.org': 'f370eb56bb2d4b87b89a451f6a47ce41fa29f146b106d542e7731fc447ccc3fa'
};

const signingKey = 'louos-fictional-specialists-prototype-2026-09';
const hex = (bytes: ArrayBuffer) => [...new Uint8Array(bytes)].map(byte => byte.toString(16).padStart(2, '0')).join('');
const base64url = (value: string) => btoa(value).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
const fromBase64url = (value: string) => atob(value.replace(/-/g, '+').replace(/_/g, '/'));
const digest = async (value: string) => hex(await crypto.subtle.digest('SHA-256', encoder.encode(value)));
const signature = async (value: string) => {
  const key = await crypto.subtle.importKey('raw', encoder.encode(signingKey), {name: 'HMAC', hash: 'SHA-256'}, false, ['sign']);
  return base64url(String.fromCharCode(...new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value)))));
};
const safeEqual = (left: string, right: string) => left.length === right.length && [...left].reduce((result, value, index) => result | (value.charCodeAt(0) ^ right.charCodeAt(index)), 0) === 0;

export const isPrototypeEmployeeEmail = (email: unknown) => typeof email === 'string' && Boolean(passwordHashes[email.trim().toLowerCase()]);

export async function verifyPrototypePassword(email: unknown, password: unknown) {
  const normalized = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const expected = passwordHashes[normalized];
  if (!expected || typeof password !== 'string') return '';
  return safeEqual(await digest(password), expected) ? normalized : '';
}

export async function createPrototypeEmployeeToken(email: string) {
  const payload = base64url(JSON.stringify({email, exp: Date.now() + 8 * 60 * 60 * 1000}));
  return `${payload}.${await signature(payload)}`;
}

export async function verifyPrototypeEmployeeToken(token: unknown) {
  if (typeof token !== 'string') return '';
  const [payload, suppliedSignature] = token.split('.');
  if (!payload || !suppliedSignature || !safeEqual(await signature(payload), suppliedSignature)) return '';
  try {
    const parsed = JSON.parse(fromBase64url(payload));
    return isPrototypeEmployeeEmail(parsed.email) && Number(parsed.exp) > Date.now() ? parsed.email : '';
  } catch {
    return '';
  }
}

// Looks up the active specialist profile for a prototype employee, provisioning
// the fictional roster first if it is missing (the local backend starts empty
// after every `base44 dev` restart).
// Picks the same profile every time even while a provisioning race is still
// settling, so a specialist's id does not flip between requests.
const earliest = (specialists: any[]) => specialists.slice().sort((left, right) =>
  String(left.created_date || '').localeCompare(String(right.created_date || '')) ||
  String(left.id).localeCompare(String(right.id)))[0] || null;

export async function findPrototypeSpecialist(email: string, entities: any) {
  const specialists = await entities.Specialist.filter({contact_email: email, active: true});
  // More than one profile for a single prototype email means a provisioning
  // race left duplicates behind. Seeing them is the only reliable signal that
  // cleanup is due, so clear them here rather than on the provisioning path,
  // which a warm table never reaches. The survivor is the record this call
  // returns, so the caller keeps a stable id.
  if (specialists.length > 1) await removeDuplicateRosterProfiles(entities);
  if (specialists.length) return earliest(specialists);
  await ensurePrototypeSpecialists(entities);
  return earliest(await entities.Specialist.filter({contact_email: email, active: true}));
}

export async function getPrototypeEmployee(body: any, entities: any) {
  const email = await verifyPrototypeEmployeeToken(body?.employeeToken);
  if (!email) return null;
  const specialist = await findPrototypeSpecialist(email, entities);
  return specialist ? {email, full_name: specialist.full_name, specialist} : null;
}
