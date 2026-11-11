# Prompt para o Lovable — Ótica Rede Visual

> Antes de colar: anexe a logo (`rede-visual/assets/logo-rede-visual.png`) no chat do Lovable e troque os itens entre [colchetes].

---

Crie uma landing page de alto padrão, em português do Brasil, para a **Ótica Rede Visual**, uma ótica independente que faz **campanhas de saúde visual em condomínios, igrejas, empresas e eventos**. A página apresenta a marca e também **vende dentro da própria página**, com sacola e finalização do pedido pelo WhatsApp.

Pense como um time de produto de uma grande empresa: visual limpo e premium, ótima experiência no celular (mobile-first), acessível e sem erros.

## Stack
- React + TypeScript + Tailwind + shadcn/ui, com lucide-react para os ícones.
- Uma página só (single page), com rolagem suave até as âncoras.
- Todos os dados editáveis (contato, produtos, preços) em um único arquivo `src/config/store.ts`.

## Identidade visual (use a logo anexada como referência de cor)
- Cores principais:
  - Azul-marinho da marca `#001A55` (texto "REDE VISUAL")
  - Azul-escuro `#03447A`
  - Azul da marca `#0180C3` (o "+" e o anel da logo)
  - Azul-claro de destaque `#1B9AD8`
  - Fundo escuro do topo `#020A22` → `#041341`
- Gradiente da marca: `linear-gradient(135deg, #001A55, #03447A 55%, #0180C3)`.
- Neutros: texto `#0B1633`, texto secundário `#3B4766`, bordas `#E2E8F2`, fundo suave `#F4F7FC`.
- Verde só no WhatsApp: `#1FA855`.
- Fontes (Google Fonts): **Outfit** nos títulos (geométrica, combina com a logo) e **Inter** no texto.
- Botões em pílula, cantos arredondados de 16–24px e sombras suaves azuladas.
- Animações discretas: os elementos aparecem ao rolar a página, os cards sobem levemente no hover, e tudo respeita `prefers-reduced-motion`.

## Estrutura da página

1. **Header fixo**
   - Logo circular + "Ótica / Rede Visual+", com o "+" em `#1B9AD8`.
   - Links: Campanhas, Loja, Como funciona e Dúvidas.
   - Botão "Agendar campanha" e ícone da sacola com contador.
   - Fica transparente sobre o hero e passa a branco com blur depois de rolar 24px.
   - No celular, vira menu hambúrguer.

2. **Hero (fundo azul-marinho escuro)**
   - Gradientes radiais azuis e uma textura sutil de pontos.
   - Selo: "Ótica independente que vai até você".
   - Título: "Enxergar bem **mais perto** de você.", com "mais perto" em gradiente azul-claro.
   - Subtítulo: "Levamos atendimento óptico completo para condomínios, igrejas, empresas e eventos. Óculos bonitos, lentes de qualidade e preço justo — sem você precisar sair de perto de casa."
   - Botões: "Comprar óculos →" (âncora para a loja) e "Levar a campanha ao meu local" (âncora para o formulário).
   - 3 diferenciais com ícone: Parcelamento no cartão, Garantia em armação e lentes, Entrega ou retirada na campanha.
   - À direita: a logo grande dentro de um círculo, com um anel em gradiente cônico girando devagar e 2 cards flutuantes ("Campanha no condomínio — Atendimento no seu prédio" e "Óculos completo — Armação + lentes").
   - No celular: o texto vem primeiro, a logo fica menor e os cards flutuantes somem.
   - Embaixo do hero: faixa em loop (marquee) com "CONDOMÍNIOS + IGREJAS + EMPRESAS + EVENTOS + ESCOLAS + ASSOCIAÇÕES".

3. **Campanhas — "A ótica vai até a sua comunidade"**
   - 4 cards com ícone em quadrado com gradiente: Condomínios, Igrejas, Empresas e Eventos/escolas, cada um com uma frase curta.
   - No hover, uma linha em gradiente aparece na base do card.

4. **Loja — "Escolha seus óculos"** (fundo `#F4F7FC`)
   - Filtros em chips: Todos, De grau, De sol, Infantil e Lentes.
   - Grade de cards (4 colunas no desktop, 1 no celular). Cada card tem:
     - ilustração dos óculos em SVG, que muda de cor conforme a cor escolhida;
     - selo opcional ("Mais vendido", "Novo", "Polarizado");
     - categoria, nome e descrição;
     - bolinhas de cor;
     - preço e parcelamento ("ou 10x de R$ X sem juros");
     - botão redondo "+" para adicionar à sacola. Ele vira ✓ por um instante e mostra o toast "{produto} adicionado à sacola".
   - Desenhe os óculos como SVG gerado por código, com formatos redondo, quadrado, wayfarer, aviador, gatinho, retangular fino e oval:
     - aro na cor escolhida;
     - lente translúcida azulada nos óculos de grau e lente escura na cor da tinta nos óculos de sol;
     - um brilho branco na lente.
   - As lentes avulsas usam uma ilustração de lente redonda com efeito: antirreflexo, luz azul, fotossensível (meio clara, meio escura) e multifocal (zonas Longe/Médio/Perto).
   - Produtos iniciais (exemplos editáveis):
     - **De grau** (incluem lentes monofocais com UV):
       - Clássico Redondo — R$ 249,90
       - Linha Essencial — R$ 199,90
       - Executivo Quadrado — R$ 279,90
       - Gatinho Elegance — R$ 269,90
       - Oval Leve — R$ 229,90
     - **De sol (UV400):**
       - Aviador Polarizado — R$ 189,90
       - Urban Sol — R$ 159,90
       - Retrô Redondo — R$ 169,90
       - Street Sol — R$ 149,90
     - **Infantil:**
       - Kids Flex — R$ 179,90
       - Kids Redondo — R$ 169,90
       - Kids Sol UV400 — R$ 99,90
     - **Lentes (adicional):**
       - Antirreflexo Premium — + R$ 89,90
       - Filtro de Luz Azul — + R$ 119,90
       - Fotossensível — + R$ 249,90
       - Multifocal — a partir de + R$ 499,90
   - Cada produto tem 2 ou 3 cores com nome (ex.: Preto, Tartaruga, Azul-marinho, Dourado / verde).
   - Parcelamento: até [10]x sem juros, com parcela mínima de R$ [25].
   - Nota pequena: "Fotos ilustrativas. Valores de lentes para graus comuns…"

5. **Como funciona — 4 passos** com números grandes em gradiente:
   1. Agende a campanha
   2. Divulgamos para você
   3. Atendimento no local
   4. Óculos prontos

6. **Por que a Rede Visual** (fundo escuro, cards em vidro translúcido): Orientação especializada, Preço que cabe no bolso, Garantia e ajustes, Para toda a família.

7. **Agendar campanha** (duas colunas)
   - À esquerda: título "Leve a campanha Rede Visual para o seu espaço" e checklist com 3 itens.
   - À direita: card com formulário:
     - tipo de local em controle segmentado (Condomínio / Igreja / Empresa / Evento);
     - nome do local, bairro/cidade, seu nome e WhatsApp (com máscara (00) 00000-0000);
     - público estimado (select), data preferida (opcional, sem datas passadas) e observações.
   - Valide os campos com mensagens em português. Ao enviar, abra o WhatsApp com a mensagem pronta e formatada em *negrito*.

8. **Dúvidas** — acordeão com perguntas sobre:
   - custo da campanha;
   - necessidade de receita;
   - como funciona a compra pelo site;
   - formas de pagamento;
   - prazo;
   - ajustes e garantia.

9. **Faixa de CTA** em gradiente da marca, com um "+" gigante translúcido ao fundo: "Pronto para enxergar melhor?", botão "Conversar no WhatsApp" e botão "Ver óculos".

10. **Rodapé escuro**: logo, frase da marca, navegação, contato (WhatsApp, Instagram e região de atendimento) e copyright com o ano automático.

11. **Botão flutuante do WhatsApp**, verde, no canto inferior direito. Ele some quando a sacola está aberta.

## Sacola e checkout (venda na página)
- Sacola em gaveta lateral (Sheet do shadcn), salva em `localStorage`.
- Cada item mostra a miniatura do SVG, o nome, a cor, os botões − e + de quantidade, o botão de remover e o total do item.
- Rodapé da sacola: subtotal, "ou Nx de R$ X sem juros" e os botões "Finalizar pedido" e "Continuar comprando". Sacola vazia mostra um estado amigável com o botão "Ver produtos".
- **Etapa "Seus dados"** (com botão de voltar):
  - nome e WhatsApp, ambos obrigatórios;
  - "Como prefere receber?": *Retirar na campanha* (mostra o campo "Onde participou da campanha?") ou *Entrega no endereço* (mostra o endereço, obrigatório);
  - receita: aparece só se a sacola tiver óculos de grau ou lentes ("Tenho receita — envio a foto pelo WhatsApp" / "Ainda não tenho — quero orientação");
  - pagamento: Pix, Crédito ou Débito. No crédito, aparece um select de parcelas com os valores calculados;
  - observações.
- Ao enviar: monte a mensagem e abra `https://wa.me/[NUMERO]?text=...` em uma nova aba. Depois, limpe a sacola e mostre a tela "Pedido enviado!" com o botão "Abrir WhatsApp", caso a janela não abra.
- Modelo da mensagem:
  ```
  Olá, Rede Visual! Quero fazer um pedido pelo site:

  *Itens*
  • 1x Clássico Redondo (Preto) — R$ 249,90
  *Subtotal:* R$ 249,90

  *Nome:* …
  *WhatsApp:* …
  *Recebimento:* …
  *Receita:* …
  *Pagamento:* Cartão de crédito em 5x de R$ …
  ```
- Valores sempre formatados com `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.

## Configuração (`src/config/store.ts`)
```ts
export const CONFIG = {
  whatsapp: "[55DDDNUMERO]",
  whatsappLabel: "[(00) 00000-0000]",
  instagram: "[usuario]",   // vazio esconde o link
  regiao: "[Cidade/região de atendimento]",
  parcelasMax: 10,
  parcelaMinima: 25,
};
```

## Qualidade obrigatória
- Responsivo de 360px a 1440px, sem rolagem horizontal, com margem lateral de 16px no celular e alvos de toque de pelo menos 44px.
- Acessibilidade:
  - HTML semântico, `aria-label` nos botões de ícone e foco visível;
  - foco preso dentro da sacola, que fecha com Esc;
  - contraste AA.
- SEO: title, meta description, Open Graph, `lang="pt-BR"` e favicon a partir da logo.
- Nada de depoimentos, números de clientes ou avaliações inventados.
- Sem erros no console.
