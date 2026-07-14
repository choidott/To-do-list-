import { NextResponse } from "next/server";

// 배포 문제 진단용 임시 엔드포인트 — 문제 해결 후 삭제할 것
export async function GET() {
  return NextResponse.json({
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? "(없음)",
    VERCEL_URL: process.env.VERCEL_URL ?? "(없음)",
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ? "설정됨" : "(없음)",
    DATABASE_URL: process.env.DATABASE_URL ? "설정됨" : "(없음)",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "설정됨" : "(없음)",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET
      ? "설정됨"
      : "(없음)",
  });
}
