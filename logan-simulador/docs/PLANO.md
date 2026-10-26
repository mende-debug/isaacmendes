# Logan Simulador: plano e mapeamento da planilha

## 1. Fórmulas da planilha original (`Fluxo_de_Pagamento_-_Modelo.xlsx`)

| Célula | Significado | Fórmula na planilha | Em `lib/fluxo.ts` |
|---|---|---|---|
| G5 | Renda apurada | input | `renda.rendaApurada` |
| G6 | Parcela máxima | `=G5*0.3` | `calcularParcelaMaxima` (percentual configurável) |
| J5..J11 | Laudo: financiamento, FGTS, subsídio, prestação, prazo, modalidade, amortização | inputs | `laudo.*` |
| J12 | Total da operação | `=J5+J6+J7` | `calcularTotalOperacao` |
| G9 | Valor do imóvel | input | `imovel.valorImovel` |
| G10 | Financiamento | input (**duplicado** do J5) | `financiamentoEfetivo`: vem do laudo |
| G11 | Período de obra | `=G9-G10-G12` | `periodoObra` |
| G12 | Pró-soluto | input | `imovel.proSoluto` |
| F13 | % entrada | `=(C9+C10+C11+C12)/G9` | `percentualEntrada` |
| G13 | % financiado | `=G10/G9` | `percentualFinanciado` |
| G15/G16/G17 | Qtd. anuais / mensais / pró-soluto | inputs | `programacao.*` |
| C9..C16 | Valores unitários: Ato, 30, 60, 90, Mensais, Anuais, Única, Pró-soluto | inputs | `proposta.*` |
| D9..D12, D15 | Totais | `=C9` … `=C15` | `calcularLinhas` |
| D13 | Total mensais | `=C13*G16` | idem |
| D14 | Total anuais | `=C14*G15` | idem |
| D16 | Total pró-soluto | `=C16*G17` | idem |
| D17 | Saldo | `=(D9+…+D16+C17)-(G11+G12)` | `saldo` |
| I17 | Valor mensais | `=-D17/G16` | `ajusteMensal` / `sugestaoMensal` |
| J17 | V. pró-soluto | `=G12/G17` | `sugestaoProSoluto` |
| B19 | Rodapé legal | texto | `RODAPE_PROPOSTA` |

## 2. Problemas encontrados e correções

1. **Financiamento digitado duas vezes** (J5 e G10). Agora o simulador usa o valor do laudo.
2. **D17 soma `C17`**, uma célula vazia fora da tabela. Removido.
3. **`#DIV/0!`** em F13, G13, I17 e J17 quando a planilha está vazia. Agora retornam `null` e aparecem como "—".
4. **30% fixo** dentro da fórmula G6. Agora é configurável por simulação.
5. **I17 só funciona com a mensal zerada.** A planilha mostra quanto *somar* à mensal (`−saldo/qtd`), e não o valor final. O motor devolve os dois: `ajusteMensal` (igual ao I17) e `sugestaoMensal` (mensal atual + ajuste), que é o valor usado no botão "Aplicar sugestão". Quando a divisão gera dízima, os centavos que sobram vão para o Ato, e o fluxo fecha exatamente em zero.
6. **Fluxo vazio aparecia como "fechado"** (saldo 0). Agora só fecha depois que o valor do imóvel é informado.
7. **FGTS e subsídio não abatem o período de obra.** A planilha ignora esses valores no fluxo. Mantive o comportamento da planilha como padrão e adicionei o interruptor "Abater FGTS e subsídio do período de obra".

## 3. Prova de que os cálculos batem

Os números do caso de teste foram digitados na planilha original, que foi recalculada no LibreOffice. As saídas das células são as asserções em `lib/fluxo.test.ts`:

| Caso | Mensal | Única | D13 | D17 (saldo) | I17 |
|---|---|---|---|---|---|
| A | 900 | 6.000 | 27.000 | 0 | 0 |
| B | 800 | 6.000 | 24.000 | −3.000 | 100 |
| C | 1.000 | 4.500 | 30.000 | 1.500 | −50 |

Valores fixos nos três casos: G6 = 1.800, J12 = 215.000, G11 = 50.000, F13 = 4,23%, G13 = 69,23%, J17 = 500.

## 4. Estrutura de pastas

```
logan-simulador/
├── app/
│   ├── (auth)/login, (auth)/cadastro     # telas públicas
│   ├── (app)/page.tsx                    # dashboard (simulações recentes)
│   ├── (app)/clientes/[id]               # histórico por cliente
│   ├── (app)/simulacoes/nova             # simulador vazio
│   ├── (app)/simulacoes/[id]             # simulador
│   ├── (app)/simulacoes/[id]/comparar    # até 3 cenários lado a lado
│   ├── (app)/simulacoes/[id]/proposta    # visualização, PDF, WhatsApp
│   ├── manifest.ts, offline/             # PWA
├── components/                           # Simulador, Comparador, Proposta, campos…
├── lib/
│   ├── fluxo.ts        # ⭐ motor de cálculo puro (sem dependências), pronto para o CRM
│   ├── fluxo.test.ts   # testes Vitest com os números da planilha
│   ├── pdf.ts          # proposta em PDF (jsPDF)
│   ├── actions/        # server actions (auth, simulações)
│   ├── session.ts      # sessão JWT em cookie httpOnly
│   └── db.ts, queries.ts, cenarios.ts
├── prisma/             # schema SQLite + migrations + seed
├── public/             # ícones e service worker
└── proxy.ts            # redireciona quem não está logado
```

## 5. Premissas dos extras

- **Amortização:** a taxa anual nominal vira mensal por `/12` (padrão Caixa). A taxa efetiva vira mensal por `(1+a)^(1/12)−1`. O cálculo não inclui seguros MIP/DFI nem taxa de administração.
- **INCC:** cada parcela vencida no mês *t* é corrigida por `(1+i)^min(t, meses de obra)`. Cronograma usado: Ato no mês 0; 30/60/90 dias nos meses 1, 2 e 3; mensais e pró-soluto a partir do mês 1; anuais nos meses 12, 24 e assim por diante; Única no fim da obra. Sem duração informada, a obra dura o mesmo número de meses que a quantidade de mensais.
