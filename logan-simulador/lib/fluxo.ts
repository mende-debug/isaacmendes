/**
 * Logan Simulador — motor de cálculo do fluxo de pagamento.
 *
 * Replica a planilha "Fluxo de Pagamento - Modelo.xlsx" (referências de
 * célula nos comentários) e corrige os problemas dela:
 *  - o Financiamento da seção 4 (G10) vem do laudo (J5), sem digitação dupla;
 *  - o saldo (D17) não soma mais a célula solta C17;
 *  - divisões por zero devolvem `null` em vez de #DIV/0!;
 *  - a parcela máxima (G6) usa um percentual configurável (padrão 30%);
 *  - a sugestão de mensal (I17) considera a mensal já digitada.
 *
 * Arquivo sem dependências (nem React, nem Next), pensado para ser copiado ou
 * importado em outros sistemas (ex.: CRM Logan).
 */

export type Modalidade = "MCMV" | "SBPE";
export type Amortizacao = "SAC" | "PRICE";
export type TipoTaxa = "nominal" | "efetiva";

/** Campo numérico de formulário: `null` = vazio (ainda não preenchido). */
export type Num = number | null;

export interface FluxoInput {
  cliente: {
    nome: string;
    telefone: string;
    empreendimento: string;
    unidade: string;
  };
  renda: {
    /** G5 */
    rendaApurada: Num;
    /** Percentual da renda para a parcela máxima (0,30 = 30%). Na planilha é fixo em G6. */
    percentualComprometimento: number;
  };
  laudo: {
    /** J5 */
    financiamento: Num;
    /** J6 */
    fgts: Num;
    /** J7 */
    subsidio: Num;
    /** J8 */
    valorPrestacao: Num;
    /** J9 */
    prazoMeses: Num;
    /** J10 */
    modalidade: Modalidade;
    /** J11 */
    amortizacao: Amortizacao;
    /** Taxa de juros anual (0,0816 = 8,16% a.a.). Extra, não existe na planilha. */
    taxaJurosAnual: Num;
    /** Como interpretar a taxa anual. Caixa costuma divulgar a nominal (mensal = anual / 12). */
    tipoTaxa: TipoTaxa;
  };
  imovel: {
    /** G9 */
    valorImovel: Num;
    /** G12 */
    proSoluto: Num;
    /**
     * Se true, FGTS e Subsídio também abatem o período de obra
     * (Financiamento usado = Total da operação). Padrão false = igual à planilha.
     */
    abaterFgtsSubsidio: boolean;
  };
  programacao: {
    /** G15 */
    qtdAnuais: Num;
    /** G16 */
    qtdMensais: Num;
    /** G17 */
    qtdProSoluto: Num;
  };
  /** Valores unitários da proposta (coluna C, linhas 9 a 16). */
  proposta: {
    ato: Num;
    d30: Num;
    d60: Num;
    d90: Num;
    mensal: Num;
    anual: Num;
    unica: Num;
    proSoluto: Num;
  };
  incc: {
    /** Taxa mensal estimada do INCC (0,005 = 0,5% a.m.). */
    taxaMensal: number;
    /** Duração da obra em meses. `null` = usa a quantidade de mensais. */
    mesesObra: Num;
  };
}

export type LinhaId = keyof FluxoInput["proposta"];

export interface LinhaFluxo {
  id: LinhaId;
  label: string;
  valor: number;
  quantidade: number;
  total: number;
}

export type NivelAlerta = "sucesso" | "erro" | "aviso";

export interface Alerta {
  nivel: NivelAlerta;
  codigo: string;
  mensagem: string;
}

export interface LinhaAmortizacao {
  mes: number;
  prestacao: number;
  juros: number;
  amortizacao: number;
  saldo: number;
}

export interface TabelaAmortizacao {
  sistema: Amortizacao;
  taxaMensal: number;
  linhas: LinhaAmortizacao[];
  primeiraPrestacao: number;
  ultimaPrestacao: number;
  totalPago: number;
  totalJuros: number;
}

export interface ParcelaIncc {
  linha: LinhaId;
  mes: number;
  valor: number;
  valorCorrigido: number;
}

export interface ResultadoIncc {
  taxaMensal: number;
  mesesObra: number;
  totalNominal: number;
  totalCorrigido: number;
  acrescimo: number;
  porLinha: Record<LinhaId, { nominal: number; corrigido: number }>;
}

export interface FluxoResultado {
  /** G6 */
  parcelaMaxima: number;
  /** J12 */
  totalOperacao: number;
  /** G10 (financiamento efetivamente usado no fluxo) */
  financiamento: number;
  /** G11 */
  periodoObra: number;
  /** F13 — null quando o valor do imóvel é zero */
  percentualEntrada: number | null;
  /** G13 — null quando o valor do imóvel é zero */
  percentualFinanciado: number | null;
  /** Ato + 30 + 60 + 90 */
  entrada: number;
  /** Coluna D, linhas 9 a 16 */
  linhas: LinhaFluxo[];
  /** Soma da coluna D */
  totalFluxo: number;
  /** Período de obra + Pró-soluto (o que o fluxo precisa cobrir) */
  totalAPagar: number;
  /** D17 — negativo = falta, positivo = sobra */
  saldo: number;
  fechado: boolean;
  /** I17 da planilha: quanto somar à mensal atual (null sem mensais) */
  ajusteMensal: number | null;
  /** Valor da mensal que zera o saldo (mensal atual + ajuste) */
  sugestaoMensal: number | null;
  /** J17 */
  sugestaoProSoluto: number | null;
  /** % da renda comprometida pela prestação do financiamento */
  comprometimentoPrestacao: number | null;
  /** % da renda comprometida pela mensal da obra */
  comprometimentoMensal: number | null;
  /** Prestação considerada nos alertas: a do laudo ou, se vazia, a 1ª da tabela */
  prestacaoConsiderada: number | null;
  amortizacao: TabelaAmortizacao | null;
  incc: ResultadoIncc;
  alertas: Alerta[];
}

export const PERCENTUAL_COMPROMETIMENTO_PADRAO = 0.3;
export const INCC_MENSAL_PADRAO = 0.005;
/** Tolerância para considerar o saldo zerado (meio centavo). */
export const TOLERANCIA_SALDO = 0.005;

export const LABELS_LINHAS: Record<LinhaId, string> = {
  ato: "Ato",
  d30: "30 dias",
  d60: "60 dias",
  d90: "90 dias",
  mensal: "Mensais",
  anual: "Anuais",
  unica: "Única",
  proSoluto: "Pró-soluto",
};

export const ORDEM_LINHAS: LinhaId[] = ["ato", "d30", "d60", "d90", "mensal", "anual", "unica", "proSoluto"];

export function criarFluxoVazio(): FluxoInput {
  return {
    cliente: { nome: "", telefone: "", empreendimento: "", unidade: "" },
    renda: { rendaApurada: null, percentualComprometimento: PERCENTUAL_COMPROMETIMENTO_PADRAO },
    laudo: {
      financiamento: null,
      fgts: null,
      subsidio: null,
      valorPrestacao: null,
      prazoMeses: null,
      modalidade: "MCMV",
      amortizacao: "SAC",
      taxaJurosAnual: null,
      tipoTaxa: "nominal",
    },
    imovel: { valorImovel: null, proSoluto: null, abaterFgtsSubsidio: false },
    programacao: { qtdAnuais: null, qtdMensais: null, qtdProSoluto: null },
    proposta: { ato: null, d30: null, d60: null, d90: null, mensal: null, anual: null, unica: null, proSoluto: null },
    incc: { taxaMensal: INCC_MENSAL_PADRAO, mesesObra: null },
  };
}

/**
 * Preenche campos ausentes e corrige tipos (útil ao ler JSON salvo de versões
 * antigas ou recebido de outro sistema).
 */
export function normalizarFluxo(parcial: unknown): FluxoInput {
  const base = criarFluxoVazio();
  const p = (parcial && typeof parcial === "object" ? parcial : {}) as Record<string, Record<string, unknown> | undefined>;
  const secao = <K extends keyof FluxoInput>(k: K): FluxoInput[K] => {
    const padrao = base[k] as Record<string, unknown>;
    const vindo = p[k] && typeof p[k] === "object" ? p[k]! : {};
    const out: Record<string, unknown> = {};
    for (const [campo, valorPadrao] of Object.entries(padrao)) {
      const v = vindo[campo];
      if (typeof valorPadrao === "string") out[campo] = typeof v === "string" ? v.slice(0, 200) : valorPadrao;
      else if (typeof valorPadrao === "boolean") out[campo] = typeof v === "boolean" ? v : valorPadrao;
      else if (typeof valorPadrao === "number") out[campo] = typeof v === "number" && Number.isFinite(v) ? v : valorPadrao;
      else out[campo] = typeof v === "number" && Number.isFinite(v) ? v : null; // campos Num (padrão null)
    }
    return out as FluxoInput[K];
  };
  const f: FluxoInput = {
    cliente: secao("cliente"),
    renda: secao("renda"),
    laudo: secao("laudo"),
    imovel: secao("imovel"),
    programacao: secao("programacao"),
    proposta: secao("proposta"),
    incc: secao("incc"),
  };
  if (f.laudo.modalidade !== "MCMV" && f.laudo.modalidade !== "SBPE") f.laudo.modalidade = "MCMV";
  if (f.laudo.amortizacao !== "SAC" && f.laudo.amortizacao !== "PRICE") f.laudo.amortizacao = "SAC";
  if (f.laudo.tipoTaxa !== "nominal" && f.laudo.tipoTaxa !== "efetiva") f.laudo.tipoTaxa = "nominal";
  return f;
}

export type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

// ---------------------------------------------------------------------------
// Utilidades numéricas
// ---------------------------------------------------------------------------

/** Converte campo vazio/inválido em 0. */
export function n(v: Num | undefined): number {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

/** Arredonda para centavos (evita 0,1 + 0,2 = 0,30000000000000004). */
export function round2(v: number): number {
  return Math.round((v + Number.EPSILON) * 100) / 100;
}

function dividir(a: number, b: number): number | null {
  return b === 0 ? null : a / b;
}

function quantidadeInteira(v: Num): number {
  return Math.max(0, Math.floor(n(v)));
}

// ---------------------------------------------------------------------------
// Seções da planilha
// ---------------------------------------------------------------------------

/** G6 = G5 × 30% (percentual configurável) */
export function calcularParcelaMaxima(renda: Num, percentual = PERCENTUAL_COMPROMETIMENTO_PADRAO): number {
  return round2(n(renda) * percentual);
}

/** J12 = J5 + J6 + J7 */
export function calcularTotalOperacao(laudo: Pick<FluxoInput["laudo"], "financiamento" | "fgts" | "subsidio">): number {
  return round2(n(laudo.financiamento) + n(laudo.fgts) + n(laudo.subsidio));
}

/** G10 — vem do laudo (J5), ou do total da operação se o abatimento estiver ligado */
export function financiamentoEfetivo(input: FluxoInput): number {
  return input.imovel.abaterFgtsSubsidio ? calcularTotalOperacao(input.laudo) : round2(n(input.laudo.financiamento));
}

/** Coluna D, linhas 9 a 16 */
export function calcularLinhas(input: FluxoInput): LinhaFluxo[] {
  const { proposta: p, programacao: q } = input;
  const qtd: Record<LinhaId, number> = {
    ato: 1,
    d30: 1,
    d60: 1,
    d90: 1,
    mensal: quantidadeInteira(q.qtdMensais), // D13 = C13 × G16
    anual: quantidadeInteira(q.qtdAnuais), // D14 = C14 × G15
    unica: 1,
    proSoluto: quantidadeInteira(q.qtdProSoluto), // D16 = C16 × G17
  };
  return ORDEM_LINHAS.map((id) => {
    const valor = n(p[id]);
    return { id, label: LABELS_LINHAS[id], valor, quantidade: qtd[id], total: round2(valor * qtd[id]) };
  });
}

// ---------------------------------------------------------------------------
// Tabela de amortização
// ---------------------------------------------------------------------------

/** Converte a taxa anual em mensal. Nominal: a/12. Efetiva: (1+a)^(1/12) − 1. */
export function taxaMensalDeAnual(taxaAnual: number, tipo: TipoTaxa = "nominal"): number {
  if (taxaAnual <= 0) return 0;
  return tipo === "nominal" ? taxaAnual / 12 : Math.pow(1 + taxaAnual, 1 / 12) - 1;
}

/**
 * Gera a tabela SAC ou Price. Não inclui seguros (MIP/DFI) nem taxa de
 * administração — é uma estimativa de juros + amortização.
 */
export function gerarTabelaAmortizacao(
  valorFinanciado: number,
  prazoMeses: number,
  taxaJurosAnual: number,
  sistema: Amortizacao,
  tipoTaxa: TipoTaxa = "nominal",
): TabelaAmortizacao | null {
  const prazo = Math.floor(prazoMeses);
  if (!(valorFinanciado > 0) || !(prazo > 0) || taxaJurosAnual < 0) return null;

  const i = taxaMensalDeAnual(taxaJurosAnual, tipoTaxa);
  const linhas: LinhaAmortizacao[] = [];
  let saldo = valorFinanciado;

  const pmtPrice = i === 0 ? valorFinanciado / prazo : (valorFinanciado * i) / (1 - Math.pow(1 + i, -prazo));
  const amortSac = valorFinanciado / prazo;

  for (let mes = 1; mes <= prazo; mes++) {
    const juros = saldo * i;
    let amortizacao = sistema === "SAC" ? amortSac : pmtPrice - juros;
    if (mes === prazo) amortizacao = saldo; // zera resíduos de arredondamento
    const prestacao = amortizacao + juros;
    saldo = Math.max(0, saldo - amortizacao);
    linhas.push({
      mes,
      prestacao: round2(prestacao),
      juros: round2(juros),
      amortizacao: round2(amortizacao),
      saldo: round2(saldo),
    });
  }

  const totalPago = round2(linhas.reduce((s, l) => s + l.prestacao, 0));
  return {
    sistema,
    taxaMensal: i,
    linhas,
    primeiraPrestacao: linhas[0].prestacao,
    ultimaPrestacao: linhas[linhas.length - 1].prestacao,
    totalPago,
    totalJuros: round2(totalPago - valorFinanciado),
  };
}

// ---------------------------------------------------------------------------
// INCC
// ---------------------------------------------------------------------------

/**
 * Cronograma estimado de vencimentos (mês contado a partir do Ato = 0):
 * Ato no mês 0; 30/60/90 dias nos meses 1/2/3; mensais e pró-soluto mensais
 * a partir do mês 1; anuais nos meses 12, 24, ...; única no fim da obra.
 */
export function cronogramaParcelas(input: FluxoInput): ParcelaIncc[] {
  const linhas = calcularLinhas(input);
  const mesesObra = mesesDeObra(input);
  const parcelas: ParcelaIncc[] = [];
  const add = (linha: LinhaId, mes: number, valor: number) => {
    if (valor !== 0) parcelas.push({ linha, mes, valor, valorCorrigido: valor });
  };
  for (const l of linhas) {
    switch (l.id) {
      case "ato":
        add(l.id, 0, l.valor);
        break;
      case "d30":
        add(l.id, 1, l.valor);
        break;
      case "d60":
        add(l.id, 2, l.valor);
        break;
      case "d90":
        add(l.id, 3, l.valor);
        break;
      case "unica":
        add(l.id, mesesObra, l.valor);
        break;
      case "anual":
        for (let k = 1; k <= l.quantidade; k++) add(l.id, 12 * k, l.valor);
        break;
      case "mensal":
      case "proSoluto":
        for (let k = 1; k <= l.quantidade; k++) add(l.id, k, l.valor);
        break;
    }
  }
  return parcelas;
}

export function mesesDeObra(input: FluxoInput): number {
  const m = input.incc.mesesObra;
  return m !== null && m !== undefined ? quantidadeInteira(m) : quantidadeInteira(input.programacao.qtdMensais);
}

/**
 * Correção estimada pelo INCC: cada parcela vencida no mês t é corrigida por
 * (1 + taxa)^min(t, mesesObra). Depois da entrega das chaves o índice para de
 * correr sobre o saldo da obra (estimativa simplificada).
 */
export function calcularIncc(input: FluxoInput): ResultadoIncc {
  const taxa = Math.max(0, n(input.incc.taxaMensal));
  const mesesObra = mesesDeObra(input);
  const porLinha = Object.fromEntries(ORDEM_LINHAS.map((id) => [id, { nominal: 0, corrigido: 0 }])) as ResultadoIncc["porLinha"];
  let totalNominal = 0;
  let totalCorrigido = 0;
  for (const p of cronogramaParcelas(input)) {
    const corrigido = p.valor * Math.pow(1 + taxa, Math.min(p.mes, mesesObra));
    porLinha[p.linha].nominal += p.valor;
    porLinha[p.linha].corrigido += corrigido;
    totalNominal += p.valor;
    totalCorrigido += corrigido;
  }
  for (const id of ORDEM_LINHAS) {
    porLinha[id].nominal = round2(porLinha[id].nominal);
    porLinha[id].corrigido = round2(porLinha[id].corrigido);
  }
  return {
    taxaMensal: taxa,
    mesesObra,
    totalNominal: round2(totalNominal),
    totalCorrigido: round2(totalCorrigido),
    acrescimo: round2(totalCorrigido - totalNominal),
    porLinha,
  };
}

// ---------------------------------------------------------------------------
// Validação
// ---------------------------------------------------------------------------

export const CAMPOS_OBRIGATORIOS: { caminho: string; label: string; vazio: (i: FluxoInput) => boolean }[] = [
  { caminho: "cliente.nome", label: "Cliente", vazio: (i) => !i.cliente.nome.trim() },
  { caminho: "cliente.empreendimento", label: "Empreendimento", vazio: (i) => !i.cliente.empreendimento.trim() },
  { caminho: "cliente.unidade", label: "Unidade", vazio: (i) => !i.cliente.unidade.trim() },
  { caminho: "renda.rendaApurada", label: "Renda apurada", vazio: (i) => !(n(i.renda.rendaApurada) > 0) },
  { caminho: "laudo.financiamento", label: "Financiamento (laudo)", vazio: (i) => i.laudo.financiamento === null },
  { caminho: "laudo.prazoMeses", label: "Prazo (meses)", vazio: (i) => !(n(i.laudo.prazoMeses) > 0) },
  { caminho: "imovel.valorImovel", label: "Valor do imóvel", vazio: (i) => !(n(i.imovel.valorImovel) > 0) },
];

export function camposObrigatoriosVazios(input: FluxoInput): string[] {
  return CAMPOS_OBRIGATORIOS.filter((c) => c.vazio(input)).map((c) => c.label);
}

// ---------------------------------------------------------------------------
// Cálculo completo
// ---------------------------------------------------------------------------

export function calcularFluxo(input: FluxoInput): FluxoResultado {
  const parcelaMaxima = calcularParcelaMaxima(input.renda.rendaApurada, input.renda.percentualComprometimento);
  const totalOperacao = calcularTotalOperacao(input.laudo);
  const financiamento = financiamentoEfetivo(input);
  const valorImovel = n(input.imovel.valorImovel);
  const proSoluto = n(input.imovel.proSoluto);

  // G11 = G9 − G10 − G12
  const periodoObra = round2(valorImovel - financiamento - proSoluto);

  const linhas = calcularLinhas(input);
  const total = (id: LinhaId) => linhas.find((l) => l.id === id)!.total;
  const entrada = round2(total("ato") + total("d30") + total("d60") + total("d90"));

  // F13 = (C9 + C10 + C11 + C12) / G9  |  G13 = G10 / G9
  const percentualEntrada = dividir(entrada, valorImovel);
  const percentualFinanciado = dividir(financiamento, valorImovel);

  // D17 = (D9 + ... + D16) − (G11 + G12)   [sem o C17 solto da planilha]
  const totalFluxo = round2(linhas.reduce((s, l) => s + l.total, 0));
  const totalAPagar = round2(periodoObra + proSoluto);
  const saldo = round2(totalFluxo - totalAPagar);
  // Sem valor do imóvel não há o que fechar (evita "Fluxo fechado" num formulário vazio).
  const fechado = valorImovel > 0 && Math.abs(saldo) < TOLERANCIA_SALDO;

  // I17 = −D17 / G16 (ajuste). A sugestão é a mensal que zera o saldo.
  const qtdMensais = quantidadeInteira(input.programacao.qtdMensais);
  const ajusteMensal = qtdMensais > 0 ? -saldo / qtdMensais : null;
  const sugestaoMensal = ajusteMensal === null ? null : n(input.proposta.mensal) + ajusteMensal;

  // J17 = G12 / G17
  const qtdProSoluto = quantidadeInteira(input.programacao.qtdProSoluto);
  const sugestaoProSoluto = qtdProSoluto > 0 ? proSoluto / qtdProSoluto : null;

  const amortizacao =
    input.laudo.taxaJurosAnual !== null
      ? gerarTabelaAmortizacao(
          n(input.laudo.financiamento),
          n(input.laudo.prazoMeses),
          n(input.laudo.taxaJurosAnual),
          input.laudo.amortizacao,
          input.laudo.tipoTaxa,
        )
      : null;

  const prestacaoConsiderada =
    n(input.laudo.valorPrestacao) > 0 ? n(input.laudo.valorPrestacao) : (amortizacao?.primeiraPrestacao ?? null);

  const renda = n(input.renda.rendaApurada);
  const comprometimentoPrestacao = prestacaoConsiderada === null ? null : dividir(prestacaoConsiderada, renda);
  const comprometimentoMensal = n(input.proposta.mensal) > 0 ? dividir(n(input.proposta.mensal), renda) : null;

  const incc = calcularIncc(input);

  const resultado: FluxoResultado = {
    parcelaMaxima,
    totalOperacao,
    financiamento,
    periodoObra,
    percentualEntrada,
    percentualFinanciado,
    entrada,
    linhas,
    totalFluxo,
    totalAPagar,
    saldo,
    fechado,
    ajusteMensal,
    sugestaoMensal,
    sugestaoProSoluto,
    comprometimentoPrestacao,
    comprometimentoMensal,
    prestacaoConsiderada,
    amortizacao,
    incc,
    alertas: [],
  };
  resultado.alertas = gerarAlertas(input, resultado);
  return resultado;
}

export function gerarAlertas(input: FluxoInput, r: Omit<FluxoResultado, "alertas">): Alerta[] {
  const alertas: Alerta[] = [];
  const pct = Math.round(input.renda.percentualComprometimento * 1000) / 10;

  if (r.fechado) {
    alertas.push({ nivel: "sucesso", codigo: "fluxo-fechado", mensagem: "Fluxo fechado" });
  } else if (!(n(input.imovel.valorImovel) > 0)) {
    alertas.push({ nivel: "aviso", codigo: "fluxo-incompleto", mensagem: "Informe o valor do imóvel para montar o fluxo" });
  } else if (r.saldo < 0) {
    alertas.push({ nivel: "erro", codigo: "fluxo-falta", mensagem: `Faltam ${formatarBRL(-r.saldo)} para fechar o fluxo` });
  } else {
    alertas.push({ nivel: "erro", codigo: "fluxo-sobra", mensagem: `Sobram ${formatarBRL(r.saldo)} no fluxo` });
  }

  const renda = n(input.renda.rendaApurada);
  if (renda > 0) {
    if (r.prestacaoConsiderada !== null && r.prestacaoConsiderada > r.parcelaMaxima + TOLERANCIA_SALDO) {
      alertas.push({
        nivel: "erro",
        codigo: "prestacao-acima",
        mensagem: `Prestação do financiamento (${formatarBRL(r.prestacaoConsiderada)}) acima da parcela máxima de ${formatarBRL(r.parcelaMaxima)} (${formatarNumero(pct, 1)}% da renda)`,
      });
    }
    const mensal = n(input.proposta.mensal);
    if (mensal > r.parcelaMaxima + TOLERANCIA_SALDO) {
      alertas.push({
        nivel: "erro",
        codigo: "mensal-acima",
        mensagem: `Mensal (${formatarBRL(mensal)}) acima da parcela máxima de ${formatarBRL(r.parcelaMaxima)} (${formatarNumero(pct, 1)}% da renda)`,
      });
    }
  }

  if (r.periodoObra < 0) {
    alertas.push({
      nivel: "erro",
      codigo: "periodo-obra-negativo",
      mensagem: "Financiamento + Pró-soluto ultrapassam o valor do imóvel",
    });
  }

  const { proposta: p, programacao: q } = input;
  const semQtd: [Num, Num, string][] = [
    [p.mensal, q.qtdMensais, "Mensais"],
    [p.anual, q.qtdAnuais, "Anuais"],
    [p.proSoluto, q.qtdProSoluto, "Pró-soluto"],
  ];
  for (const [valor, qtd, label] of semQtd) {
    if (n(valor) > 0 && quantidadeInteira(qtd) === 0) {
      alertas.push({ nivel: "aviso", codigo: `sem-quantidade-${label}`, mensagem: `${label}: valor informado sem quantidade de parcelas` });
    }
  }

  const proSolutoParcelas = r.linhas.find((l) => l.id === "proSoluto")!.total;
  if (n(input.imovel.proSoluto) > 0 && Math.abs(proSolutoParcelas - n(input.imovel.proSoluto)) >= TOLERANCIA_SALDO && proSolutoParcelas > 0) {
    alertas.push({
      nivel: "aviso",
      codigo: "pro-soluto-divergente",
      mensagem: `Parcelas de pró-soluto somam ${formatarBRL(proSolutoParcelas)}, mas o pró-soluto é ${formatarBRL(n(input.imovel.proSoluto))}`,
    });
  }

  const vazios = camposObrigatoriosVazios(input);
  if (vazios.length) {
    alertas.push({ nivel: "aviso", codigo: "campos-vazios", mensagem: `Preencha: ${vazios.join(", ")}` });
  }

  return alertas;
}

// ---------------------------------------------------------------------------
// Ações sobre o fluxo
// ---------------------------------------------------------------------------

/**
 * Aplica a sugestão de mensal. Como a mensal é arredondada em centavos,
 * a diferença que sobrar (no máximo alguns centavos) vai para o Ato,
 * para o fluxo fechar exatamente em zero.
 */
export function aplicarSugestaoMensal(input: FluxoInput): FluxoInput {
  const r = calcularFluxo(input);
  if (r.sugestaoMensal === null) return input;
  const mensal = round2(r.sugestaoMensal);
  const proximo: FluxoInput = { ...input, proposta: { ...input.proposta, mensal } };
  const residuo = calcularFluxo(proximo).saldo;
  if (Math.abs(residuo) >= TOLERANCIA_SALDO) {
    proximo.proposta.ato = round2(n(proximo.proposta.ato) - residuo);
  }
  return proximo;
}

/** Aplica o valor sugerido da parcela de pró-soluto (J17). */
export function aplicarSugestaoProSoluto(input: FluxoInput): FluxoInput {
  const r = calcularFluxo(input);
  if (r.sugestaoProSoluto === null) return input;
  return { ...input, proposta: { ...input.proposta, proSoluto: round2(r.sugestaoProSoluto) } };
}

// ---------------------------------------------------------------------------
// Comparação de cenários
// ---------------------------------------------------------------------------

export interface Cenario {
  nome: string;
  input: FluxoInput;
}

export interface ResumoCenario {
  nome: string;
  resultado: FluxoResultado;
  entrada: number;
  percentualEntrada: number | null;
  mensal: number;
  qtdMensais: number;
  totalConstrutora: number;
  saldo: number;
  fechado: boolean;
  prestacao: number | null;
  totalJuros: number | null;
  acrescimoIncc: number;
}

export const MAX_CENARIOS = 3;

export function compararCenarios(cenarios: Cenario[]): ResumoCenario[] {
  return cenarios.slice(0, MAX_CENARIOS).map(({ nome, input }) => {
    const r = calcularFluxo(input);
    return {
      nome,
      resultado: r,
      entrada: r.entrada,
      percentualEntrada: r.percentualEntrada,
      mensal: n(input.proposta.mensal),
      qtdMensais: quantidadeInteira(input.programacao.qtdMensais),
      totalConstrutora: r.totalFluxo,
      saldo: r.saldo,
      fechado: r.fechado,
      prestacao: r.prestacaoConsiderada,
      totalJuros: r.amortizacao?.totalJuros ?? null,
      acrescimoIncc: r.incc.acrescimo,
    };
  });
}

// ---------------------------------------------------------------------------
// Formatação (pt-BR) e resumo em texto
// ---------------------------------------------------------------------------

const fmtBRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** 1234.56 → "R$ 1.234,56" */
export function formatarBRL(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return "—";
  // Intl usa espaço não separável; normalizamos para espaço comum.
  return fmtBRL.format(round2(v) === 0 ? 0 : v).replace(/ /g, " ");
}

export function formatarNumero(v: number, casas = 2): string {
  return new Intl.NumberFormat("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas }).format(v);
}

/** 0.0423 → "4,2%" (sempre 1 casa) */
export function formatarPercentual(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return "—";
  return `${formatarNumero(v * 100, 1)}%`;
}

/** "1.234,56" / "1234,56" / "R$ 1.234" → 1234.56; vazio → null */
export function parseNumeroBR(texto: string): number | null {
  const limpo = texto.replace(/[^\d,.-]/g, "");
  if (!limpo || limpo === "-") return null;
  const normalizado = limpo.includes(",") ? limpo.replace(/\./g, "").replace(",", ".") : limpo.replace(/\.(?=\d{3}(\D|$))/g, "");
  const v = Number(normalizado);
  return Number.isFinite(v) ? v : null;
}

export const RODAPE_PROPOSTA =
  "*Simulação de proposta que, por si só, não garante a prioridade de compra ou reserva da unidade autônoma, tampouco assegura os preços e condições comerciais nela descritos.";

/** Resumo em texto (WhatsApp). */
export function gerarResumoTexto(input: FluxoInput, r: FluxoResultado = calcularFluxo(input)): string {
  const c = input.cliente;
  const linhas: string[] = [];
  linhas.push("*LOGAN — Simulação de fluxo de pagamento*");
  if (c.nome) linhas.push(`Cliente: ${c.nome}`);
  if (c.empreendimento || c.unidade) linhas.push(`Imóvel: ${[c.empreendimento, c.unidade && `unidade ${c.unidade}`].filter(Boolean).join(" — ")}`);
  linhas.push("");
  linhas.push(`Valor do imóvel: ${formatarBRL(n(input.imovel.valorImovel))}`);
  linhas.push(
    `Financiamento ${input.laudo.modalidade}/${input.laudo.amortizacao === "PRICE" ? "Price" : "SAC"}: ${formatarBRL(r.financiamento)} (${formatarPercentual(r.percentualFinanciado)})`,
  );
  if (n(input.laudo.fgts) > 0) linhas.push(`FGTS: ${formatarBRL(n(input.laudo.fgts))}`);
  if (n(input.laudo.subsidio) > 0) linhas.push(`Subsídio: ${formatarBRL(n(input.laudo.subsidio))}`);
  if (r.prestacaoConsiderada) linhas.push(`Prestação estimada: ${formatarBRL(r.prestacaoConsiderada)} em ${n(input.laudo.prazoMeses)} meses`);
  linhas.push("");
  linhas.push("*Fluxo com a construtora*");
  for (const l of r.linhas) {
    if (l.total === 0) continue;
    linhas.push(l.quantidade > 1 ? `• ${l.label}: ${l.quantidade}x de ${formatarBRL(l.valor)} = ${formatarBRL(l.total)}` : `• ${l.label}: ${formatarBRL(l.total)}`);
  }
  linhas.push(`Entrada (ato + 30/60/90): ${formatarBRL(r.entrada)} (${formatarPercentual(r.percentualEntrada)})`);
  linhas.push(`Total do fluxo: ${formatarBRL(r.totalFluxo)}`);
  if (!r.fechado) linhas.push(`⚠️ Saldo em aberto: ${formatarBRL(r.saldo)}`);
  linhas.push("");
  linhas.push(`_${RODAPE_PROPOSTA}_`);
  return linhas.join("\n");
}

/** Link wa.me com o resumo. Telefone opcional (DDD + número, com ou sem 55). */
export function linkWhatsApp(texto: string, telefone?: string): string {
  let digitos = (telefone ?? "").replace(/\D/g, "");
  if (digitos && digitos.length <= 11) digitos = `55${digitos}`;
  return `https://wa.me/${digitos}?text=${encodeURIComponent(texto)}`;
}
