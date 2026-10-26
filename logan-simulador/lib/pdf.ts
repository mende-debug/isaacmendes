import { jsPDF } from "jspdf";
import autoTable, { type RowInput } from "jspdf-autotable";
import {
  calcularFluxo,
  formatarBRL,
  formatarNumero,
  formatarPercentual,
  n,
  RODAPE_PROPOSTA,
  type FluxoInput,
} from "./fluxo";

const PRETO: [number, number, number] = [9, 9, 12];
const ROXO: [number, number, number] = [124, 58, 237];
const ROXO_CLARO: [number, number, number] = [243, 238, 255];
const CINZA: [number, number, number] = [110, 110, 122];

type DocComTabela = jsPDF & { lastAutoTable?: { finalY: number } };

export function nomeArquivoProposta(f: FluxoInput) {
  const base = [f.cliente.nome || "cliente", f.cliente.unidade]
    .filter(Boolean)
    .join("-")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  return `proposta-logan-${base || "simulacao"}.pdf`;
}

/** Gera a proposta em PDF (A4) com a marca Logan. */
export function gerarPropostaPdf(f: FluxoInput, opcoes: { consultor?: string; data?: Date } = {}): jsPDF {
  const r = calcularFluxo(f);
  const doc: DocComTabela = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 14;
  const data = (opcoes.data ?? new Date()).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });

  // Cabeçalho
  doc.setFillColor(...PRETO);
  doc.rect(0, 0, W, 30, "F");
  doc.setFillColor(...ROXO);
  doc.roundedRect(M, 8, 14, 14, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("L", M + 7, 17.4, { align: "center" });
  doc.setFontSize(18);
  doc.text("Logan", M + 18, 14.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(196, 181, 253);
  doc.text("Proposta de fluxo de pagamento", M + 18, 20);
  doc.setTextColor(200, 200, 210);
  doc.text(data, W - M, 14.5, { align: "right" });
  if (opcoes.consultor) doc.text(`Consultor: ${opcoes.consultor}`, W - M, 20, { align: "right" });

  let y = 38;
  const tituloSecao = (t: string) => {
    if (y > H - 50) {
      doc.addPage();
      y = 18;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...ROXO);
    doc.text(t.toUpperCase(), M, y);
    y += 2;
  };
  const tabelaChaveValor = (linhas: [string, string][]) => {
    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M, bottom: 28 },
      body: linhas,
      theme: "plain",
      styles: { fontSize: 9, cellPadding: { top: 1.1, bottom: 1.1, left: 2, right: 2 }, textColor: [30, 30, 36] },
      columnStyles: { 0: { textColor: CINZA, cellWidth: 60 }, 1: { fontStyle: "bold", halign: "right" } },
      alternateRowStyles: { fillColor: [248, 248, 250] },
    });
    y = (doc.lastAutoTable?.finalY ?? y) + 7;
  };

  const c = f.cliente;
  tituloSecao("Cliente");
  tabelaChaveValor(
    [
      ["Cliente", c.nome || "—"],
      ["Empreendimento", c.empreendimento || "—"],
      ["Unidade", c.unidade || "—"],
      ...(c.telefone ? ([["Contato", c.telefone]] as [string, string][]) : []),
    ],
  );

  tituloSecao("Composição da compra");
  const comp: [string, string][] = [
    ["Valor do imóvel", formatarBRL(n(f.imovel.valorImovel))],
    [
      `Financiamento ${f.laudo.modalidade} · ${f.laudo.amortizacao === "PRICE" ? "Price" : "SAC"}`,
      `${formatarBRL(n(f.laudo.financiamento))} (${formatarPercentual(n(f.imovel.valorImovel) ? n(f.laudo.financiamento) / n(f.imovel.valorImovel) : null)})`,
    ],
  ];
  if (n(f.laudo.fgts)) comp.push(["FGTS", formatarBRL(n(f.laudo.fgts))]);
  if (n(f.laudo.subsidio)) comp.push(["Subsídio", formatarBRL(n(f.laudo.subsidio))]);
  comp.push(["Total da operação", formatarBRL(r.totalOperacao)]);
  if (n(f.imovel.proSoluto)) comp.push(["Pró-soluto", formatarBRL(n(f.imovel.proSoluto))]);
  comp.push(["Período de obra (direto à construtora)", formatarBRL(r.periodoObra)]);
  tabelaChaveValor(comp);

  tituloSecao("Fluxo de pagamento");
  const corpo: RowInput[] = r.linhas
    .filter((l) => l.total !== 0)
    .map((l) => [l.label, String(l.quantidade), formatarBRL(l.valor), formatarBRL(l.total)]);
  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M, bottom: 28 },
    head: [["Parcela", "Qtd.", "Valor unitário", "Total"]],
    body: corpo.length ? corpo : [["Nenhuma parcela informada", "", "", ""]],
    foot: [["Total do fluxo", "", "", formatarBRL(r.totalFluxo)]],
    theme: "striped",
    styles: { fontSize: 9, cellPadding: 1.5, textColor: [30, 30, 36] },
    headStyles: { fillColor: PRETO, textColor: [255, 255, 255] },
    footStyles: { fillColor: ROXO_CLARO, textColor: ROXO, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 248, 250] },
    columnStyles: { 1: { halign: "center", cellWidth: 18 }, 2: { halign: "right" }, 3: { halign: "right", fontStyle: "bold" } },
    didParseCell: (d) => {
      if (d.section !== "body" && d.column.index >= 2) d.cell.styles.halign = "right";
      if (d.section === "head" && d.column.index === 1) d.cell.styles.halign = "center";
    },
  });
  y = (doc.lastAutoTable?.finalY ?? y) + 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...CINZA);
  doc.text(`Entrada (ato + 30/60/90): ${formatarBRL(r.entrada)} · ${formatarPercentual(r.percentualEntrada)} do imóvel`, M, y + 2);
  if (!r.fechado) {
    doc.setTextColor(220, 38, 38);
    doc.setFont("helvetica", "bold");
    doc.text(r.saldo < 0 ? `Falta para fechar: ${formatarBRL(-r.saldo)}` : `Sobra no fluxo: ${formatarBRL(r.saldo)}`, W - M, y + 2, { align: "right" });
  }
  y += 10;

  tituloSecao("Financiamento e renda");
  const fin: [string, string][] = [];
  if (r.prestacaoConsiderada) fin.push(["Prestação estimada", formatarBRL(r.prestacaoConsiderada)]);
  if (n(f.laudo.prazoMeses)) fin.push(["Prazo", `${n(f.laudo.prazoMeses)} meses`]);
  if (f.laudo.taxaJurosAnual !== null) fin.push(["Juros", `${formatarNumero(f.laudo.taxaJurosAnual * 100, 2)}% a.a. (${f.laudo.tipoTaxa})`]);
  if (r.amortizacao) fin.push(["Última prestação (estimada)", formatarBRL(r.amortizacao.ultimaPrestacao)]);
  if (n(f.renda.rendaApurada)) {
    fin.push(["Renda apurada", formatarBRL(n(f.renda.rendaApurada))]);
    fin.push([`Parcela máxima (${formatarPercentual(f.renda.percentualComprometimento)} da renda)`, formatarBRL(r.parcelaMaxima)]);
  }
  if (r.incc.acrescimo > 0) {
    fin.push([`Correção INCC estimada (${formatarNumero(r.incc.taxaMensal * 100, 2)}% a.m. por ${r.incc.mesesObra} meses)`, `+ ${formatarBRL(r.incc.acrescimo)}`]);
  }
  if (fin.length) tabelaChaveValor(fin);

  // Rodapé em todas as páginas
  const paginas = doc.getNumberOfPages();
  for (let p = 1; p <= paginas; p++) {
    doc.setPage(p);
    doc.setDrawColor(...ROXO);
    doc.setLineWidth(0.4);
    doc.line(M, H - 24, W - M, H - 24);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(...CINZA);
    doc.text(doc.splitTextToSize(RODAPE_PROPOSTA, W - 2 * M), M, H - 19);
    doc.setFont("helvetica", "normal");
    doc.text(`Logan Simulador · página ${p} de ${paginas}`, W - M, H - 8, { align: "right" });
  }
  return doc;
}
