import { secrets } from 'base44:runtime';

// secrets.get throws when a secret has never been set, so unconfigured keys must not crash the function.
export const optionalSecret = (name: string) => { try { return secrets.get(name) || ''; } catch { return ''; } };
