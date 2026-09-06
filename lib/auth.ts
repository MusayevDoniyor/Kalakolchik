import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "mindsnap_super_secure_jwt_secret_key_2026_x89a"
);

export async function validateAdminCredentials(email: string, pass: string): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL || "otabekabduvaliyev1910@gmail.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "qwerty_654321";
  return (
    email.trim().toLowerCase() === adminEmail.trim().toLowerCase() &&
    pass === adminPassword
  );
}

export async function createAdminSession(email: string) {
  const token = await new SignJWT({ role: "admin", email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);

  const cookieStore = await cookies();
  cookieStore.set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function verifyAdminSession(): Promise<{ valid: boolean; email?: string }> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) return { valid: false };

  try {
    const { payload } = await jwtVerify(token, secretKey);
    if (payload.role === "admin") {
      return { valid: true, email: payload.email as string };
    }
    return { valid: false };
  } catch {
    return { valid: false };
  }
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
}
