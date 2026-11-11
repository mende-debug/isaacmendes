/* =========================================================
   Ótica Rede Visual — landing page
   ========================================================= */
(function () {
  "use strict";

  /* -------------------------------------------------------
     CONFIGURAÇÃO — edite aqui os dados da ótica
     ------------------------------------------------------- */
  const CONFIG = {
    // Número com DDI + DDD, só dígitos. Ex.: "5511987654321"
    whatsapp: "5511955836636",
    whatsappLabel: "(11) 95583-6636",
    // Usuário do Instagram sem @ (deixe "" para esconder o link)
    instagram: "redevisual",
    email: "redevisualmais@gmail.com",
  };

  /* -------------------------------------------------------
     Utilidades
     ------------------------------------------------------- */
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const onlyDigits = (s) => String(s || "").replace(/\D/g, "");
  function formatPhone(v) {
    const d = onlyDigits(v).slice(0, 11);
    if (d.length <= 2) return d.length ? `(${d}` : "";
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }
  const waLink = (text) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;

  /* -------------------------------------------------------
     Formulário de campanha
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
  const validateText = (input, label, min = 2) =>
    setError(input, input.value.trim().length < min ? `Informe ${label}.` : "");
  function validatePhone(input) {
    const n = onlyDigits(input.value).length;
    return setError(input, n < 10 || n > 11 ? "Informe um WhatsApp válido com DDD." : "");
  }
  // Limpa o erro assim que a pessoa corrige
  $$(".input").forEach((inp) => inp.addEventListener("input", () => {
    if (inp.classList.contains("is-invalid")) setError(inp, "");
  }));

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
      validateText(f.local, "o nome da instituição"),
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
      "Olá, Rede Visual+! Gostaria de agendar uma campanha de saúde visual.",
      "",
      `*Tipo de instituição:* ${f.tipo.value}`,
      `*Instituição:* ${f.local.value.trim()}`,
      `*Bairro/cidade:* ${f.bairro.value.trim()}`,
      `*Responsável:* ${f.nome.value.trim()}`,
      `*WhatsApp:* ${f.fone.value.trim()}`,
      `*Público estimado:* ${f.publico.value}`,
      data ? `*Data preferida:* ${data}` : null,
      f.msg.value.trim() ? `*Observações:* ${f.msg.value.trim()}` : null,
    ].filter((l) => l !== null).join("\n");

    const url = waLink(msg);
    const success = $("#campaign-success");
    $("#campaign-link").href = url;
    success.hidden = false;
    success.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "nearest" });
    window.open(url, "_blank", "noopener");
  });

  /* -------------------------------------------------------
     Contato e rodapé
     ------------------------------------------------------- */
  const genericMsg = "Olá, Rede Visual+! Vim pelo site e gostaria de mais informações.";
  const embMsg = "Olá, Rede Visual+! Vim pelo site e quero saber como ser um Embaixador da Visão+.";
  $$("[data-whats-link]").forEach((a) => (a.href = waLink(genericMsg)));
  $$("[data-emb-link]").forEach((a) => (a.href = waLink(embMsg)));
  $$("[data-whats-label]").forEach((el) => (el.textContent = CONFIG.whatsappLabel));
  $$("[data-insta-link]").forEach((a) => {
    if (!CONFIG.instagram) { a.closest("li").hidden = true; return; }
    a.href = `https://instagram.com/${CONFIG.instagram}`;
  });
  $$("[data-insta-label]").forEach((el) => (el.textContent = `@${CONFIG.instagram}`));
  $$("[data-email-link]").forEach((a) => (a.href = `mailto:${CONFIG.email}`));
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* -------------------------------------------------------
     Header e menu mobile
     ------------------------------------------------------- */
  const header = $(".site-header");
  const nav = $("#main-nav");
  const menuBtn = $(".menu-btn");
  function onScroll() {
    header.classList.toggle("is-solid", window.scrollY > 24 || nav.classList.contains("is-open"));
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    menuBtn.innerHTML = `<svg class="ic"><use href="#i-${open ? "x" : "menu"}"/></svg>`;
    onScroll();
  }
  menuBtn.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); menuBtn.focus(); }
  });
  window.matchMedia("(min-width: 901px)").addEventListener("change", (m) => { if (m.matches) setMenu(false); });

  /* -------------------------------------------------------
     Animações
     ------------------------------------------------------- */
  // Revelar ao rolar, em cascata entre irmãos
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion.matches) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        const siblings = Array.from(el.parentElement.children).filter((c) => c.classList.contains("reveal"));
        const step = Math.min(Math.max(0, siblings.indexOf(el)), 5);
        el.style.transitionDelay = `${step * 90}ms`;
        el.classList.add("is-in");
        // libera o atraso depois da entrada, para o hover responder na hora
        setTimeout(() => { el.style.transitionDelay = ""; }, 1200 + step * 90);
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.12 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  // Barra de progresso de leitura
  const progress = $(".scroll-progress");
  let ticking = false;
  function updateProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
    ticking = false;
  }
  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  updateProgress();

  // Parallax suave no hero (só mouse/trackpad)
  const hero = $(".hero");
  const heroVisual = $(".hero-visual");
  if (hero && heroVisual && window.matchMedia("(pointer: fine)").matches && !reduceMotion.matches) {
    let raf = 0;
    hero.addEventListener("pointermove", (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = hero.getBoundingClientRect();
        heroVisual.style.setProperty("--px", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
        heroVisual.style.setProperty("--py", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
      });
    });
    hero.addEventListener("pointerleave", () => {
      heroVisual.style.setProperty("--px", 0);
      heroVisual.style.setProperty("--py", 0);
    });
  }
})();
