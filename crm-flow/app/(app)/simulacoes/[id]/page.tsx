import { notFound } from "next/navigation";
import { Simulador } from "@/components/Simulador";
import { carregarSimulacao } from "@/lib/queries";

export const metadata = { title: "Simulador" };

export default async function SimulacaoPage({ params }: { params: Promise<{ id: string }> }) {
  const sim = await carregarSimulacao((await params).id);
  if (!sim) notFound();
  return <Simulador key={sim.id} id={sim.id} inicial={sim.dados} />;
}
