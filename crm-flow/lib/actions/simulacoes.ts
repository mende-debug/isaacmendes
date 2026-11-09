"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { exigirUsuario } from "@/lib/session";
import { calcularFluxo, normalizarFluxo, type Cenario, type FluxoInput } from "@/lib/fluxo";
import { sanitizarCenarios } from "@/lib/cenarios";

const LIMITE_JSON = 200_000;

/** Chave do cliente: minúsculas, sem acento e espaços repetidos. */
function chaveCliente(nome: string) {
  return nome.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
}

function sanitizarFluxo(dados: unknown): FluxoInput {
  const json = JSON.stringify(dados ?? {});
  if (json.length > LIMITE_JSON) throw new Error("Simulação grande demais");
  return normalizarFluxo(JSON.parse(json));
}

async function clienteIdPara(userId: string, nome: string, telefone: string) {
  const chave = chaveCliente(nome);
  if (!chave) return null;
  const cliente = await prisma.cliente.upsert({
    where: { userId_chave: { userId, chave } },
    update: { nome: nome.trim(), ...(telefone.trim() ? { telefone: telefone.trim() } : {}) },
    create: { userId, chave, nome: nome.trim(), telefone: telefone.trim() },
  });
  return cliente.id;
}

function camposDerivados(f: FluxoInput) {
  const r = calcularFluxo(f);
  return {
    titulo: f.cliente.nome.trim() || "Sem nome",
    empreendimento: f.cliente.empreendimento.trim(),
    unidade: f.cliente.unidade.trim(),
    valorImovel: f.imovel.valorImovel ?? 0,
    saldo: r.saldo,
    fechado: r.fechado,
    dados: JSON.stringify(f),
  };
}

/** Cria (sem id) ou atualiza uma simulação. Devolve o id. */
export async function salvarSimulacao(id: string | null, dados: FluxoInput): Promise<{ id: string }> {
  const user = await exigirUsuario();
  const f = sanitizarFluxo(dados);
  const clienteId = await clienteIdPara(user.id, f.cliente.nome, f.cliente.telefone);
  const campos = { ...camposDerivados(f), clienteId };

  let simId: string;
  if (id) {
    const { count } = await prisma.simulacao.updateMany({ where: { id, userId: user.id }, data: campos });
    if (!count) throw new Error("Simulação não encontrada");
    simId = id;
  } else {
    simId = (await prisma.simulacao.create({ data: { ...campos, userId: user.id } })).id;
  }
  revalidatePath("/");
  return { id: simId };
}

export async function salvarCenarios(id: string, cenarios: Cenario[]) {
  const user = await exigirUsuario();
  const json = JSON.stringify(cenarios ?? []);
  if (json.length > LIMITE_JSON * 3) throw new Error("Cenários grandes demais");
  const { count } = await prisma.simulacao.updateMany({
    where: { id, userId: user.id },
    data: { cenarios: JSON.stringify(sanitizarCenarios(JSON.parse(json))) },
  });
  if (!count) throw new Error("Simulação não encontrada");
}

export async function duplicarSimulacao(form: FormData) {
  const user = await exigirUsuario();
  const id = String(form.get("id"));
  const original = await prisma.simulacao.findFirst({ where: { id, userId: user.id } });
  if (!original) throw new Error("Simulação não encontrada");
  const copia = await prisma.simulacao.create({
    data: {
      userId: user.id,
      clienteId: original.clienteId,
      titulo: original.titulo,
      empreendimento: original.empreendimento,
      unidade: original.unidade,
      valorImovel: original.valorImovel,
      saldo: original.saldo,
      fechado: original.fechado,
      dados: original.dados,
      cenarios: original.cenarios,
    },
  });
  revalidatePath("/");
  redirect(`/simulacoes/${copia.id}`);
}

export async function excluirSimulacao(form: FormData) {
  const user = await exigirUsuario();
  await prisma.simulacao.deleteMany({ where: { id: String(form.get("id")), userId: user.id } });
  revalidatePath("/");
  const volta = String(form.get("voltar") ?? "/");
  redirect(volta.startsWith("/") ? volta : "/");
}
