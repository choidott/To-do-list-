import { betterAuth } from "better-auth";
import { pool } from "@/lib/db";

// baseURL 우선순위:
// 1. BETTER_AUTH_URL (직접 지정한 값)
// 2. VERCEL_URL (Vercel 배포 시 자동 제공, 프로토콜이 없어서 https:// 붙임)
// 3. localhost (로컬 개발 기본값)
const baseURL =
  process.env.BETTER_AUTH_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
