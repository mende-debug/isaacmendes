import Link from "next/link";
import { CardSimulacao } from "@/components/CardSimulacao";
import { IconeBusca, IconePlus } from "@/components/Icones";
import { prisma } from "@/lib/db";
import { exigirUsuario } from "@/lib/session";

export const metadata = { title: "Simulações" };

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user = await exigirUsuario();
  const q = ((await searchParams).q ?? "").trim();
  const filtro = q
    ? { OR: [{ titulo: { contains: q } }, { empreendimento: { contains: q } }, { unidade: { contains: q } }] }
    : {};
  const [simulacoes, total, fechadas] = await Promise.all([
    prisma.simulacao.findMany({
      where: { userId: user.id, ...filtro },
      orderBy: { updatedAt: "desc" },
      take: 60,
      select: { id: true, titulo: true, empreendimento: true, unidade: true, valorImovel: true, saldo: true, fechado: true, updatedAt: true },
    }),
    prisma.simulacao.count({ where: { userId: user.id } }),
    prisma.simulacao.count({ where: { userId: user.id, fechado: true } }),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Olá, {user.nome.split(" ")[0]}</p>
          <h1 className="text-2xl font-bold tracking-tight">Simulações</h1>
        </div>
        <Link href="/simulacoes/nova" className="btn-primary hidden sm:inline-flex">
          <IconePlus className="size-4" /> Nova simulação
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <Indicador titulo="Total" valor={total} />
        <Indicador titulo="Fechadas" valor={fechadas} cor="text-ok" />
        <Indicador titulo="Em aberto" valor={total - fechadas} cor="text-danger" />
      </div>

      <form className="relative mb-5" action="/">
        <IconeBusca className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
        <input name="q" defaultValue={q} placeholder="Buscar cliente, empreendimento ou unidade" className="field pl-9" />
      </form>

      {simulacoes.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-10 text-center">
          <p className="text-muted">{q ? "Nenhuma simulação encontrada." : "Você ainda não tem simulações."}</p>
          <Link href="/simulacoes/nova" className="btn-primary">
            <IconePlus className="size-4" /> Nova simulação
          </Link>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {simulacoes.map((s) => (
            <CardSimulacao key={s.id} s={s} />
          ))}
        </ul>
      )}

      <Link
        href="/simulacoes/nova"
        className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-20 grid size-14 place-items-center rounded-full bg-brand text-white shadow-xl shadow-brand/40 sm:hidden"
        aria-label="Nova simulação"
      >
        <IconePlus className="size-6" />
      </Link>
    </main>
  );
}

function Indicador({ titulo, valor, cor = "text-fg" }: { titulo: string; valor: number; cor?: string }) {
  return (
    <div className="card px-4 py-3">
      <p className="text-xs text-muted">{titulo}</p>
      <p className={`tabular text-2xl font-bold ${cor}`}>{valor}</p>
    </div>
  );
}
