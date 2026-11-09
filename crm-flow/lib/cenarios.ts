import { MAX_CENARIOS, normalizarFluxo, type Cenario } from "./fluxo";

/** Valida cenários extras vindos do banco ou do cliente (o principal não entra aqui). */
export function sanitizarCenarios(cenarios: unknown): Cenario[] {
  if (!Array.isArray(cenarios)) return [];
  return cenarios.slice(0, MAX_CENARIOS - 1).map((c, i) => ({
    nome: String(c?.nome ?? `Cenário ${i + 2}`).slice(0, 40),
    input: normalizarFluxo(c?.input),
  }));
}
