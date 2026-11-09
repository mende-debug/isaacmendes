"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { salvarSimulacao } from "@/lib/actions/simulacoes";
import {
  aplicarSugestaoMensal,
  aplicarSugestaoProSoluto,
  calcularFluxo,
  formatarBRL,
  formatarPercentual,
  n,
  type FluxoInput,
  type FluxoResultado,
  type LinhaId,
} from "@/lib/fluxo";
import { Alertas } from "./Alertas";
import { Calculado, CampoInteiro, CampoMoeda, CampoPercentual, CampoTexto, Interruptor, Secao, Segmentado } from "./campos";
import { IconeAvancar, IconeColunas, IconeDoc, IconeSalvar, IconeVoltar } from "./Icones";
import { TabelaAmortizacao } from "./TabelaAmortizacao";

const PASSOS = ["Cliente", "Renda/Laudo", "Imóvel", "Fluxo", "Resumo"] as const;

type Atualizar = <S extends keyof FluxoInput, K extends keyof FluxoInput[S]>(secao: S, campo: K, valor: FluxoInput[S][K]) => void;

export function Simulador({ id, inicial }: { id: string | null; inicial: FluxoInput }) {
  const router = useRouter();
  const [f, setF] = useState(inicial);
  const [passo, setPasso] = useState(0);
  const [simId, setSimId] = useState(id);
  const [alterado, setAlterado] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [salvando, iniciarSalvar] = useTransition();
  const r = useMemo(() => calcularFluxo(f), [f]);

  const set: Atualizar = (secao, campo, valor) => {
    setF((prev) => ({ ...prev, [secao]: { ...prev[secao], [campo]: valor } }));
    setAlterado(true);
  };
  const substituir = (novo: FluxoInput) => {
    setF(novo);
    setAlterado(true);
  };

  useEffect(() => {
    if (!alterado) return;
    const aviso = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", aviso);
    return () => window.removeEventListener("beforeunload", aviso);
  }, [alterado]);

  useEffect(() => {
    if (!mensagem) return;
    const t = setTimeout(() => setMensagem(null), 2500);
    return () => clearTimeout(t);
  }, [mensagem]);

  /** Salva e devolve o id (cria na primeira vez). */
  async function salvar(): Promise<string | null> {
    try {
      const res = await salvarSimulacao(simId, f);
      if (!simId) window.history.replaceState(null, "", `/simulacoes/${res.id}`);
      setSimId(res.id);
      setAlterado(false);
      return res.id;
    } catch {
      setMensagem("Não foi possível salvar. Verifique a conexão.");
      return null;
    }
  }

  const salvarEIr = (destino: "proposta" | "comparar") =>
    iniciarSalvar(async () => {
      const salvoId = alterado || !simId ? await salvar() : simId;
      if (salvoId) router.push(`/simulacoes/${salvoId}/${destino}`);
    });

  const vis = (p: number) => (passo === p ? "" : "hidden lg:block");

  return (
    <div className="mx-auto max-w-7xl px-4 pt-4 pb-32 lg:pb-10">
      {/* Barra de ações */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Link href="/" className="grid size-9 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-fg" aria-label="Voltar">
          <IconeVoltar />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold">{f.cliente.nome || "Nova simulação"}</h1>
          <p className="truncate text-xs text-muted">
            {[f.cliente.empreendimento, f.cliente.unidade].filter(Boolean).join(" · ") || "Preencha os dados do cliente"}
            {alterado && <span className="ml-2 text-warn">• não salvo</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-ghost px-3" onClick={() => salvarEIr("comparar")} disabled={salvando} title="Comparar cenários">
            <IconeColunas className="size-4" />
            <span className="hidden sm:inline">Comparar</span>
          </button>
          <button className="btn-ghost px-3" onClick={() => salvarEIr("proposta")} disabled={salvando} title="Proposta">
            <IconeDoc className="size-4" />
            <span className="hidden sm:inline">Proposta</span>
          </button>
          <button
            className="btn-primary px-3"
            disabled={salvando}
            onClick={() =>
              iniciarSalvar(async () => {
                if (await salvar()) setMensagem("Simulação salva");
              })
            }
          >
            <IconeSalvar className="size-4" />
            <span className="hidden sm:inline">{salvando ? "Salvando…" : "Salvar"}</span>
          </button>
        </div>
      </div>

      {/* Etapas (celular) */}
      <nav className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden" aria-label="Etapas">
        {PASSOS.map((p, i) => (
          <button
            key={p}
            onClick={() => setPasso(i)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
              passo === i ? "border-brand bg-brand text-white" : "border-line text-muted"
            }`}
          >
            {i + 1}. {p}
          </button>
        ))}
      </nav>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_360px] lg:items-start">
        <div className="space-y-4">
          <SecaoCliente f={f} set={set} className={vis(0)} />
          <SecaoRendaLaudo f={f} r={r} set={set} className={vis(1)} />
        </div>
        <div className="space-y-4">
          <SecaoImovel f={f} r={r} set={set} className={vis(2)} />
          <SecaoFluxo f={f} r={r} set={set} substituir={substituir} className={vis(3)} />
        </div>
        <div className={`space-y-4 lg:sticky lg:top-20 ${vis(4)}`}>
          <PainelResumo f={f} r={r} set={set} />
        </div>
      </div>

      {/* Rodapé fixo (celular): saldo + navegação */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-bg/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <button className="btn-ghost size-11 p-0" disabled={passo === 0} onClick={() => setPasso(passo - 1)} aria-label="Etapa anterior">
            <IconeVoltar />
          </button>
          <button onClick={() => setPasso(3)} className="min-w-0 flex-1 text-center">
            <span className="block text-[11px] tracking-wide text-muted uppercase">Saldo do fluxo</span>
            <span className={`tabular block truncate text-base font-bold ${r.fechado ? "text-ok" : "text-danger"}`}>
              {r.fechado ? "Fluxo fechado" : n(f.imovel.valorImovel) > 0 ? formatarBRL(r.saldo) : "—"}
            </span>
          </button>
          {passo < PASSOS.length - 1 ? (
            <button className="btn-primary h-11 px-4" onClick={() => setPasso(passo + 1)}>
              {PASSOS[passo + 1]} <IconeAvancar className="size-4" />
            </button>
          ) : (
            <button className="btn-primary h-11 px-4" onClick={() => salvarEIr("proposta")} disabled={salvando}>
              Proposta <IconeAvancar className="size-4" />
            </button>
          )}
        </div>
      </div>

      {mensagem && (
        <div className="fixed top-20 left-1/2 z-40 -translate-x-1/2 rounded-xl border border-brand/40 bg-surface-2 px-4 py-2 text-sm font-medium shadow-xl" role="status">
          {mensagem}
        </div>
      )}
    </div>
  );
}

type PropsSecao = { f: FluxoInput; set: Atualizar; className?: string };

function SecaoCliente({ f, set, className }: PropsSecao) {
  return (
    <Secao numero={1} titulo="Informações gerais" className={className}>
      <div className="grid gap-3 sm:grid-cols-2">
        <CampoTexto label="Cliente" obrigatorio value={f.cliente.nome} onChange={(v) => set("cliente", "nome", v)} autoComplete="off" autoCapitalize="words" className="sm:col-span-2" />
        <CampoTexto
          label="WhatsApp do cliente"
          value={f.cliente.telefone}
          onChange={(v) => set("cliente", "telefone", v)}
          inputMode="tel"
          placeholder="(11) 98888-7777"
          autoComplete="off"
          className="sm:col-span-2"
        />
        <CampoTexto label="Empreendimento" obrigatorio value={f.cliente.empreendimento} onChange={(v) => set("cliente", "empreendimento", v)} autoComplete="off" />
        <CampoTexto label="Unidade" obrigatorio value={f.cliente.unidade} onChange={(v) => set("cliente", "unidade", v)} autoComplete="off" />
      </div>
    </Secao>
  );
}

function SecaoRendaLaudo({ f, r, set, className }: PropsSecao & { r: FluxoResultado }) {
  return (
    <div className={`space-y-4 ${className ?? ""}`}>
      <Secao numero={2} titulo="Renda">
        <div className="grid grid-cols-2 gap-3">
          <CampoMoeda label="Renda apurada" obrigatorio value={f.renda.rendaApurada} onChange={(v) => set("renda", "rendaApurada", v)} className="col-span-2" />
          <CampoPercentual
            label="% comprometimento"
            value={f.renda.percentualComprometimento}
            onChange={(v) => set("renda", "percentualComprometimento", v ?? 0)}
          />
          <Calculado label="Parcela máxima" valor={formatarBRL(r.parcelaMaxima)} destaque />
        </div>
      </Secao>
      <Secao numero={3} titulo="Laudo · capacidade financeira">
        <div className="grid grid-cols-2 gap-3">
          <CampoMoeda label="Financiamento" obrigatorio value={f.laudo.financiamento} onChange={(v) => set("laudo", "financiamento", v)} className="col-span-2" />
          <CampoMoeda label="FGTS" value={f.laudo.fgts} onChange={(v) => set("laudo", "fgts", v)} />
          <CampoMoeda label="Subsídio" value={f.laudo.subsidio} onChange={(v) => set("laudo", "subsidio", v)} />
          <CampoMoeda label="Valor da prestação" value={f.laudo.valorPrestacao} onChange={(v) => set("laudo", "valorPrestacao", v)} />
          <CampoInteiro label="Prazo" obrigatorio sufixo="meses" value={f.laudo.prazoMeses} onChange={(v) => set("laudo", "prazoMeses", v)} />
          <Segmentado
            label="Modalidade"
            value={f.laudo.modalidade}
            onChange={(v) => set("laudo", "modalidade", v)}
            opcoes={[
              { valor: "MCMV", rotulo: "MCMV" },
              { valor: "SBPE", rotulo: "SBPE" },
            ]}
          />
          <Segmentado
            label="Amortização"
            value={f.laudo.amortizacao}
            onChange={(v) => set("laudo", "amortizacao", v)}
            opcoes={[
              { valor: "SAC", rotulo: "SAC" },
              { valor: "PRICE", rotulo: "Price" },
            ]}
          />
          <CampoPercentual
            label="Juros (ao ano)"
            casas={2}
            value={f.laudo.taxaJurosAnual}
            onChange={(v) => set("laudo", "taxaJurosAnual", v)}
            ajuda="Para a tabela de amortização"
          />
          <Segmentado
            label="Tipo de taxa"
            value={f.laudo.tipoTaxa}
            onChange={(v) => set("laudo", "tipoTaxa", v)}
            opcoes={[
              { valor: "nominal", rotulo: "Nominal" },
              { valor: "efetiva", rotulo: "Efetiva" },
            ]}
          />
          <Calculado label="Total da operação" valor={formatarBRL(r.totalOperacao)} destaque className="col-span-2" />
        </div>
      </Secao>
    </div>
  );
}

function SecaoImovel({ f, r, set, className }: PropsSecao & { r: FluxoResultado }) {
  return (
    <Secao numero={4} titulo="Financiamento" className={className}>
      <div className="grid grid-cols-2 gap-3">
        <CampoMoeda label="Valor do imóvel" obrigatorio value={f.imovel.valorImovel} onChange={(v) => set("imovel", "valorImovel", v)} className="col-span-2" />
        <Calculado label={f.imovel.abaterFgtsSubsidio ? "Financ. + FGTS + Subs." : "Financiamento (laudo)"} valor={formatarBRL(r.financiamento)} />
        <CampoMoeda label="Pró-soluto" value={f.imovel.proSoluto} onChange={(v) => set("imovel", "proSoluto", v)} />
        <Calculado label="Período de obra" valor={formatarBRL(r.periodoObra)} destaque className="col-span-2" />
        <Calculado label="% entrada" valor={formatarPercentual(r.percentualEntrada)} />
        <Calculado label="% financiado" valor={formatarPercentual(r.percentualFinanciado)} />
        <div className="col-span-2 pt-1">
          <Interruptor
            label="Abater FGTS e subsídio do período de obra"
            ajuda="Desligado = igual à planilha (só o financiamento abate)"
            checked={f.imovel.abaterFgtsSubsidio}
            onChange={(v) => set("imovel", "abaterFgtsSubsidio", v)}
          />
        </div>
      </div>
    </Secao>
  );
}

const LINHAS_QTD: Partial<Record<LinhaId, "qtdMensais" | "qtdAnuais" | "qtdProSoluto">> = {
  mensal: "qtdMensais",
  anual: "qtdAnuais",
  proSoluto: "qtdProSoluto",
};

function SecaoFluxo({ f, r, set, substituir, className }: PropsSecao & { r: FluxoResultado; substituir: (f: FluxoInput) => void }) {
  return (
    <div className={`space-y-4 ${className ?? ""}`}>
      <Secao numero={5} titulo="Programação de obra">
        <div className="grid grid-cols-3 gap-3">
          <CampoInteiro label="Anuais" value={f.programacao.qtdAnuais} onChange={(v) => set("programacao", "qtdAnuais", v)} />
          <CampoInteiro label="Mensais" value={f.programacao.qtdMensais} onChange={(v) => set("programacao", "qtdMensais", v)} />
          <CampoInteiro label="Pró-soluto" value={f.programacao.qtdProSoluto} onChange={(v) => set("programacao", "qtdProSoluto", v)} />
        </div>
      </Secao>

      <Secao numero={6} titulo="Proposta · fluxo">
        <ul className="divide-y divide-line/60">
          {r.linhas.map((l) => {
            const qtdCampo = LINHAS_QTD[l.id];
            return (
              <li key={l.id} className="grid grid-cols-[minmax(0,1fr)_minmax(0,9.5rem)] items-center gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="font-medium">{l.label}</p>
                  <p className="tabular truncate text-xs text-muted">
                    {qtdCampo ? `${l.quantidade}× = ` : "Total "}
                    <span className="font-semibold text-fg">{formatarBRL(l.total)}</span>
                  </p>
                </div>
                <CampoMoeda label={`Valor ${l.label}`} value={f.proposta[l.id]} onChange={(v) => set("proposta", l.id, v)} className="[&_label]:sr-only" />
              </li>
            );
          })}
        </ul>

        <div className="mt-3 grid grid-cols-2 gap-3 border-t border-line pt-3 text-sm">
          <div>
            <p className="text-xs text-muted">Total do fluxo</p>
            <p className="tabular font-semibold">{formatarBRL(r.totalFluxo)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted">Obra + pró-soluto</p>
            <p className="tabular font-semibold">{formatarBRL(r.totalAPagar)}</p>
          </div>
        </div>

        <div
          className={`mt-3 rounded-xl border p-3 ${r.fechado ? "border-ok/40 bg-ok/10" : "border-danger/40 bg-danger/10"}`}
          aria-live="polite"
        >
          <div className="flex items-center justify-between gap-2">
            <span className={`text-sm font-semibold ${r.fechado ? "text-ok" : "text-danger"}`}>
              {r.fechado ? "Fluxo fechado" : r.saldo < 0 ? "Falta para fechar" : "Sobra no fluxo"}
            </span>
            <span className={`tabular text-lg font-bold ${r.fechado ? "text-ok" : "text-danger"}`}>{formatarBRL(r.saldo)}</span>
          </div>
        </div>

        <div className="mt-3 grid gap-2">
          <Sugestao
            titulo="Mensal sugerida"
            valor={r.sugestaoMensal}
            desabilitado={r.fechado || r.sugestaoMensal === null || r.sugestaoMensal < 0}
            ajuda={r.sugestaoMensal !== null && r.sugestaoMensal < 0 ? "Sobra maior que as mensais" : r.sugestaoMensal === null ? "Informe a quantidade de mensais" : undefined}
            onAplicar={() => substituir(aplicarSugestaoMensal(f))}
          />
          <Sugestao
            titulo="Parcela de pró-soluto"
            valor={r.sugestaoProSoluto}
            desabilitado={r.sugestaoProSoluto === null || Math.abs(n(f.proposta.proSoluto) - r.sugestaoProSoluto) < 0.005}
            ajuda={r.sugestaoProSoluto === null ? "Informe a quantidade de parcelas" : undefined}
            onAplicar={() => substituir(aplicarSugestaoProSoluto(f))}
          />
        </div>
      </Secao>
    </div>
  );
}

function Sugestao({
  titulo,
  valor,
  desabilitado,
  ajuda,
  onAplicar,
}: {
  titulo: string;
  valor: number | null;
  desabilitado: boolean;
  ajuda?: string;
  onAplicar: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 p-3">
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted">{titulo}</p>
        <p className="tabular truncate font-semibold">{valor === null ? "—" : formatarBRL(valor)}</p>
        {ajuda && <p className="text-[11px] text-muted">{ajuda}</p>}
      </div>
      <button type="button" className="btn-primary px-3 py-2 text-xs" disabled={desabilitado} onClick={onAplicar}>
        Aplicar sugestão
      </button>
    </div>
  );
}

function PainelResumo({ f, r, set }: { f: FluxoInput; r: FluxoResultado; set: Atualizar }) {
  const [verTabela, setVerTabela] = useState(false);
  return (
    <>
      <Secao titulo="Resumo">
        <Alertas alertas={r.alertas} />
        <dl className="tabular mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <Kpi rotulo="Parcela máxima" valor={formatarBRL(r.parcelaMaxima)} />
          <Kpi rotulo="Total operação" valor={formatarBRL(r.totalOperacao)} />
          <Kpi rotulo="Período de obra" valor={formatarBRL(r.periodoObra)} />
          <Kpi rotulo="Entrada" valor={`${formatarBRL(r.entrada)} · ${formatarPercentual(r.percentualEntrada)}`} />
          <Kpi rotulo="% financiado" valor={formatarPercentual(r.percentualFinanciado)} />
          <Kpi rotulo="Total do fluxo" valor={formatarBRL(r.totalFluxo)} />
          <Kpi
            rotulo="Prestação / renda"
            valor={formatarPercentual(r.comprometimentoPrestacao)}
            alerta={r.prestacaoConsiderada !== null && r.prestacaoConsiderada > r.parcelaMaxima}
          />
          <Kpi rotulo="Mensal / renda" valor={formatarPercentual(r.comprometimentoMensal)} alerta={n(f.proposta.mensal) > r.parcelaMaxima && n(f.renda.rendaApurada) > 0} />
        </dl>
      </Secao>

      <Secao
        titulo={`Amortização ${f.laudo.amortizacao === "PRICE" ? "Price" : "SAC"}`}
        acao={
          r.amortizacao && (
            <button type="button" className="text-xs font-semibold text-brand-soft" onClick={() => setVerTabela(!verTabela)}>
              {verTabela ? "Ocultar tabela" : "Ver tabela"}
            </button>
          )
        }
      >
        {r.amortizacao ? (
          <>
            <dl className="tabular grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <Kpi rotulo="1ª prestação" valor={formatarBRL(r.amortizacao.primeiraPrestacao)} />
              <Kpi rotulo="Última prestação" valor={formatarBRL(r.amortizacao.ultimaPrestacao)} />
              <Kpi rotulo="Total de juros" valor={formatarBRL(r.amortizacao.totalJuros)} />
              <Kpi rotulo="Taxa mensal" valor={`${(r.amortizacao.taxaMensal * 100).toLocaleString("pt-BR", { maximumFractionDigits: 4 })}%`} />
            </dl>
            {verTabela && (
              <div className="mt-3">
                <TabelaAmortizacao tabela={r.amortizacao} />
              </div>
            )}
            <p className="mt-2 text-[11px] text-muted">Estimativa sem seguros (MIP/DFI) e taxa de administração.</p>
          </>
        ) : (
          <p className="text-sm text-muted">Informe financiamento, prazo e juros ao ano (etapa Renda/Laudo).</p>
        )}
      </Secao>

      <Secao titulo="Correção INCC (estimada)">
        <div className="grid grid-cols-2 gap-3">
          <CampoPercentual label="INCC ao mês" casas={2} value={f.incc.taxaMensal} onChange={(v) => set("incc", "taxaMensal", v ?? 0)} />
          <CampoInteiro
            label="Meses de obra"
            sufixo="meses"
            placeholder={String(r.incc.mesesObra)}
            value={f.incc.mesesObra}
            onChange={(v) => set("incc", "mesesObra", v)}
          />
        </div>
        <dl className="tabular mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <Kpi rotulo="Fluxo sem correção" valor={formatarBRL(r.incc.totalNominal)} />
          <Kpi rotulo="Fluxo corrigido" valor={formatarBRL(r.incc.totalCorrigido)} />
          <Kpi rotulo="Acréscimo estimado" valor={formatarBRL(r.incc.acrescimo)} alerta={r.incc.acrescimo > 0} />
        </dl>
        <p className="mt-2 text-[11px] text-muted">
          Cada parcela é corrigida pelo INCC até o mês do vencimento (limitado ao fim da obra). Sem meses de obra, usa a quantidade de mensais.
        </p>
      </Secao>
    </>
  );
}

function Kpi({ rotulo, valor, alerta }: { rotulo: string; valor: string; alerta?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted">{rotulo}</dt>
      <dd className={`truncate font-semibold ${alerta ? "text-danger" : ""}`}>{valor}</dd>
    </div>
  );
}
