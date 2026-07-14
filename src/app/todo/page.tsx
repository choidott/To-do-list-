import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";
import { TodoList, type Todo, type Folder } from "./todo-list";

export default async function TodoPage({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  const { folder: activeFolderId } = await searchParams;

  const { rows: folders } = await pool.query<Folder>(
    `select "id", "name"
     from "folder"
     where "userId" = $1
     order by "createdAt" asc`,
    [session.user.id]
  );

  const { rows: todos } = activeFolderId
    ? await pool.query<Todo>(
        `select "id", "content", "isCompleted", "createdAt", "folderId"
         from "todo"
         where "userId" = $1 and "folderId" = $2
         order by "createdAt" desc`,
        [session.user.id, activeFolderId]
      )
    : await pool.query<Todo>(
        `select "id", "content", "isCompleted", "createdAt", "folderId"
         from "todo"
         where "userId" = $1
         order by "createdAt" desc`,
        [session.user.id]
      );

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="mb-1 text-2xl font-bold">할 일 목록</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {session.user.name ?? session.user.email}님의 할 일
      </p>
      <TodoList
        todos={todos}
        folders={folders}
        activeFolderId={activeFolderId ?? null}
      />
    </main>
  );
}
