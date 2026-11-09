import { Logo } from "@/components/Logo";

export const metadata = { title: "Sem conexão" };

export default function Offline() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center gap-4 p-6 text-center">
      <Logo />
      <h1 className="text-xl font-semibold">Você está sem conexão</h1>
      <p className="text-sm text-muted">Assim que a internet voltar, o CRM Flow carrega normalmente.</p>
    </main>
  );
}
