"use server";
import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);
export type UserData = {
  id: number;
  name: string;
  email: string;
  access_token: string;
  role_id: 1 | 2 | 3 | 4;
}

export async function createSession(user: UserData) {
  const session = await encrypt({
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    userAccessToken: user.access_token,
    userRole: user.role_id,
  });

  (await cookies()).set("session", session, {
    httpOnly: true,
    secure: true,
  });
}

export async function deleteSession() {
  (await cookies()).delete("session");
}

export type SessionPayload = {
  userId: number;
  companyId?: number;
  userName?: string;
  userEmail?: string;
  userAccessToken: string;
  userRole: 1 | 2 | 3 | 4;
};

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = "") {
  if (!session) return null;
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    console.log({error});
  }
}

export async function getUserData(): Promise<SessionPayload> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  const session = await decrypt(sessionCookie);
  return session as SessionPayload;
}

export async function isAdmin(): Promise<boolean> {
  const user = await getUserData();
  return user?.userRole === 1 || user?.userRole === 2;
}