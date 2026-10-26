"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Simulações", ativo: (p: string) => p === "/" || p.startsWith("/simulacoes") },
  { href: "/clientes", label: "Clientes", ativo: (p: string) => p.startsWith("/clientes") },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-1">
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
            l.ativo(pathname) ? "bg-brand/15 text-brand-soft" : "text-muted hover:text-fg"
          }`}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
