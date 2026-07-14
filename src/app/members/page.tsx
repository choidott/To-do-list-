import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";

export default async function MembersPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  const { rows: members } = await pool.query<{
    name: string;
    email: string;
    createdAt: string;
  }>(`select name, email, "createdAt" from "user" order by "createdAt" desc`);

  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="mb-4 text-2xl font-bold">회원 명부</h1>
      <p className="mb-6 text-sm text-gray-500">
        {session.user.name ?? session.user.email}님으로 로그인됨
      </p>
      <ul className="divide-y divide-gray-200 rounded-md border border-gray-200">
        {members.map((m, i) => (
          <li key={i} className="p-3">
            <div className="font-medium">{m.name}</div>
            <div className="text-sm text-gray-500">{m.email}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
