import { SignJWT, jwtVerify } from "jose";

const encoder = new TextEncoder();

export type SessionPayload = { email: string };

export async function createSessionToken(
  payload: SessionPayload,
  secret: string,
  expiresInSeconds = 60 * 60 * 24 * 7,
): Promise<string> {
  const expiration = new Date(Date.now() + expiresInSeconds * 1000);
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiration)
    .sign(encoder.encode(secret));
}

export async function verifySessionToken(token: string, secret: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encoder.encode(secret));
    if (typeof payload.email !== "string") return null;
    return { email: payload.email };
  } catch {
    return null;
  }
}
