import "server-only";
import { prisma } from "./db";
import { normalizarFluxo, type Cenario } from "./fluxo";
import { sanitizarCenarios } from "./cenarios";
import { exigirUsuario } from "./session";

/** Simulação do usuário logado, ou null. */
export async function carregarSimulacao(id: string) {
  const user = await exigirUsuario();
  const sim = await prisma.simulacao.findFirst({ where: { id, userId: user.id } });
  if (!sim) return null;
  let cenarios: Cenario[] = [];
  try {
    cenarios = sanitizarCenarios(JSON.parse(sim.cenarios));
  } catch {
    cenarios = [];
  }
  return { id: sim.id, updatedAt: sim.updatedAt, dados: normalizarFluxo(JSON.parse(sim.dados)), cenarios, user };
}
