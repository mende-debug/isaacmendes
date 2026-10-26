"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import {
  calcularFluxo,
  formatarBRL,
  formatarPercentual,
  gerarResumoTexto,
  linkWhatsApp,
  n,
  RODAPE_PROPOSTA,
  type FluxoInput,
} from "@/lib/fluxo";
import { Alertas } from "./Alertas";
import { Logo } from "./Logo";
import { IconeColunas, IconeDoc, IconeVoltar, IconeWhats } from "./Icones";

export function Proposta({ id, f, consultor }: { id: string; f: FluxoInput; consultor: string }) {
  const r = useMemo(() => calcularFluxo(f), [f]);
  const texto = useMemo(() => gerarResumoTexto(f, r), [f, r]);
  const [gerando, setGerando] = useState(false);
  const [verTexto, setVerTexto] = useState(false);

  async function pdf(compartilhar: boolean) {
    setGerando(true);
    try {
      const { gerarPropostaPdf, nomeArquivoProposta } = await import("@/lib/pdf");
      const doc = gerarPropostaPdf(f, { consultor });
      const nome = nomeArquivoProposta(f);
      if (compartilhar) {
        const arquivo = new File([doc.output("blob")], nome, { type: "application/pdf" });
        if (navigator.canShare?.({ files: [arquivo] })) {
          await navigator.share({ files: [arquivo], title: "Proposta Logan" });
          return;
        }
      }
      doc.save(nome);
    } catch (e) {
      if ((e as Error)?.name !== "AbortError") alert("Não foi possível gerar o PDF.");
    } finally {
      setGerando(false);
    }
  }

  const podeCompartilhar = useSyncExternalStore(
    () => () => {},
    () => "share" in navigator,
    () => false,
  );
  const c = f.cliente;

  return (
    <div className="mx-auto max-w-3xl px-4 py-4 pb-16">
      <div className="mb-4 flex items-center gap-2">
        <Link href={`/simulacoes/${id}`} className="grid size-9 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-fg" aria-label="Voltar">
          <IconeVoltar />
        </Link>
        <h1 className="flex-1 text-lg font-bold">Proposta</h1>
        <Link href={`/simulacoes/${id}/comparar`} className="btn-ghost px-3" title="Comparar cenários">
          <IconeColunas className="size-4" />
          <span className="hidden sm:inline">Comparar</span>
        </Link>
      </div>

      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        <button className="btn-primary py-3" onClick={() => pdf(false)} disabled={gerando}>
          <IconeDoc className="size-4" /> {gerando ? "Gerando…" : "Gerar proposta em PDF"}
        </button>
        {podeCompartilhar && (
          <button className="btn-ghost py-3" onClick={() => pdf(true)} disabled={gerando}>
            Compartilhar PDF
          </button>
        )}
        <a
          className="btn py-3 bg-[#25D366] text-black hover:brightness-110"
          href={linkWhatsApp(texto, c.telefone)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <IconeWhats className="size-4" /> Enviar no WhatsApp
        </a>
      </div>

      {!r.fechado && <Alertas alertas={r.alertas.filter((a) => a.nivel !== "sucesso")} className="mb-4" />}

      <article className="card overflow-hidden">
        <header className="flex items-center justify-between gap-3 bg-black px-5 py-4">
          <div className="whitespace-nowrap">
            <Logo />
            <p className="mt-1 text-xs text-brand-soft">Proposta de fluxo de pagamento</p>
          </div>
          <div className="text-right text-xs text-muted">
            <p>{new Date().toLocaleDateString("pt-BR")}</p>
            <p>Consultor: {consultor}</p>
          </div>
        </header>

        <div className="space-y-6 p-5">
          <Bloco titulo="Cliente">
            <Linha k="Cliente" v={c.nome || "—"} />
            <Linha k="Empreendimento" v={c.empreendimento || "—"} />
            <Linha k="Unidade" v={c.unidade || "—"} />
            {c.telefone && <Linha k="Contato" v={c.telefone} />}
          </Bloco>

          <Bloco titulo="Composição da compra">
            <Linha k="Valor do imóvel" v={formatarBRL(n(f.imovel.valorImovel))} />
            <Linha
              k={`Financiamento ${f.laudo.modalidade} · ${f.laudo.amortizacao === "PRICE" ? "Price" : "SAC"}`}
              v={`${formatarBRL(n(f.laudo.financiamento))} (${formatarPercentual(n(f.imovel.valorImovel) ? n(f.laudo.financiamento) / n(f.imovel.valorImovel) : null)})`}
            />
            {n(f.laudo.fgts) > 0 && <Linha k="FGTS" v={formatarBRL(n(f.laudo.fgts))} />}
            {n(f.laudo.subsidio) > 0 && <Linha k="Subsídio" v={formatarBRL(n(f.laudo.subsidio))} />}
            <Linha k="Total da operação" v={formatarBRL(r.totalOperacao)} />
            {n(f.imovel.proSoluto) > 0 && <Linha k="Pró-soluto" v={formatarBRL(n(f.imovel.proSoluto))} />}
            <Linha k="Período de obra" v={formatarBRL(r.periodoObra)} destaque />
          </Bloco>

          <Bloco titulo="Fluxo de pagamento">
            <div className="overflow-hidden rounded-xl border border-line">
              <table className="tabular w-full text-xs whitespace-nowrap sm:text-sm">
                <thead className="bg-surface-2 text-xs text-muted">
                  <tr>
                    <th className="px-2 py-2 sm:px-3 text-left font-medium">Parcela</th>
                    <th className="px-2 py-2 sm:px-3 text-center font-medium">Qtd.</th>
                    <th className="px-2 py-2 sm:px-3 text-right font-medium">Valor</th>
                    <th className="px-2 py-2 sm:px-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {r.linhas
                    .filter((l) => l.total !== 0)
                    .map((l) => (
                      <tr key={l.id}>
                        <td className="px-2 py-2 sm:px-3">{l.label}</td>
                        <td className="px-2 py-2 sm:px-3 text-center text-muted">{l.quantidade}</td>
                        <td className="px-2 py-2 sm:px-3 text-right">{formatarBRL(l.valor)}</td>
                        <td className="px-2 py-2 sm:px-3 text-right font-semibold">{formatarBRL(l.total)}</td>
                      </tr>
                    ))}
                </tbody>
                <tfoot>
                  <tr className="bg-brand/10 font-bold text-brand-soft">
                    <td className="px-2 py-2 sm:px-3" colSpan={3}>
                      Total do fluxo
                    </td>
                    <td className="px-2 py-2 sm:px-3 text-right">{formatarBRL(r.totalFluxo)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <p className="mt-2 text-xs text-muted">
              Entrada (ato + 30/60/90): {formatarBRL(r.entrada)} · {formatarPercentual(r.percentualEntrada)} do imóvel
            </p>
          </Bloco>

          <Bloco titulo="Financiamento e renda">
            {r.prestacaoConsiderada !== null && <Linha k="Prestação estimada" v={formatarBRL(r.prestacaoConsiderada)} />}
            {n(f.laudo.prazoMeses) > 0 && <Linha k="Prazo" v={`${n(f.laudo.prazoMeses)} meses`} />}
            {n(f.renda.rendaApurada) > 0 && <Linha k="Renda apurada" v={formatarBRL(n(f.renda.rendaApurada))} />}
            <Linha k={`Parcela máxima (${formatarPercentual(f.renda.percentualComprometimento)})`} v={formatarBRL(r.parcelaMaxima)} />
            {r.incc.acrescimo > 0 && <Linha k="Correção INCC estimada" v={`+ ${formatarBRL(r.incc.acrescimo)}`} />}
          </Bloco>

          <p className="border-t border-brand/40 pt-3 text-[11px] text-muted italic">{RODAPE_PROPOSTA}</p>
        </div>
      </article>

      <div className="mt-4">
        <button className="text-sm font-semibold text-brand-soft" onClick={() => setVerTexto(!verTexto)}>
          {verTexto ? "Ocultar texto do WhatsApp" : "Ver texto do WhatsApp"}
        </button>
        {verTexto && <pre className="card mt-2 p-4 text-xs whitespace-pre-wrap text-muted">{texto}</pre>}
      </div>
    </div>
  );
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-xs font-bold tracking-wider text-brand-soft uppercase">{titulo}</h2>
      <dl className="tabular divide-y divide-line/50 text-sm">{children}</dl>
    </section>
  );
}

function Linha({ k, v, destaque }: { k: string; v: string; destaque?: boolean }) {
  return (
    <div className="flex justify-between gap-4 py-1.5">
      <dt className="text-muted">{k}</dt>
      <dd className={`text-right font-semibold ${destaque ? "text-brand-soft" : ""}`}>{v}</dd>
    </div>
  );
}
