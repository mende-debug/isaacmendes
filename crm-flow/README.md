# CRM Flow

Simulador de fluxo de pagamento para venda de imóveis na planta (padrão Caixa / MCMV / SBPE). Foi feito para usar no celular, durante o atendimento, e pode ser instalado na tela inicial como PWA.

- Next.js 16 (App Router), TypeScript e Tailwind 4
- Prisma + SQLite (fácil de migrar para Postgres)
- Motor de cálculo isolado em [`lib/fluxo.ts`](lib/fluxo.ts), com testes em Vitest
- Proposta em PDF, resumo no WhatsApp, até 3 cenários lado a lado e histórico por cliente

O mapeamento célula a célula da planilha, as correções feitas e as premissas estão em [`docs/PLANO.md`](docs/PLANO.md).

## Rodar localmente

Requisitos: Node 20 ou mais novo (recomendado: 22).

```bash
cd crm-flow
cp .env.example .env          # ajuste AUTH_SECRET
npm install                   # também roda o prisma generate
npx prisma migrate dev        # cria prisma/dev.db
npm run db:seed               # cria o usuário consultor / crmflow123 (definido no .env)
npm run dev                   # http://localhost:3000
```

Para testar no celular na mesma rede, rode `npm run dev -- -H 0.0.0.0` e abra `http://IP-DO-COMPUTADOR:3000`.

### Scripts

| Comando | O que faz |
|---|---|
| `npm test` | testes do motor de cálculo (Vitest) |
| `npm run typecheck` | checagem de tipos |
| `npm run lint` | ESLint |
| `npm run build` | build de produção |
| `npm start` | aplica as migrations e sobe o servidor |

### Variáveis de ambiente

| Variável | Exemplo | Uso |
|---|---|---|
| `DATABASE_URL` | `file:./dev.db` | caminho do SQLite (relativo à pasta `prisma/`) |
| `AUTH_SECRET` | `openssl rand -base64 32` | assina o cookie de sessão. **Obrigatória em produção** |
| `ALLOW_SIGNUP` | `true` / `false` | libera a tela de cadastro |
| `SEED_USERNAME` / `SEED_PASSWORD` | `consultor` / `crmflow123` | usuário criado pelo `npm run db:seed` |

## Deploy na Render

O arquivo [`render.yaml`](../render.yaml), na raiz do repositório, é um *Blueprint* pronto.

1. Suba o código para o GitHub.
2. Na Render, abra **New → Blueprint** e escolha o repositório. A Render lê o `render.yaml` e cria:
   - o web service `crm-flow` (Node 22, `rootDir: crm-flow`);
   - um **disco persistente** de 1 GB montado em `/var/data`, onde fica o banco (`DATABASE_URL=file:/var/data/crmflow.db`);
   - o `AUTH_SECRET`, gerado automaticamente.
3. A cada deploy, `npm ci && npm run build`, e depois `npm start`, que roda `prisma migrate deploy` antes de subir o app.
4. Abra a URL, vá em **Cadastre-se** e crie o seu usuário. Depois, em **Environment**, troque `ALLOW_SIGNUP` para `false` para ninguém mais criar conta.
5. No celular, abra a URL no Chrome (Android) ou no Safari (iPhone) e toque em **Adicionar à tela de início**.

> **Importante:** SQLite precisa de disco persistente, que na Render só existe a partir do plano **Starter** (pago). No plano gratuito o sistema de arquivos é apagado a cada deploy e as simulações se perdem. Para ficar no gratuito, use o Postgres da Render (veja abaixo).

### Migrar para Postgres

1. Em `prisma/schema.prisma`, troque `provider = "sqlite"` por `provider = "postgresql"`.
2. Apague a pasta `prisma/migrations` e gere uma nova migration com `DATABASE_URL` apontando para um Postgres: `npx prisma migrate dev --name init`.
3. Na Render, crie um Postgres, copie a *Internal Database URL* para `DATABASE_URL` e remova o bloco `disk` do `render.yaml`.

O schema não usa nada específico do SQLite. Os dados da simulação ficam em JSON, numa coluna de texto.

## Integrar em outro sistema

`lib/fluxo.ts` não depende de React, Next ou Prisma. Basta copiar o arquivo (e o `fluxo.test.ts`) para o outro projeto:

```ts
import { criarFluxoVazio, calcularFluxo, gerarResumoTexto } from "./fluxo";

const f = criarFluxoVazio();
f.renda.rendaApurada = 6000;
f.laudo.financiamento = 180000;
f.imovel.valorImovel = 260000;
// ...
const r = calcularFluxo(f);
r.saldo;           // D17 da planilha
r.fechado;         // true quando o saldo é 0
r.alertas;         // [{ nivel: "erro", mensagem: "Faltam R$ 3.000,00 para fechar o fluxo" }, ...]
r.amortizacao;     // tabela SAC/Price
r.incc;            // correção estimada
```

Funções úteis: `aplicarSugestaoMensal`, `aplicarSugestaoProSoluto`, `compararCenarios`, `gerarTabelaAmortizacao`, `normalizarFluxo` (valida JSON vindo de fora), `formatarBRL`, `formatarPercentual`, `linkWhatsApp`.
