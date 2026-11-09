import { Simulador } from "@/components/Simulador";
import { criarFluxoVazio } from "@/lib/fluxo";

export const metadata = { title: "Nova simulação" };

export default function NovaSimulacao() {
  return <Simulador id={null} inicial={criarFluxoVazio()} />;
}
