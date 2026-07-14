import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Vibe App</h1>
      <Link
        href="/login"
        className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
      >
        로그인 하러 가기
      </Link>
    </main>
  );
}
