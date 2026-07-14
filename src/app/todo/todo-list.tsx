"use client";

import { useRef, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Folder as FolderIcon,
  List,
  LogOut,
  Moon,
  Plus,
  Sun,
  Trash2,
  X,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  addTodo,
  toggleTodo,
  deleteTodo,
  moveTodo,
  addFolder,
  deleteFolder,
} from "./actions";

export type Todo = {
  id: string;
  content: string;
  isCompleted: boolean;
  createdAt: string;
  folderId: string | null;
};

export type Folder = {
  id: string;
  name: string;
};

export function TodoList({
  todos,
  folders,
  activeFolderId,
}: {
  todos: Todo[];
  folders: Folder[];
  activeFolderId: string | null;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const folderFormRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  };

  const activeFolder = folders.find((f) => f.id === activeFolderId);

  // 진행률: 현재 보이는(폴더 필터링된) 할 일 기준
  const total = todos.length;
  const completed = todos.filter((t) => t.isCompleted).length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="flex gap-8">
      {/* ===== 왼쪽: 사이드바 (폴더 목록) ===== */}
      <aside className="flex w-52 shrink-0 flex-col">
        <nav className="space-y-1">
          {/* 전체 보기 */}
          <Link
            href="/todo"
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
              activeFolderId === null
                ? "bg-blue-600 font-medium text-white"
                : "hover:bg-accent"
            }`}
          >
            <List className="size-4" />
            전체 보기
          </Link>

          {/* 폴더 목록 */}
          {folders.map((folder) => (
            <div key={folder.id} className="group flex items-center">
              <Link
                href={`/todo?folder=${folder.id}`}
                className={`flex flex-1 items-center gap-2 rounded-md px-3 py-2 text-sm ${
                  activeFolderId === folder.id
                    ? "bg-blue-600 font-medium text-white"
                    : "hover:bg-accent"
                }`}
              >
                <FolderIcon className="size-4" />
                <span className="truncate">{folder.name}</span>
              </Link>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="폴더 삭제"
                disabled={isPending}
                className={
                  activeFolderId === folder.id
                    ? ""
                    : "invisible group-hover:visible"
                }
                onClick={() => {
                  if (
                    confirm(
                      "폴더를 삭제하시겠습니까?\n(안의 할 일은 삭제되지 않고 '전체 보기'로 이동합니다)"
                    )
                  ) {
                    startTransition(() => deleteFolder(folder.id));
                  }
                }}
              >
                <X className="size-3" />
              </Button>
            </div>
          ))}
        </nav>

        {/* 폴더 추가 (+) */}
        <form
          ref={folderFormRef}
          action={async (formData) => {
            await addFolder(formData);
            folderFormRef.current?.reset();
          }}
          className="mt-3 flex items-center gap-1 border-t pt-3"
        >
          <input
            name="name"
            placeholder="새 폴더 이름"
            required
            className="w-full min-w-0 flex-1 rounded-md border bg-transparent px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          />
          <Button
            type="submit"
            variant="outline"
            size="icon-sm"
            aria-label="폴더 추가"
          >
            <Plus className="size-4" />
          </Button>
        </form>

        {/* 다크 모드 토글 · 로그아웃 — 사이드바 맨 아래 */}
        <div className="mt-8 space-y-1 border-t pt-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
          >
            <Sun className="size-4 dark:hidden" />
            <Moon className="hidden size-4 dark:block" />
            <span className="dark:hidden">다크 모드</span>
            <span className="hidden dark:inline">라이트 모드</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-red-500 hover:text-red-600"
            onClick={handleLogout}
          >
            <LogOut className="size-4" />
            로그아웃
          </Button>
        </div>
      </aside>

      {/* ===== 오른쪽: 투두 리스트 ===== */}
      <section className="min-w-0 flex-1 space-y-4">
        <h2 className="text-lg font-semibold">
          {activeFolder ? activeFolder.name : "전체 보기"}
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            {total - completed}개 남음
          </span>
        </h2>

        {/* 할 일 입력 — 선택된 폴더가 있으면 자동으로 그 폴더에 저장 */}
        <form
          ref={formRef}
          action={async (formData) => {
            await addTodo(formData);
            formRef.current?.reset();
          }}
          className="flex gap-2"
        >
          {activeFolderId && (
            <input type="hidden" name="folderId" value={activeFolderId} />
          )}
          <input
            name="content"
            placeholder={
              activeFolder
                ? `'${activeFolder.name}' 폴더에 할 일 추가`
                : "할 일을 입력하세요 (예: 우유 사기)"
            }
            required
            className="flex-1 rounded-md border bg-transparent px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <Button type="submit">추가</Button>
        </form>

        {/* 진행률 표시바 */}
        {total > 0 && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                진행률 {completed}/{total}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
            {completed === total && (
              <p className="pt-1 text-center text-sm font-medium text-green-600 dark:text-green-400">
                모두 완료했습니다! 🎉
              </p>
            )}
          </div>
        )}

        {/* 할 일 목록 */}
        {todos.length === 0 ? (
          <p className="pt-8 text-center text-sm text-muted-foreground">
            {activeFolder
              ? `'${activeFolder.name}' 폴더가 비어 있습니다.`
              : "아직 할 일이 없습니다. 첫 할 일을 추가해 보세요!"}
          </p>
        ) : (
          <ul className="divide-y rounded-md border">
            {todos.map((todo) => (
              <li key={todo.id} className="flex items-center gap-3 px-4 py-3">
                <input
                  type="checkbox"
                  checked={todo.isCompleted}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    startTransition(() => toggleTodo(todo.id, checked));
                  }}
                  className="size-4 accent-blue-600"
                />
                <span
                  className={
                    todo.isCompleted
                      ? "flex-1 text-muted-foreground line-through"
                      : "flex-1"
                  }
                >
                  {todo.content}
                </span>
                {/* 폴더 이동 드롭다운 */}
                <select
                  value={todo.folderId ?? ""}
                  disabled={isPending}
                  aria-label="폴더 선택"
                  onChange={(e) => {
                    const folderId = e.target.value || null;
                    startTransition(() => moveTodo(todo.id, folderId));
                  }}
                  className="rounded-md border bg-transparent px-1.5 py-1 text-xs text-muted-foreground focus:border-blue-500 focus:outline-none"
                >
                  <option value="">폴더 없음</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-muted-foreground">
                  {new Date(todo.createdAt).toLocaleDateString("ko-KR")}
                </span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={isPending}
                  aria-label="삭제"
                  onClick={() => {
                    if (confirm("정말 삭제하시겠습니까?")) {
                      startTransition(() => deleteTodo(todo.id));
                    }
                  }}
                >
                  <Trash2 className="size-4 text-muted-foreground" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
