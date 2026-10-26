import Link from "next/link";
import { notFound } from "next/navigation";
import { CardSimulacao } from "@/components/CardSimulacao";
import { IconeVoltar } from "@/components/Icones";
import { prisma } from "@/lib/db";
import { exigirUsuario } from "@/lib/session";

export default async function ClientePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await exigirUsuario();
  const { id } = await params;
  const cliente = await prisma.cliente.findFirst({
    where: { id, userId: user.id },
    include: {
      simulacoes: {
        orderBy: { updatedAt: "desc" },
        select: { id: true, titulo: true, empreendimento: true, unidade: true, valorImovel: true, saldo: true, fechado: true, updatedAt: true },
      },
    },
  });
  if (!cliente) notFound();
  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <Link href="/clientes" className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-fg">
        <IconeVoltar className="size-4" /> Clientes
      </Link>
      <h1 className="text-2xl font-bold tracking-tight">{cliente.nome}</h1>
      <p className="mb-6 text-sm text-muted">
        {cliente.telefone || "Sem telefone"} · {cliente.simulacoes.length} {cliente.simulacoes.length === 1 ? "simulação" : "simulações"}
      </p>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cliente.simulacoes.map((s) => (
          <CardSimulacao key={s.id} s={s} voltar={`/clientes/${cliente.id}`} />
        ))}
      </ul>
    </main>
  );
}
