import Link from "next/link";
import { Logo } from "@/components/Logo";
import { IconeSair } from "@/components/Icones";
import { NavLinks } from "@/components/NavLinks";
import { sair } from "@/lib/actions/auth";
import { exigirUsuario } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await exigirUsuario();
  return (
    <div className="min-h-dvh pb-[env(safe-area-inset-bottom)]">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/85 pt-[env(safe-area-inset-top)] backdrop-blur-xl print:hidden">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
          <Link href="/" aria-label="Início">
            <span className="sm:hidden"><Logo compacto /></span>
            <span className="hidden sm:inline"><Logo /></span>
          </Link>
          <NavLinks />
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-muted md:inline">{user.nome}</span>
            <form action={sair}>
              <button className="grid size-9 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-fg" aria-label="Sair" title="Sair">
                <IconeSair />
              </button>
            </form>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
