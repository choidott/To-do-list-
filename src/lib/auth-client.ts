import { createAuthClient } from "better-auth/react";

// baseURL을 지정하지 않으면 현재 접속 중인 주소(origin)를 자동으로 사용한다.
// 로컬(localhost:3000)에서도, Vercel 배포 주소에서도 환경변수 없이 올바르게 동작.
export const authClient = createAuthClient();
