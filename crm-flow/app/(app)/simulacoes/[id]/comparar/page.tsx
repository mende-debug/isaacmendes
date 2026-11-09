import { notFound } from "next/navigation";
import { Comparador } from "@/components/Comparador";
import { carregarSimulacao } from "@/lib/queries";

export const metadata = { title: "Comparar cenários" };

export default async function CompararPage({ params }: { params: Promise<{ id: string }> }) {
  const sim = await carregarSimulacao((await params).id);
  if (!sim) notFound();
  return <Comparador key={sim.id} id={sim.id} base={sim.dados} cenariosIniciais={sim.cenarios} />;
}
