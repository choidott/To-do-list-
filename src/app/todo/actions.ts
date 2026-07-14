"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";

async function requireUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("로그인이 필요합니다.");
  }
  return session.user.id;
}

export async function addTodo(formData: FormData) {
  const userId = await requireUserId();
  const content = (formData.get("content") as string)?.trim();
  if (!content) return;
  const folderId = (formData.get("folderId") as string) || null;

  await pool.query(
    `insert into "todo" ("id", "content", "userId", "folderId") values ($1, $2, $3, $4)`,
    [randomUUID(), content, userId, folderId]
  );
  revalidatePath("/todo");
}

export async function toggleTodo(id: string, isCompleted: boolean) {
  const userId = await requireUserId();
  await pool.query(
    `update "todo" set "isCompleted" = $1 where "id" = $2 and "userId" = $3`,
    [isCompleted, id, userId]
  );
  revalidatePath("/todo");
}

export async function deleteTodo(id: string) {
  const userId = await requireUserId();
  await pool.query(`delete from "todo" where "id" = $1 and "userId" = $2`, [
    id,
    userId,
  ]);
  revalidatePath("/todo");
}

export async function moveTodo(id: string, folderId: string | null) {
  const userId = await requireUserId();
  await pool.query(
    `update "todo" set "folderId" = $1 where "id" = $2 and "userId" = $3`,
    [folderId, id, userId]
  );
  revalidatePath("/todo");
}

export async function addFolder(formData: FormData) {
  const userId = await requireUserId();
  const name = (formData.get("name") as string)?.trim();
  if (!name) return;

  await pool.query(
    `insert into "folder" ("id", "name", "userId") values ($1, $2, $3)`,
    [randomUUID(), name, userId]
  );
  revalidatePath("/todo");
}

export async function deleteFolder(id: string) {
  const userId = await requireUserId();
  // 폴더만 삭제 — 안의 할 일은 folderId가 NULL이 되어 '전체'에 남는다 (on delete set null)
  await pool.query(`delete from "folder" where "id" = $1 and "userId" = $2`, [
    id,
    userId,
  ]);
  revalidatePath("/todo");
}
