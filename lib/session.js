import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "event_membership_session";

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("Missing SESSION_SECRET.");
  }
  return secret;
}

function base64url(input) {
  return Buffer.from(input).toString("base64url");
}

function sign(payload) {
  return crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");
}

export function createSessionToken(user) {
  const payload = base64url(
    JSON.stringify({
      user,
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
    })
  );

  const signature = sign(payload);

  return `${payload}.${signature}`;
}

export function verifySessionToken(token) {
  if (!token || !token.includes(".")) return null;

  const [payload, signature] = token.split(".");
  const expected = sign(payload);

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }

  const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));

  if (!decoded.exp || decoded.exp < Date.now()) {
    return null;
  }

  return decoded.user;
}

export async function setSessionCookie(user) {
  const token = createSessionToken(user);
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  return verifySessionToken(token);
}
