import crypto from 'crypto';

export function genVerifier(len = 64) {
  return crypto.randomBytes(len).toString('base64url');
}

export function genChallenge(verifier: string) {
  const hash = crypto.createHash('sha256').update(verifier).digest();
  return hash.toString('base64url');
}
