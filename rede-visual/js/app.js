/* =========================================================
   Ótica Rede Visual — catálogo, sacola e checkout via WhatsApp
   ========================================================= */
(function () {
  "use strict";

  /* -------------------------------------------------------
     CONFIGURAÇÃO — edite aqui os dados da ótica
     ------------------------------------------------------- */
  const CONFIG = {
    // Número com DDI + DDD, só dígitos. Ex.: "5511987654321"
    whatsapp: "5500000000000",
    whatsappLabel: "(00) 00000-0000",
    // Usuário do Instagram sem @ (deixe "" para esconder o link)
    instagram: "",
    // Texto do rodapé (cidade/região de atendimento)
    regiao: "Atendimento itinerante na sua região",
    // Parcelamento sem juros
    parcelasMax: 10,
    parcelaMinima: 25, // valor mínimo de cada parcela (R$)
  };

  /* -------------------------------------------------------
     PRODUTOS — preços e modelos de exemplo, ajuste à vontade
     cat: grau | sol | infantil | lentes
     ------------------------------------------------------- */
  const PRODUCTS = [
    {
      id: "classico-redondo", cat: "grau", name: "Clássico Redondo", shape: "round",
      desc: "Acetato leve com lentes monofocais e proteção UV.",
      price: 249.9, badge: "Mais vendido", rx: true,
      colors: [
        { name: "Preto", frame: "#1b1e26" },
        { name: "Tartaruga", frame: "#7a4a24" },
        { name: "Azul-marinho", frame: "#0a2a6b" },
      ],
    },
    {
      id: "linha-essencial", cat: "grau", name: "Linha Essencial", shape: "rect",
      desc: "Metal fino e retangular, discreto para o dia a dia.",
      price: 199.9, rx: true, thin: true,
      colors: [
        { name: "Grafite", frame: "#3a4150" },
        { name: "Prata", frame: "#9aa3b2" },
        { name: "Dourado", frame: "#b8902f" },
      ],
    },
    {
      id: "executivo-quadrado", cat: "grau", name: "Executivo Quadrado", shape: "square",
      desc: "Presença e conforto, com hastes reforçadas.",
      price: 279.9, rx: true,
      colors: [
        { name: "Preto", frame: "#1b1e26" },
        { name: "Azul", frame: "#0180c3" },
        { name: "Vinho", frame: "#6b1f2e" },
      ],
    },
    {
      id: "gatinho-elegance", cat: "grau", name: "Gatinho Elegance", shape: "cateye",
      desc: "Formato gatinho que valoriza o olhar.",
      price: 269.9, badge: "Novo", badgeBlue: true, rx: true,
      colors: [
        { name: "Preto", frame: "#1b1e26" },
        { name: "Rosé", frame: "#c27f86" },
        { name: "Tartaruga", frame: "#7a4a24" },
      ],
    },
    {
      id: "oval-leve", cat: "grau", name: "Oval Leve", shape: "kids",
      desc: "Formato oval suave, combina com todos os rostos.",
      price: 229.9, rx: true, thin: true,
      colors: [
        { name: "Dourado", frame: "#b8902f" },
        { name: "Prata", frame: "#9aa3b2" },
        { name: "Preto", frame: "#1b1e26" },
      ],
    },
    {
      id: "aviador-polarizado", cat: "sol", name: "Aviador Polarizado", shape: "aviator",
      desc: "Lentes polarizadas UV400 que cortam o reflexo.",
      price: 189.9, badge: "Polarizado", badgeBlue: true, thin: true,
      colors: [
        { name: "Dourado / verde", frame: "#b8902f", tint: "#2f4a35" },
        { name: "Prata / azul", frame: "#9aa3b2", tint: "#1d3d6b" },
        { name: "Preto / fumê", frame: "#1b1e26", tint: "#22262e" },
      ],
    },
    {
      id: "urban-sol", cat: "sol", name: "Urban Sol", shape: "wayfarer",
      desc: "Estilo clássico com proteção UV400.",
      price: 159.9,
      colors: [
        { name: "Preto fosco", frame: "#1b1e26", tint: "#2a2d35" },
        { name: "Azul translúcido", frame: "#1b6fa8", tint: "#1e2f4a" },
        { name: "Tartaruga", frame: "#7a4a24", tint: "#4a3322" },
      ],
    },
    {
      id: "retro-redondo-sol", cat: "sol", name: "Retrô Redondo", shape: "round",
      desc: "Redondo de metal com lentes degradê UV400.",
      price: 169.9, thin: true,
      colors: [
        { name: "Dourado / marrom", frame: "#b8902f", tint: "#5a3a22" },
        { name: "Preto / fumê", frame: "#1b1e26", tint: "#2a2d35" },
      ],
    },
    {
      id: "street-sol", cat: "sol", name: "Street Sol", shape: "rect",
      desc: "Retangular moderno com lentes UV400.",
      price: 149.9,
      colors: [
        { name: "Preto / fumê", frame: "#1b1e26", tint: "#2a2d35" },
        { name: "Vinho / marrom", frame: "#6b1f2e", tint: "#4a3322" },
      ],
    },
    {
      id: "kids-redondo", cat: "infantil", name: "Kids Redondo", shape: "round",
      desc: "Leve e confortável para o dia a dia na escola.",
      price: 169.9, rx: true,
      colors: [
        { name: "Azul-marinho", frame: "#0a2a6b" },
        { name: "Lilás", frame: "#8a6bc4" },
      ],
    },
    {
      id: "kids-flex", cat: "infantil", name: "Kids Flex", shape: "kids",
      desc: "Armação flexível e resistente, com lentes de grau.",
      price: 179.9, badge: "Flexível", rx: true,
      colors: [
        { name: "Azul", frame: "#1b9ad8" },
        { name: "Rosa", frame: "#e0679a" },
        { name: "Verde", frame: "#27a96b" },
      ],
    },
    {
      id: "kids-sol", cat: "infantil", name: "Kids Sol UV400", shape: "wayfarer",
      desc: "Proteção para os olhos dos pequenos no sol.",
      price: 99.9,
      colors: [
        { name: "Azul", frame: "#1b9ad8", tint: "#1e2f4a" },
        { name: "Rosa", frame: "#e0679a", tint: "#3a2a35" },
      ],
    },
    {
      id: "lente-antirreflexo", cat: "lentes", name: "Antirreflexo Premium", lens: "ar",
      desc: "Menos reflexos e mais nitidez em telas e à noite.", price: 89.9, addon: true,
    },
    {
      id: "lente-luz-azul", cat: "lentes", name: "Filtro de Luz Azul", lens: "blue",
      desc: "Mais conforto para quem passa horas no celular e no computador.", price: 119.9, addon: true,
      badge: "Para telas", badgeBlue: true,
    },
    {
      id: "lente-fotossensivel", cat: "lentes", name: "Fotossensível", lens: "photo",
      desc: "Escurece no sol e clareia em ambientes internos.", price: 249.9, addon: true,
    },
    {
      id: "lente-multifocal", cat: "lentes", name: "Multifocal", lens: "multi",
      desc: "Longe, intermediário e perto em uma única lente.", price: 499.9, from: true, addon: true,
    },
  ];

  const CAT_LABEL = { grau: "Óculos de grau", sol: "Óculos de sol", infantil: "Infantil", lentes: "Upgrade de lentes" };

  /* -------------------------------------------------------
     Utilidades
     ------------------------------------------------------- */
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const money = (v) => brl.format(Math.round(v * 100) / 100);
  const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
  let uidSeq = 0;

  function maxInstallments(total) {
    return Math.max(1, Math.min(CONFIG.parcelasMax, Math.floor(total / CONFIG.parcelaMinima)));
  }
  function installmentText(total) {
    const n = maxInstallments(total);
    return n > 1 ? `ou ${n}x de ${money(total / n)} sem juros` : "à vista";
  }
  function onlyDigits(s) { return String(s || "").replace(/\D/g, ""); }
  function formatPhone(v) {
    const d = onlyDigits(v).slice(0, 11);
    if (d.length <= 2) return d.length ? `(${d}` : "";
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }
  function waLink(text) {
    return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;
  }
  const storage = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* modo privado */ } },
  };

  /* -------------------------------------------------------
     Ilustrações (SVG) dos óculos e lentes
     ------------------------------------------------------- */
  const SHAPES = {
    round:    { d: "M108 56A36 36 0 1 1 36 56A36 36 0 1 1 108 56Z", bridge: [106, 46], temple: [37, 46], hl: "M50 42Q58 33 70 32" },
    square:   { d: "M44 24H96Q112 24 112 40V72Q112 88 96 88H44Q28 88 28 72V40Q28 24 44 24Z", bridge: [112, 40], temple: [28, 34], hl: "M42 38Q48 32 62 32" },
    wayfarer: { d: "M26 28Q26 22 34 22H110Q118 22 116 30L108 76Q106 88 92 88H50Q36 88 33 76Z", bridge: [116, 32], temple: [26, 28], hl: "M40 34Q46 29 60 29" },
    aviator:  { d: "M30 30Q30 22 44 22H104Q118 22 116 36Q112 68 90 84Q76 94 58 88Q34 78 30 48Z", bridge: [114, 30], temple: [30, 28], hl: "M42 36Q48 29 62 29" },
    cateye:   { d: "M22 26Q22 20 32 22L106 30Q118 32 116 46Q112 82 76 86Q42 90 34 62Q30 44 22 26Z", bridge: [115, 40], temple: [22, 24], hl: "M40 36Q48 31 62 33" },
    rect:     { d: "M38 34H102Q114 34 114 46V70Q114 82 102 82H38Q26 82 26 70V46Q26 34 38 34Z", bridge: [114, 46], temple: [26, 42], hl: "M38 46Q44 41 58 41" },
    kids:     { d: "M72 22Q110 22 110 56Q110 90 72 90Q34 90 34 56Q34 22 72 22Z", bridge: [107, 44], temple: [36, 44], hl: "M50 38Q57 31 68 31" },
  };

  function glassesSVG(p, colorIdx) {
    const c = p.colors[colorIdx] || p.colors[0];
    const s = SHAPES[p.shape];
    const id = `g${++uidSeq}`;
    const sun = !!c.tint;
    const sw = p.thin ? 4.5 : 7;
    const [bx, by] = s.bridge;
    const [tx, ty] = s.temple;
    const lensFill = sun
      ? `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.tint}" stop-opacity=".98"/><stop offset="1" stop-color="${c.tint}" stop-opacity=".72"/></linearGradient>`
      : `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".7"/><stop offset="1" stop-color="#bcd8f0" stop-opacity=".55"/></linearGradient>`;
    const lens = `<path d="${s.d}" fill="url(#${id})" stroke="${c.frame}" stroke-width="${sw}" stroke-linejoin="round"/>` +
      `<path d="${s.hl}" fill="none" stroke="#fff" stroke-opacity="${sun ? 0.35 : 0.9}" stroke-width="4" stroke-linecap="round"/>`;
    return `<svg viewBox="0 0 240 110" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${p.name}, cor ${c.name}">` +
      `<defs>${lensFill}</defs>` +
      `<path d="M${tx} ${ty}h-14M${240 - tx} ${ty}h14" stroke="${c.frame}" stroke-width="${sw}" stroke-linecap="round"/>` +
      `<path d="M${bx} ${by}Q120 ${by - 12} ${240 - bx} ${by}" fill="none" stroke="${c.frame}" stroke-width="${sw}" stroke-linecap="round"/>` +
      lens +
      `<g transform="translate(240 0) scale(-1 1)">${lens}</g>` +
      `</svg>`;
  }

  function lensSVG(p) {
    const id = `l${++uidSeq}`;
    const ring = `<circle cx="120" cy="80" r="62" fill="url(#${id})" stroke="#c9d9ea" stroke-width="3"/>`;
    const shine = `<path d="M84 52Q98 34 122 32" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-opacity=".9"/>`;
    let defs = "", extra = "";
    switch (p.lens) {
      case "ar":
        defs = `<radialGradient id="${id}" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#d7ecf7"/><stop offset="1" stop-color="#9fd4c4"/></radialGradient>`;
        extra = `<path d="M150 112l18 18M166 100l12 12M44 40l14 14" stroke="#0180c3" stroke-width="4" stroke-linecap="round" stroke-opacity=".35"/>`;
        break;
      case "blue":
        defs = `<radialGradient id="${id}" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#d9ecfb"/><stop offset="1" stop-color="#8fc7ef"/></radialGradient>`;
        extra = `<g stroke="#0180c3" stroke-width="4" stroke-linecap="round"><path d="M10 46h34M10 80h40M10 114h34" stroke-opacity=".9"/><path d="M196 52h30M200 80h30M196 108h30" stroke-opacity=".25"/></g>`;
        break;
      case "photo":
        defs = `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6fbff"/><stop offset=".48" stop-color="#dcebf7"/><stop offset=".52" stop-color="#5a6274"/><stop offset="1" stop-color="#2a2f3a"/></linearGradient>`;
        extra = `<g stroke="#e6a817" stroke-width="4" stroke-linecap="round" fill="none"><circle cx="200" cy="34" r="10"/><path d="M200 14v-4M200 58v-4M180 34h-4M224 34h-4M186 20l-3-3M217 51l-3-3M186 48l-3 3M217 17l-3 3"/></g>`;
        break;
      case "multi":
        defs = `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#e2f0fa"/><stop offset="1" stop-color="#b6d9f2"/></linearGradient>`;
        extra = `<g fill="none" stroke="#0180c3" stroke-opacity=".45" stroke-width="2.5" stroke-dasharray="5 6"><path d="M62 70Q120 84 178 70"/><path d="M78 108Q120 118 162 108"/></g>` +
          `<g font-family="Outfit, sans-serif" font-size="11" font-weight="600" fill="#03447a" text-anchor="middle"><text x="120" y="58">LONGE</text><text x="120" y="97">MÉDIO</text><text x="120" y="128">PERTO</text></g>`;
        break;
    }
    return `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Lente ${p.name}"><defs>${defs}</defs>${ring}${p.lens === "multi" ? "" : shine}${extra}</svg>`;
  }

  const productArt = (p, colorIdx = 0) => (p.lens ? lensSVG(p) : glassesSVG(p, colorIdx));

  /* -------------------------------------------------------
     Catálogo
     ------------------------------------------------------- */
  const grid = $("#products");
  const selectedColor = {}; // id -> índice
  let currentFilter = "todos";

  function productCard(p, i) {
    const ci = selectedColor[p.id] || 0;
    const swatches = p.colors
      ? `<div class="swatches" role="group" aria-label="Cores">` +
        p.colors.map((c, idx) =>
          `<button type="button" class="swatch" style="background:${c.frame}" data-swatch="${idx}" aria-pressed="${idx === ci}" aria-label="Cor ${c.name}" title="${c.name}"></button>`
        ).join("") +
        `<span class="swatch-label" data-swatch-label>${p.colors[ci].name}</span></div>`
      : "";
    return `
      <article class="product" data-id="${p.id}" style="animation-delay:${Math.min(i, 8) * 50}ms">
        <div class="product-media">
          ${p.badge ? `<span class="badge${p.badgeBlue ? " badge-blue" : ""}">${p.badge}</span>` : ""}
          <div data-art>${productArt(p, ci)}</div>
        </div>
        <div class="product-body">
          <span class="product-cat">${CAT_LABEL[p.cat]}</span>
          <h3>${p.name}</h3>
          <p class="product-desc">${p.desc}</p>
          ${swatches}
          <div class="product-foot">
            <div class="price">
              ${p.from ? `<span class="price-from">a partir de</span>` : p.addon ? `<span class="price-from">adicional</span>` : ""}
              <span class="price-now">${p.addon ? "+ " : ""}${money(p.price)}</span>
              <span class="price-inst">${installmentText(p.price)}</span>
            </div>
            <button type="button" class="add-btn" data-add aria-label="Adicionar ${p.name} à sacola">
              <svg class="ic"><use href="#i-plus"/></svg>
            </button>
          </div>
        </div>
      </article>`;
  }

  function renderProducts() {
    const list = currentFilter === "todos" ? PRODUCTS : PRODUCTS.filter((p) => p.cat === currentFilter);
    grid.innerHTML = list.map(productCard).join("");
  }

  $$("[data-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentFilter = btn.dataset.filter;
      $$("[data-filter]").forEach((b) => {
        const on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-selected", String(on));
      });
      renderProducts();
    });
  });

  grid.addEventListener("click", (e) => {
    const card = e.target.closest(".product");
    if (!card) return;
    const p = byId[card.dataset.id];

    const sw = e.target.closest("[data-swatch]");
    if (sw) {
      const idx = Number(sw.dataset.swatch);
      selectedColor[p.id] = idx;
      $$("[data-swatch]", card).forEach((b) => b.setAttribute("aria-pressed", String(b === sw)));
      $("[data-swatch-label]", card).textContent = p.colors[idx].name;
      $("[data-art]", card).innerHTML = productArt(p, idx);
      return;
    }

    const add = e.target.closest("[data-add]");
    if (add) {
      Cart.add(p.id, p.colors ? selectedColor[p.id] || 0 : null);
      add.classList.add("added");
      add.innerHTML = `<svg class="ic"><use href="#i-check"/></svg>`;
      clearTimeout(add._t);
      add._t = setTimeout(() => {
        add.classList.remove("added");
        add.innerHTML = `<svg class="ic"><use href="#i-plus"/></svg>`;
      }, 1400);
      toast(`${p.name} adicionado à sacola`);
    }
  });

  /* -------------------------------------------------------
     Sacola
     ------------------------------------------------------- */
  const CART_KEY = "rv-cart-v1";
  const Cart = {
    items: [],
    load() {
      const saved = storage.get(CART_KEY);
      this.items = Array.isArray(saved)
        ? saved.filter((it) => it && byId[it.id] && Number.isInteger(it.qty) && it.qty > 0)
        : [];
    },
    save() { storage.set(CART_KEY, this.items); },
    key(id, color) { return `${id}::${color == null ? "-" : color}`; },
    add(id, color) {
      const k = this.key(id, color);
      const found = this.items.find((it) => this.key(it.id, it.color) === k);
      if (found) found.qty = Math.min(found.qty + 1, 20);
      else this.items.push({ id, color, qty: 1 });
      this.changed(true);
    },
    setQty(index, qty) {
      if (!this.items[index]) return;
      if (qty <= 0) this.items.splice(index, 1);
      else this.items[index].qty = Math.min(qty, 20);
      this.changed();
    },
    clear() { this.items = []; this.changed(); },
    count() { return this.items.reduce((n, it) => n + it.qty, 0); },
    total() { return this.items.reduce((t, it) => t + byId[it.id].price * it.qty, 0); },
    needsRx() { return this.items.some((it) => byId[it.id].rx || byId[it.id].cat === "lentes"); },
    changed(bump) { this.save(); renderCart(bump); },
  };

  const cartList = $("#cart-list");
  const cartEmpty = $("#cart-empty");
  const cartFoot = $("#cart-foot");

  function variantName(it) {
    const p = byId[it.id];
    return p.colors && it.color != null && p.colors[it.color] ? p.colors[it.color].name : "";
  }

  function renderCart(bump) {
    const count = Cart.count();
    const total = Cart.total();

    $$("[data-cart-count]").forEach((el) => {
      el.textContent = count;
      el.hidden = count === 0;
      if (bump) { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }
    });
    $$("[data-open-cart]").forEach((b) => b.setAttribute("aria-label", `Abrir sacola (${count} ${count === 1 ? "item" : "itens"})`));
    $$("[data-cart-subtotal]").forEach((el) => (el.textContent = money(total)));
    $("[data-cart-installments]").textContent = total > 0 ? installmentText(total) : "";
    $("[data-summary-count]").textContent = `${count} ${count === 1 ? "item" : "itens"}`;

    cartEmpty.hidden = count > 0;
    cartFoot.hidden = count === 0;
    cartList.innerHTML = Cart.items.map((it, i) => {
      const p = byId[it.id];
      const v = variantName(it);
      return `
        <li class="cart-item">
          <div class="cart-thumb">${productArt(p, it.color || 0)}</div>
          <div class="cart-info">
            <div class="cart-info-top">
              <div>
                <div class="cart-name">${p.name}</div>
                <div class="cart-variant">${v || CAT_LABEL[p.cat]}</div>
              </div>
              <button type="button" class="remove-btn" data-remove="${i}" aria-label="Remover ${p.name}"><svg class="ic"><use href="#i-trash"/></svg></button>
            </div>
            <div class="cart-info-bottom">
              <div class="qty">
                <button type="button" data-dec="${i}" aria-label="Diminuir quantidade"><svg class="ic"><use href="#i-minus"/></svg></button>
                <output aria-live="polite">${it.qty}</output>
                <button type="button" data-inc="${i}" aria-label="Aumentar quantidade"><svg class="ic"><use href="#i-plus"/></svg></button>
              </div>
              <span class="cart-price">${money(p.price * it.qty)}</span>
            </div>
          </div>
        </li>`;
    }).join("");

    // Se esvaziar durante o checkout, volta para a lista
    if (count === 0 && currentStep === "checkout") showStep("items");
    updateCheckoutFields();
  }

  cartList.addEventListener("click", (e) => {
    const t = e.target.closest("button");
    if (!t) return;
    if (t.dataset.inc != null) Cart.setQty(+t.dataset.inc, Cart.items[+t.dataset.inc].qty + 1);
    else if (t.dataset.dec != null) Cart.setQty(+t.dataset.dec, Cart.items[+t.dataset.dec].qty - 1);
    else if (t.dataset.remove != null) Cart.setQty(+t.dataset.remove, 0);
  });

  /* ---------- Drawer ---------- */
  const drawer = $("#cart");
  const backdrop = $(".drawer-backdrop");
  const backBtn = $("[data-cart-back]");
  const titleEl = $("#cart-title");
  let lastFocus = null;
  let currentStep = "items";

  function showStep(step) {
    currentStep = step;
    $$(".drawer-step", drawer).forEach((el) => (el.hidden = el.dataset.step !== step));
    backBtn.hidden = step !== "checkout";
    titleEl.textContent = step === "checkout" ? "Seus dados" : step === "done" ? "Tudo certo" : "Sua sacola";
    const body = $(`[data-step="${step}"] .drawer-body`, drawer);
    if (body) body.scrollTop = 0;
  }

  function openCart() {
    lastFocus = document.activeElement;
    toastEl.classList.remove("is-show");
    showStep("items");
    backdrop.hidden = false;
    drawer.removeAttribute("inert");
    drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    requestAnimationFrame(() => {
      backdrop.classList.add("is-open");
      drawer.classList.add("is-open");
    });
    setTimeout(() => $("[data-close-cart]", drawer).focus(), 50);
  }

  function closeCart() {
    if (!drawer.classList.contains("is-open")) return;
    drawer.classList.remove("is-open");
    backdrop.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    drawer.setAttribute("inert", "");
    document.body.classList.remove("no-scroll");
    setTimeout(() => { backdrop.hidden = true; }, 300);
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-open-cart]")) { e.preventDefault(); openCart(); return; }
    const closer = e.target.closest("[data-close-cart]");
    if (closer) {
      closeCart();
      if (currentStep === "done") showStep("items");
    }
  });
  backBtn.addEventListener("click", () => showStep("items"));
  $("[data-go-checkout]").addEventListener("click", () => {
    if (Cart.count() === 0) return;
    showStep("checkout");
    setTimeout(() => $("#k-nome").focus(), 50);
  });

  document.addEventListener("keydown", (e) => {
    if (!drawer.classList.contains("is-open")) return;
    if (e.key === "Escape") { closeCart(); return; }
    if (e.key !== "Tab") return;
    const focusables = $$('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])', drawer)
      .filter((el) => el.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* -------------------------------------------------------
     Formulários
     ------------------------------------------------------- */
  $$("[data-phone]").forEach((inp) => {
    inp.addEventListener("input", () => {
      const atEnd = inp.selectionStart === inp.value.length;
      inp.value = formatPhone(inp.value);
      if (atEnd) inp.setSelectionRange(inp.value.length, inp.value.length);
    });
  });

  function setError(input, msg) {
    const err = $(`[data-error-for="${input.id}"]`);
    input.classList.toggle("is-invalid", !!msg);
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    if (err) {
      err.textContent = msg || "";
      if (msg) { err.id = err.id || `${input.id}-err`; input.setAttribute("aria-describedby", err.id); }
      else input.removeAttribute("aria-describedby");
    }
    return !msg;
  }
  function validateText(input, label, min = 2) {
    return setError(input, input.value.trim().length < min ? `Informe ${label}.` : "");
  }
  function validatePhone(input) {
    const n = onlyDigits(input.value).length;
    return setError(input, n < 10 || n > 11 ? "Informe um WhatsApp válido com DDD." : "");
  }
  // Limpa o erro assim que a pessoa corrige
  $$(".input").forEach((inp) => inp.addEventListener("input", () => inp.classList.contains("is-invalid") && setError(inp, "")));

  /* ---------- Checkout ---------- */
  const checkoutForm = $("#checkout-form");
  const parcelasSel = $("#k-parcelas");

  function updateCheckoutFields() {
    if (!checkoutForm) return;
    const entrega = checkoutForm.entrega.value;
    $("[data-endereco-field]").hidden = entrega !== "Entrega no endereço";
    $("[data-campanha-field]").hidden = entrega !== "Retirar na campanha";
    $("[data-receita-field]").hidden = !Cart.needsRx();

    const credito = checkoutForm.pagamento.value === "Cartão de crédito";
    $("[data-parcelas-field]").hidden = !credito;
    const total = Cart.total();
    const n = maxInstallments(total);
    const prev = parcelasSel.value;
    parcelasSel.innerHTML = Array.from({ length: n }, (_, i) => {
      const k = i + 1;
      const label = k === 1 ? `1x de ${money(total)}` : `${k}x de ${money(total / k)} sem juros`;
      return `<option value="${k}">${label}</option>`;
    }).join("");
    if (prev && +prev <= n) parcelasSel.value = prev;
  }
  checkoutForm.addEventListener("change", (e) => {
    if (e.target.name === "entrega" || e.target.name === "pagamento") updateCheckoutFields();
  });

  checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (Cart.count() === 0) { showStep("items"); return; }
    const f = checkoutForm;
    const entrega = f.entrega.value;
    const ok = [
      validateText(f.nome, "seu nome", 3),
      validatePhone(f.fone),
      entrega === "Entrega no endereço" ? validateText(f.endereco, "o endereço de entrega", 8) : setError(f.endereco, ""),
    ].every(Boolean);
    if (!ok) { const bad = $(".is-invalid", f); if (bad) bad.focus(); return; }

    const total = Cart.total();
    const lines = Cart.items.map((it) => {
      const p = byId[it.id];
      const v = variantName(it);
      return `• ${it.qty}x ${p.name}${v ? ` (${v})` : ""} — ${money(p.price * it.qty)}`;
    });
    let pagamento = f.pagamento.value;
    if (pagamento === "Cartão de crédito") {
      const k = +parcelasSel.value || 1;
      pagamento += k > 1 ? ` em ${k}x de ${money(total / k)}` : " à vista";
    }

    const msg = [
      "Olá, Rede Visual! Quero fazer um pedido pelo site:",
      "",
      "*Itens*",
      ...lines,
      `*Subtotal:* ${money(total)}`,
      "",
      `*Nome:* ${f.nome.value.trim()}`,
      `*WhatsApp:* ${f.fone.value.trim()}`,
      `*Recebimento:* ${entrega}`,
      entrega === "Entrega no endereço" ? `*Endereço:* ${f.endereco.value.trim()}` : f.campanha.value.trim() ? `*Campanha:* ${f.campanha.value.trim()}` : null,
      Cart.needsRx() ? `*Receita:* ${f.receita.value}` : null,
      `*Pagamento:* ${pagamento}`,
      f.obs.value.trim() ? `*Observações:* ${f.obs.value.trim()}` : null,
    ].filter((l) => l !== null).join("\n");

    const url = waLink(msg);
    $("[data-done-link]").href = url;
    window.open(url, "_blank", "noopener");
    Cart.clear();
    f.reset();
    updateCheckoutFields();
    showStep("done");
  });

  /* ---------- Campanha ---------- */
  const campaignForm = $("#campaign-form");
  const dateInput = $("#c-data");
  if (dateInput) {
    const t = new Date();
    dateInput.min = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
  }
  campaignForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = campaignForm;
    const ok = [
      validateText(f.local, "o nome do local"),
      validateText(f.bairro, "o bairro ou a cidade"),
      validateText(f.nome, "seu nome", 3),
      validatePhone(f.fone),
    ].every(Boolean);
    if (!ok) { const bad = $(".is-invalid", f); if (bad) bad.focus(); return; }

    let data = "";
    if (f.data.value) {
      const [y, m, d] = f.data.value.split("-");
      data = `${d}/${m}/${y}`;
    }
    const msg = [
      "Olá, Rede Visual! Gostaria de agendar uma campanha de saúde visual.",
      "",
      `*Tipo de local:* ${f.tipo.value}`,
      `*Local:* ${f.local.value.trim()}`,
      `*Bairro/cidade:* ${f.bairro.value.trim()}`,
      `*Responsável:* ${f.nome.value.trim()}`,
      `*WhatsApp:* ${f.fone.value.trim()}`,
      `*Público estimado:* ${f.publico.value}`,
      data ? `*Data preferida:* ${data}` : null,
      f.msg.value.trim() ? `*Observações:* ${f.msg.value.trim()}` : null,
    ].filter((l) => l !== null).join("\n");

    window.open(waLink(msg), "_blank", "noopener");
    toast("Abrindo o WhatsApp com sua solicitação…");
  });

  /* -------------------------------------------------------
     Interface geral
     ------------------------------------------------------- */
  // Links de contato
  const genericMsg = "Olá, Rede Visual! Vim pelo site e gostaria de mais informações.";
  $$("[data-whats-link]").forEach((a) => (a.href = waLink(genericMsg)));
  $$("[data-whats-label]").forEach((el) => (el.textContent = CONFIG.whatsappLabel));
  $$("[data-insta-link]").forEach((a) => {
    if (!CONFIG.instagram) { a.closest("li").hidden = true; return; }
    a.href = `https://instagram.com/${CONFIG.instagram}`;
  });
  $$("[data-insta-label]").forEach((el) => (el.textContent = `@${CONFIG.instagram}`));
  $$("[data-city-label]").forEach((el) => (el.textContent = CONFIG.regiao));
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  // Toast
  const toastEl = $("#toast");
  let toastTimer;
  function toast(text) {
    toastEl.textContent = text;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-show"), 2400);
  }

  // Header sólido ao rolar
  const header = $(".site-header");
  const nav = $("#main-nav");
  const menuBtn = $(".menu-btn");
  function onScroll() {
    header.classList.toggle("is-solid", window.scrollY > 24 || nav.classList.contains("is-open"));
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Menu mobile
  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    menuBtn.innerHTML = `<svg class="ic"><use href="#i-${open ? "x" : "menu"}"/></svg>`;
    onScroll();
  }
  menuBtn.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); menuBtn.focus(); } });
  window.matchMedia("(min-width: 901px)").addEventListener("change", (m) => { if (m.matches) setMenu(false); });

  // Revelar ao rolar
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        const siblings = Array.from(el.parentElement.children);
        el.style.transitionDelay = `${siblings.indexOf(el) * 80}ms`;
        el.classList.add("is-in");
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- Início ---------- */
  Cart.load();
  renderProducts();
  renderCart();
})();
