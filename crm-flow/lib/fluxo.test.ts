import { describe, expect, it } from "vitest";
import {
  aplicarSugestaoMensal,
  aplicarSugestaoProSoluto,
  calcularFluxo,
  camposObrigatoriosVazios,
  compararCenarios,
  criarFluxoVazio,
  formatarBRL,
  formatarPercentual,
  gerarResumoTexto,
  gerarTabelaAmortizacao,
  linkWhatsApp,
  normalizarFluxo,
  parseNumeroBR,
  taxaMensalDeAnual,
  type FluxoInput,
} from "./fluxo";

/**
 * Caso-base: os mesmos números foram digitados na planilha original
 * (Fluxo_de_Pagamento_-_Modelo.xlsx) e recalculados no LibreOffice.
 * Os valores "planilha" abaixo são as saídas das células da planilha.
 */
function casoPlanilha(over: Partial<FluxoInput["proposta"]> = {}): FluxoInput {
  const f = criarFluxoVazio();
  f.cliente = { nome: "Maria Souza", telefone: "(11) 98888-7777", empreendimento: "Residencial Aurora", unidade: "Torre 2 — 304" };
  f.renda.rendaApurada = 6000; // G5
  f.laudo = {
    ...f.laudo,
    financiamento: 180000, // J5
    fgts: 20000, // J6
    subsidio: 15000, // J7
    valorPrestacao: 1650, // J8
    prazoMeses: 420, // J9
    modalidade: "MCMV", // J10
    amortizacao: "SAC", // J11
  };
  f.imovel.valorImovel = 260000; // G9
  f.imovel.proSoluto = 30000; // G12
  f.programacao = { qtdAnuais: 2, qtdMensais: 30, qtdProSoluto: 60 }; // G15, G16, G17
  f.proposta = { ato: 5000, d30: 2000, d60: 2000, d90: 2000, mensal: 900, anual: 3000, unica: 6000, proSoluto: 500, ...over }; // C9..C16
  return f;
}

const totalDe = (r: ReturnType<typeof calcularFluxo>, id: string) => r.linhas.find((l) => l.id === id)!.total;

describe("bate com a planilha — caso A (fluxo fechado)", () => {
  const r = calcularFluxo(casoPlanilha());

  it("G6 parcela máxima = renda × 30%", () => expect(r.parcelaMaxima).toBe(1800));
  it("J12 total da operação", () => expect(r.totalOperacao).toBe(215000));
  it("G10 financiamento vem do laudo (J5)", () => expect(r.financiamento).toBe(180000));
  it("G11 período de obra", () => expect(r.periodoObra).toBe(50000));
  it("F13 % entrada", () => expect(r.percentualEntrada).toBeCloseTo(0.0423076923076923, 12));
  it("G13 % financiado", () => expect(r.percentualFinanciado).toBeCloseTo(0.692307692307692, 12));
  it("D9..D16 totais por linha", () => {
    expect(totalDe(r, "ato")).toBe(5000); // D9
    expect(totalDe(r, "d30")).toBe(2000); // D10
    expect(totalDe(r, "d60")).toBe(2000); // D11
    expect(totalDe(r, "d90")).toBe(2000); // D12
    expect(totalDe(r, "mensal")).toBe(27000); // D13
    expect(totalDe(r, "anual")).toBe(6000); // D14
    expect(totalDe(r, "unica")).toBe(6000); // D15
    expect(totalDe(r, "proSoluto")).toBe(30000); // D16
  });
  it("D17 saldo = 0 → fluxo fechado", () => {
    expect(r.saldo).toBe(0);
    expect(r.fechado).toBe(true);
    expect(r.alertas[0]).toMatchObject({ nivel: "sucesso", codigo: "fluxo-fechado" });
  });
  it("I17 ajuste e J17 pró-soluto sugerido", () => {
    expect(r.ajusteMensal).toBeCloseTo(0, 10);
    expect(r.sugestaoMensal).toBe(900);
    expect(r.sugestaoProSoluto).toBe(500);
  });
  it("sem alertas de renda (1650 e 900 ≤ 1800)", () => {
    expect(r.alertas.map((a) => a.codigo)).toEqual(["fluxo-fechado"]);
  });
});

describe("bate com a planilha — caso B (falta R$ 3.000)", () => {
  const input = casoPlanilha({ mensal: 800 });
  const r = calcularFluxo(input);

  it("D13 e D17", () => {
    expect(totalDe(r, "mensal")).toBe(24000);
    expect(r.saldo).toBe(-3000);
    expect(r.fechado).toBe(false);
  });
  it("I17 = −D17 / G16 = 100 (ajuste); sugestão corrigida = 800 + 100", () => {
    expect(r.ajusteMensal).toBe(100);
    expect(r.sugestaoMensal).toBe(900);
  });
  it("alerta vermelho com o valor que falta", () => {
    expect(r.alertas[0]).toMatchObject({ nivel: "erro", codigo: "fluxo-falta", mensagem: "Faltam R$ 3.000,00 para fechar o fluxo" });
  });
  it("aplicar sugestão fecha o fluxo", () => {
    const novo = aplicarSugestaoMensal(input);
    expect(novo.proposta.mensal).toBe(900);
    expect(calcularFluxo(novo).fechado).toBe(true);
    expect(input.proposta.mensal).toBe(800); // não muta o original
  });
});

describe("bate com a planilha — caso C (sobra R$ 1.500)", () => {
  const r = calcularFluxo(casoPlanilha({ mensal: 1000, unica: 4500 }));
  it("D13, D15, D17 e I17", () => {
    expect(totalDe(r, "mensal")).toBe(30000);
    expect(totalDe(r, "unica")).toBe(4500);
    expect(r.saldo).toBe(1500);
    expect(r.ajusteMensal).toBe(-50);
    expect(r.sugestaoMensal).toBe(950);
    expect(r.alertas[0]).toMatchObject({ codigo: "fluxo-sobra", mensagem: "Sobram R$ 1.500,00 no fluxo" });
  });
});

describe("planilha vazia — sem #DIV/0!", () => {
  const r = calcularFluxo(criarFluxoVazio());
  it("divisões por zero viram null", () => {
    expect(r.percentualEntrada).toBeNull(); // F13
    expect(r.percentualFinanciado).toBeNull(); // G13
    expect(r.ajusteMensal).toBeNull(); // I17
    expect(r.sugestaoProSoluto).toBeNull(); // J17
  });
  it("formulário vazio não aparece como fluxo fechado", () => {
    expect(r.fechado).toBe(false);
    expect(r.alertas[0].codigo).toBe("fluxo-incompleto");
  });
  it("zeros como na planilha", () => {
    expect(r.parcelaMaxima).toBe(0);
    expect(r.totalOperacao).toBe(0);
    expect(r.periodoObra).toBe(0);
    expect(r.saldo).toBe(0);
  });
  it("avisa campos obrigatórios vazios", () => {
    expect(camposObrigatoriosVazios(criarFluxoVazio())).toEqual([
      "Cliente",
      "Empreendimento",
      "Unidade",
      "Renda apurada",
      "Financiamento (laudo)",
      "Prazo (meses)",
      "Valor do imóvel",
    ]);
    expect(r.alertas.some((a) => a.codigo === "campos-vazios")).toBe(true);
  });
});

describe("correções e regras novas", () => {
  it("percentual da parcela máxima é configurável", () => {
    const f = casoPlanilha();
    f.renda.percentualComprometimento = 0.25;
    expect(calcularFluxo(f).parcelaMaxima).toBe(1500);
  });

  it("alerta quando prestação ou mensal passam da parcela máxima", () => {
    const f = casoPlanilha({ mensal: 1900 });
    f.laudo.valorPrestacao = 1850;
    const codigos = calcularFluxo(f).alertas.map((a) => a.codigo);
    expect(codigos).toContain("prestacao-acima");
    expect(codigos).toContain("mensal-acima");
  });

  it("sem prestação no laudo, usa a 1ª prestação da tabela", () => {
    const f = casoPlanilha();
    f.laudo.valorPrestacao = null;
    f.laudo.taxaJurosAnual = 0.0816;
    const r = calcularFluxo(f);
    expect(r.prestacaoConsiderada).toBe(1652.57);
    expect(r.alertas.map((a) => a.codigo)).not.toContain("prestacao-acima");
  });

  it("opção de abater FGTS + subsídio do período de obra", () => {
    const f = casoPlanilha();
    f.imovel.abaterFgtsSubsidio = true;
    const r = calcularFluxo(f);
    expect(r.financiamento).toBe(215000);
    expect(r.periodoObra).toBe(15000);
    expect(r.saldo).toBe(35000);
  });

  it("período de obra negativo gera alerta", () => {
    const f = casoPlanilha();
    f.imovel.proSoluto = 100000;
    expect(calcularFluxo(f).alertas.map((a) => a.codigo)).toContain("periodo-obra-negativo");
  });

  it("valor sem quantidade gera aviso", () => {
    const f = casoPlanilha();
    f.programacao.qtdAnuais = 0;
    expect(calcularFluxo(f).alertas.map((a) => a.codigo)).toContain("sem-quantidade-Anuais");
  });

  it("aplicar sugestão com dízima ajusta os centavos no Ato e fecha em zero", () => {
    const f = casoPlanilha({ mensal: 0 });
    f.programacao.qtdMensais = 7; // 27000 / 7 = 3857,142857...
    const novo = aplicarSugestaoMensal(f);
    expect(novo.proposta.mensal).toBe(3857.14);
    expect(novo.proposta.ato).toBe(5000.02);
    expect(calcularFluxo(novo).saldo).toBe(0);
  });

  it("aplicar sugestão de pró-soluto", () => {
    const f = casoPlanilha({ proSoluto: 0 });
    expect(aplicarSugestaoProSoluto(f).proposta.proSoluto).toBe(500);
  });

  it("evita erro de ponto flutuante nos centavos", () => {
    const f = casoPlanilha({ ato: 0.1, d30: 0.2, d60: 0, d90: 0 });
    expect(calcularFluxo(f).entrada).toBe(0.3);
  });
});

describe("tabela de amortização", () => {
  it("SAC: 180.000 em 420 meses a 8,16% a.a. nominal", () => {
    const t = gerarTabelaAmortizacao(180000, 420, 0.0816, "SAC")!;
    expect(t.linhas).toHaveLength(420);
    expect(t.taxaMensal).toBeCloseTo(0.0068, 10);
    expect(t.linhas[0]).toEqual({ mes: 1, prestacao: 1652.57, juros: 1224, amortizacao: 428.57, saldo: 179571.43 });
    expect(t.ultimaPrestacao).toBe(431.49);
    expect(t.linhas[419].saldo).toBe(0);
    expect(t.totalJuros).toBeCloseTo(257652, -1);
  });

  it("Price: prestação constante", () => {
    const t = gerarTabelaAmortizacao(180000, 420, 0.0816, "PRICE")!;
    expect(t.primeiraPrestacao).toBe(1299.44);
    expect(t.linhas[200].prestacao).toBe(1299.44);
    expect(t.linhas[419].saldo).toBe(0);
    expect(t.totalJuros).toBeCloseTo(365765.39, -1);
  });

  it("taxa zero divide o principal igualmente", () => {
    const t = gerarTabelaAmortizacao(1200, 12, 0, "PRICE")!;
    expect(t.linhas.every((l) => l.prestacao === 100)).toBe(true);
  });

  it("entradas inválidas devolvem null", () => {
    expect(gerarTabelaAmortizacao(0, 420, 0.08, "SAC")).toBeNull();
    expect(gerarTabelaAmortizacao(1000, 0, 0.08, "SAC")).toBeNull();
  });

  it("taxa efetiva vs nominal", () => {
    expect(taxaMensalDeAnual(0.12, "nominal")).toBeCloseTo(0.01, 12);
    expect(taxaMensalDeAnual(0.0816, "efetiva")).toBeCloseTo(0.006558196936559346, 12);
  });
});

describe("INCC", () => {
  it("corrige as parcelas da obra a 0,5% a.m. (padrão)", () => {
    const r = calcularFluxo(casoPlanilha());
    expect(r.incc.mesesObra).toBe(30);
    expect(r.incc.totalNominal).toBe(80000);
    expect(r.incc.totalCorrigido).toBeCloseTo(87434.1, 1);
    expect(r.incc.acrescimo).toBeCloseTo(7434.1, 1);
    expect(r.incc.porLinha.ato.corrigido).toBe(5000); // ato não corrige
  });

  it("taxa zero não altera nada", () => {
    const f = casoPlanilha();
    f.incc.taxaMensal = 0;
    expect(calcularFluxo(f).incc.acrescimo).toBe(0);
  });
});

describe("cenários", () => {
  it("compara até 3 cenários", () => {
    const a = casoPlanilha();
    const b = casoPlanilha({ mensal: 800 });
    const res = compararCenarios([
      { nome: "A", input: a },
      { nome: "B", input: b },
      { nome: "C", input: a },
      { nome: "D", input: b },
    ]);
    expect(res).toHaveLength(3);
    expect(res[0]).toMatchObject({ nome: "A", fechado: true, entrada: 11000, mensal: 900, qtdMensais: 30 });
    expect(res[1]).toMatchObject({ nome: "B", fechado: false, saldo: -3000 });
  });
});

describe("formatação pt-BR", () => {
  it("moeda", () => {
    expect(formatarBRL(1234.56)).toBe("R$ 1.234,56");
    expect(formatarBRL(-3000)).toBe("-R$ 3.000,00");
    expect(formatarBRL(null)).toBe("—");
  });
  it("percentual com 1 casa", () => {
    expect(formatarPercentual(0.0423076923)).toBe("4,2%");
    expect(formatarPercentual(0.3)).toBe("30,0%");
    expect(formatarPercentual(null)).toBe("—");
  });
  it("parse de número brasileiro", () => {
    expect(parseNumeroBR("1.234,56")).toBe(1234.56);
    expect(parseNumeroBR("R$ 260.000")).toBe(260000);
    expect(parseNumeroBR("0,5")).toBe(0.5);
    expect(parseNumeroBR("1234.5")).toBe(1234.5);
    expect(parseNumeroBR("")).toBeNull();
  });
});

describe("WhatsApp e normalização", () => {
  it("resumo contém fluxo e rodapé", () => {
    const txt = gerarResumoTexto(casoPlanilha());
    expect(txt).toContain("Cliente: Maria Souza");
    expect(txt).toContain("• Mensais: 30x de R$ 900,00 = R$ 27.000,00");
    expect(txt).toContain("Entrada (ato + 30/60/90): R$ 11.000,00 (4,2%)");
    expect(txt).toContain("não garante a prioridade de compra");
  });
  it("link wa.me com DDI 55", () => {
    expect(linkWhatsApp("oi", "(11) 98888-7777")).toBe("https://wa.me/5511988887777?text=oi");
    expect(linkWhatsApp("a b")).toBe("https://wa.me/?text=a%20b");
  });
  it("normaliza JSON parcial", () => {
    const f = normalizarFluxo({ renda: { rendaApurada: 5000 } });
    expect(f.renda.percentualComprometimento).toBe(0.3);
    expect(f.incc.taxaMensal).toBe(0.005);
    expect(f.renda.rendaApurada).toBe(5000);
  });
  it("corrige tipos inválidos", () => {
    const f = normalizarFluxo({ cliente: { nome: 123 }, proposta: { ato: "abc", mensal: 900 }, laudo: { modalidade: "X" } });
    expect(f.cliente.nome).toBe("");
    expect(f.proposta.ato).toBeNull();
    expect(f.proposta.mensal).toBe(900);
    expect(f.laudo.modalidade).toBe("MCMV");
    expect(normalizarFluxo(null)).toEqual(criarFluxoVazio());
  });
});
