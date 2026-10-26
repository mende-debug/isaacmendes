import { notFound } from "next/navigation";
import { Proposta } from "@/components/Proposta";
import { carregarSimulacao } from "@/lib/queries";

export const metadata = { title: "Proposta" };

export default async function PropostaPage({ params }: { params: Promise<{ id: string }> }) {
  const sim = await carregarSimulacao((await params).id);
  if (!sim) notFound();
  return <Proposta id={sim.id} f={sim.dados} consultor={sim.user.nome} />;
}
