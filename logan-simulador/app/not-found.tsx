import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center gap-4 p-6 text-center">
      <Logo />
      <h1 className="text-xl font-semibold">Página não encontrada</h1>
      <Link href="/" className="btn-primary">Voltar ao início</Link>
    </main>
  );
}
