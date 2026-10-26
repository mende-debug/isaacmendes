"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { salvarCenarios, salvarSimulacao } from "@/lib/actions/simulacoes";
import {
  aplicarSugestaoMensal,
  compararCenarios,
  formatarBRL,
  formatarPercentual,
  MAX_CENARIOS,
  type Cenario,
  type FluxoInput,
  type ResumoCenario,
} from "@/lib/fluxo";
import { CampoInteiro, CampoMoeda, Segmentado } from "./campos";
import { IconePlus, IconeLixo, IconeVoltar } from "./Icones";

const NOMES = ["Cenário B", "Cenário C"];

export function Comparador({ id, base: baseInicial, cenariosIniciais }: { id: string; base: FluxoInput; cenariosIniciais: Cenario[] }) {
  const router = useRouter();
  const [base, setBase] = useState(baseInicial);
  const [extras, setExtras] = useState<Cenario[]>(cenariosIniciais);
  const [alterado, setAlterado] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();

  const todos: Cenario[] = useMemo(() => [{ nome: "Atual", input: base }, ...extras], [base, extras]);
  const resumos = useMemo(() => compararCenarios(todos), [todos]);

  const mudarExtras = (novos: Cenario[]) => {
    setExtras(novos);
    setAlterado(true);
  };
  const editar = (i: number, input: FluxoInput) => mudarExtras(extras.map((c, j) => (j === i ? { ...c, input } : c)));
  const adicionar = () => {
    const usados = new Set(extras.map((c) => c.nome));
    const nome = NOMES.find((x) => !usados.has(x)) ?? `Cenário ${extras.length + 2}`;
    mudarExtras([...extras, { nome, input: structuredClone(base) }]);
  };

  const avisar = (m: string) => {
    setMensagem(m);
    setTimeout(() => setMensagem(null), 2500);
  };

  const salvar = () =>
    iniciar(async () => {
      try {
        await salvarCenarios(id, extras);
        setAlterado(false);
        avisar("Cenários salvos");
      } catch {
        avisar("Não foi possível salvar");
      }
    });

  const tornarPrincipal = (i: number) => {
    if (!confirm(`Usar o ${extras[i].nome} como fluxo principal da simulação?`)) return;
    iniciar(async () => {
      const novoBase = extras[i].input;
      const novosExtras = extras.map((c, j) => (j === i ? { ...c, input: base, nome: `${c.nome} (anterior)`.slice(0, 40) } : c));
      try {
        await salvarSimulacao(id, novoBase);
        await salvarCenarios(id, novosExtras);
        setBase(novoBase);
        setExtras(novosExtras);
        setAlterado(false);
        avisar("Fluxo principal atualizado");
      } catch {
        avisar("Não foi possível salvar");
      }
    });
  };

  const salvarComoNova = (i: number) =>
    iniciar(async () => {
      try {
        const { id: novoId } = await salvarSimulacao(null, extras[i].input);
        router.push(`/simulacoes/${novoId}`);
      } catch {
        avisar("Não foi possível salvar");
      }
    });

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 pb-24">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Link href={`/simulacoes/${id}`} className="grid size-9 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-fg" aria-label="Voltar">
          <IconeVoltar />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold">Comparar cenários</h1>
          <p className="truncate text-xs text-muted">
            {base.cliente.nome || "Sem nome"} · até {MAX_CENARIOS} cenários
            {alterado && <span className="ml-2 text-warn">• não salvo</span>}
          </p>
        </div>
        {extras.length < MAX_CENARIOS - 1 && (
          <button className="btn-ghost px-3" onClick={adicionar}>
            <IconePlus className="size-4" /> <span className="hidden sm:inline">Adicionar cenário</span>
          </button>
        )}
        <button className="btn-primary px-3" onClick={salvar} disabled={pendente || !alterado}>
          Salvar
        </button>
      </div>

      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
        {resumos.map((res, i) => (
          <div key={i} className="w-[85vw] max-w-sm shrink-0 snap-center lg:w-auto lg:max-w-none">
            {i === 0 ? (
              <ColunaBase resumo={res} input={base} id={id} />
            ) : (
              <ColunaEditavel
                resumo={res}
                cenario={extras[i - 1]}
                onRenomear={(nome) => mudarExtras(extras.map((c, j) => (j === i - 1 ? { ...c, nome: nome.slice(0, 40) } : c)))}
                onEditar={(input) => editar(i - 1, input)}
                onRemover={() => mudarExtras(extras.filter((_, j) => j !== i - 1))}
                onPrincipal={() => tornarPrincipal(i - 1)}
                onNova={() => salvarComoNova(i - 1)}
                pendente={pendente}
              />
            )}
          </div>
        ))}
        {extras.length === 0 && (
          <button
            onClick={adicionar}
            className="card flex w-[85vw] max-w-sm shrink-0 snap-center flex-col items-center justify-center gap-2 border-dashed p-10 text-muted hover:border-brand hover:text-fg lg:w-auto lg:max-w-none"
          >
            <IconePlus className="size-6" />
            Criar um cenário a partir do atual
          </button>
        )}
      </div>

      <TabelaComparativa resumos={resumos} />

      {mensagem && (
        <div className="fixed top-20 left-1/2 z-40 -translate-x-1/2 rounded-xl border border-brand/40 bg-surface-2 px-4 py-2 text-sm font-medium shadow-xl" role="status">
          {mensagem}
        </div>
      )}
    </div>
  );
}

function Status({ r }: { r: ResumoCenario }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${r.fechado ? "bg-ok/15 text-ok" : "bg-danger/15 text-danger"}`}>
      {r.fechado ? "Fechado" : formatarBRL(r.saldo)}
    </span>
  );
}

function ColunaBase({ resumo, input, id }: { resumo: ResumoCenario; input: FluxoInput; id: string }) {
  return (
    <div className="card h-full p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-bold">Atual</h2>
        <Status r={resumo} />
      </div>
      <dl className="tabular space-y-2 text-sm">
        {resumo.resultado.linhas
          .filter((l) => l.total !== 0)
          .map((l) => (
            <div key={l.id} className="flex justify-between gap-2">
              <dt className="text-muted">
                {l.label}
                {l.quantidade > 1 && ` (${l.quantidade}×)`}
              </dt>
              <dd className="font-medium">{formatarBRL(l.valor)}</dd>
            </div>
          ))}
        <div className="flex justify-between gap-2">
          <dt className="text-muted">Financiamento</dt>
          <dd className="font-medium">
            {input.laudo.prazoMeses ?? 0} meses · {input.laudo.amortizacao === "PRICE" ? "Price" : "SAC"}
          </dd>
        </div>
      </dl>
      <Link href={`/simulacoes/${id}`} className="btn-ghost mt-4 w-full">
        Editar no simulador
      </Link>
    </div>
  );
}

function ColunaEditavel({
  resumo,
  cenario,
  onRenomear,
  onEditar,
  onRemover,
  onPrincipal,
  onNova,
  pendente,
}: {
  resumo: ResumoCenario;
  cenario: Cenario;
  onRenomear: (n: string) => void;
  onEditar: (f: FluxoInput) => void;
  onRemover: () => void;
  onPrincipal: () => void;
  onNova: () => void;
  pendente: boolean;
}) {
  const f = cenario.input;
  const p = <K extends keyof FluxoInput["proposta"]>(k: K, v: FluxoInput["proposta"][K]) => onEditar({ ...f, proposta: { ...f.proposta, [k]: v } });
  const q = <K extends keyof FluxoInput["programacao"]>(k: K, v: FluxoInput["programacao"][K]) =>
    onEditar({ ...f, programacao: { ...f.programacao, [k]: v } });
  return (
    <div className="card h-full border-brand/30 p-4">
      <div className="mb-3 flex items-center gap-2">
        <input
          value={cenario.nome}
          onChange={(e) => onRenomear(e.target.value)}
          aria-label="Nome do cenário"
          className="min-w-0 flex-1 rounded-lg bg-transparent px-1 py-0.5 font-bold outline-none focus:bg-surface-2"
        />
        <Status r={resumo} />
        <button onClick={onRemover} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-danger/10 hover:text-danger" aria-label="Remover cenário">
          <IconeLixo className="size-4" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <CampoMoeda label="Ato" value={f.proposta.ato} onChange={(v) => p("ato", v)} className="col-span-2" />
        <CampoMoeda label="30 dias" value={f.proposta.d30} onChange={(v) => p("d30", v)} />
        <CampoMoeda label="60 dias" value={f.proposta.d60} onChange={(v) => p("d60", v)} />
        <CampoMoeda label="90 dias" value={f.proposta.d90} onChange={(v) => p("d90", v)} />
        <CampoMoeda label="Única" value={f.proposta.unica} onChange={(v) => p("unica", v)} />
        <CampoMoeda label="Mensal" value={f.proposta.mensal} onChange={(v) => p("mensal", v)} />
        <CampoInteiro label="Qtd. mensais" value={f.programacao.qtdMensais} onChange={(v) => q("qtdMensais", v)} />
        <CampoMoeda label="Anual" value={f.proposta.anual} onChange={(v) => p("anual", v)} />
        <CampoInteiro label="Qtd. anuais" value={f.programacao.qtdAnuais} onChange={(v) => q("qtdAnuais", v)} />
        <CampoMoeda label="Pró-soluto (parc.)" value={f.proposta.proSoluto} onChange={(v) => p("proSoluto", v)} />
        <CampoInteiro label="Qtd. pró-soluto" value={f.programacao.qtdProSoluto} onChange={(v) => q("qtdProSoluto", v)} />
        <CampoInteiro
          label="Prazo financ."
          sufixo="meses"
          value={f.laudo.prazoMeses}
          onChange={(v) => onEditar({ ...f, laudo: { ...f.laudo, prazoMeses: v } })}
        />
        <Segmentado
          label="Amortização"
          value={f.laudo.amortizacao}
          onChange={(v) => onEditar({ ...f, laudo: { ...f.laudo, amortizacao: v } })}
          opcoes={[
            { valor: "SAC", rotulo: "SAC" },
            { valor: "PRICE", rotulo: "Price" },
          ]}
        />
      </div>
      <div className="mt-4 grid gap-2">
        <button
          className="btn-ghost w-full"
          disabled={resumo.fechado || resumo.resultado.sugestaoMensal === null || resumo.resultado.sugestaoMensal < 0}
          onClick={() => onEditar(aplicarSugestaoMensal(f))}
        >
          Aplicar sugestão de mensal
          {resumo.resultado.sugestaoMensal !== null && !resumo.fechado && ` (${formatarBRL(resumo.resultado.sugestaoMensal)})`}
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button className="btn-ghost" onClick={onPrincipal} disabled={pendente}>
            Usar como principal
          </button>
          <button className="btn-ghost" onClick={onNova} disabled={pendente}>
            Salvar como nova
          </button>
        </div>
      </div>
    </div>
  );
}

function TabelaComparativa({ resumos }: { resumos: ResumoCenario[] }) {
  const linhas: { rotulo: string; valor: (r: ResumoCenario) => string; destaque?: (r: ResumoCenario) => string }[] = [
    { rotulo: "Saldo", valor: (r) => (r.fechado ? "Fechado" : formatarBRL(r.saldo)), destaque: (r) => (r.fechado ? "text-ok" : "text-danger") },
    { rotulo: "Entrada (ato + 30/60/90)", valor: (r) => formatarBRL(r.entrada) },
    { rotulo: "% entrada", valor: (r) => formatarPercentual(r.percentualEntrada) },
    { rotulo: "Mensal", valor: (r) => `${r.qtdMensais}× ${formatarBRL(r.mensal)}` },
    {
      rotulo: "Mensal / renda",
      valor: (r) => formatarPercentual(r.resultado.comprometimentoMensal),
      destaque: (r) => (r.resultado.alertas.some((a) => a.codigo === "mensal-acima") ? "text-danger" : ""),
    },
    { rotulo: "Total à construtora", valor: (r) => formatarBRL(r.totalConstrutora) },
    {
      rotulo: "Prestação financiamento",
      valor: (r) => formatarBRL(r.prestacao),
      destaque: (r) => (r.resultado.alertas.some((a) => a.codigo === "prestacao-acima") ? "text-danger" : ""),
    },
    { rotulo: "Total de juros", valor: (r) => formatarBRL(r.totalJuros) },
    { rotulo: "Acréscimo INCC (est.)", valor: (r) => formatarBRL(r.acrescimoIncc) },
  ];
  return (
    <div className="card mt-5 overflow-x-auto">
      <table className="tabular w-full min-w-[520px] text-sm">
        <thead>
          <tr className="border-b border-line text-left">
            <th className="sticky left-0 bg-surface px-4 py-3 font-medium text-muted">Comparativo</th>
            {resumos.map((r, i) => (
              <th key={i} className="px-4 py-3 text-right font-bold">
                {r.nome}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line/60">
          {linhas.map((l) => (
            <tr key={l.rotulo}>
              <td className="sticky left-0 bg-surface px-4 py-2.5 text-muted">{l.rotulo}</td>
              {resumos.map((r, i) => (
                <td key={i} className={`px-4 py-2.5 text-right font-semibold ${l.destaque?.(r) ?? ""}`}>
                  {l.valor(r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
