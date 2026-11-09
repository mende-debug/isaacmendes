import Link from "next/link";
import { prisma } from "@/lib/db";
import { exigirUsuario } from "@/lib/session";

export const metadata = { title: "Clientes" };

export default async function Clientes() {
  const user = await exigirUsuario();
  const clientes = await prisma.cliente.findMany({
    where: { userId: user.id, simulacoes: { some: {} } },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { simulacoes: true } } },
  });
  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-5 text-2xl font-bold tracking-tight">Clientes</h1>
      {clientes.length === 0 ? (
        <p className="card p-8 text-center text-muted">Os clientes aparecem aqui quando você salva uma simulação.</p>
      ) : (
        <ul className="card divide-y divide-line">
          {clientes.map((c) => (
            <li key={c.id}>
              <Link href={`/clientes/${c.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand/15 text-sm font-bold text-brand-soft">
                  {c.nome.slice(0, 1).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{c.nome}</span>
                  {c.telefone && <span className="block text-sm text-muted">{c.telefone}</span>}
                </span>
                <span className="text-sm text-muted">
                  {c._count.simulacoes} {c._count.simulacoes === 1 ? "simulação" : "simulações"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
