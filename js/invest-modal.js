/**
 * Popup "Comienza tu inversión" — se abre desde los botones "Quiero invertir" del nav
 */
(function () {
  const TRIGGERS = ".site-header__cta, .mobile-nav__cta a, [data-track='mega-cta'], [data-invest-modal]";
  const MODAL_FRANCHISES = ["wings-force", "sherwood", "divino-cielo", "konigs-bier", "capitan-jack", "heavy-hungry"];
  const inBrandFolder = /\/franquicias\//.test(window.location.pathname);
  const privacyHref = (inBrandFolder ? "../" : "") + "aviso-de-privacidad.html";

  const opts = (list) =>
    `<option value="">Selecciona</option>` + list.map((o) => `<option value="${o}">${o}</option>`).join("");

  const field = (name, label, type = "text", attrs = "") => `
    <div class="im-field">
      <label for="im-${name}">${label} <span class="req">*</span></label>
      <input id="im-${name}" name="${name}" type="${type}" ${attrs} required />
      <span class="im-field__error">Campo requerido</span>
    </div>`;

  const select = (name, label, html) => `
    <div class="im-field">
      <label for="im-${name}">${label} <span class="req">*</span></label>
      <select id="im-${name}" name="${name}" required>${html}</select>
      <span class="im-field__error">Selecciona una opción</span>
    </div>`;

  const franchiseOptions = () => {
    const all = window.MagnoFranchiseAPI?.getAll?.() || [];
    const list = MODAL_FRANCHISES.map((id) => all.find((f) => f.id === id)).filter(Boolean);
    const pageBrand = document.body.dataset.brand || "";
    return (
      `<option value="">Selecciona</option>` +
      list
        .map((f) => `<option value="${f.id}" ${f.id === pageBrand ? "selected" : ""}>${f.name}</option>`)
        .join("")
    );
  };

  function build() {
    const modal = document.createElement("div");
    modal.className = "invest-modal";
    modal.setAttribute("hidden", "");
    modal.innerHTML = `
      <div class="invest-modal__backdrop" data-im-close></div>
      <div class="invest-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="im-title">
        <button class="invest-modal__close" type="button" aria-label="Cerrar" data-im-close>&times;</button>
        <h2 class="invest-modal__title" id="im-title">Comienza tu inversión</h2>
        <form class="invest-form" novalidate>
          <div class="im-row im-row--2">
            ${field("name", "Nombre completo", "text", 'autocomplete="name"')}
            ${field("email", "Correo electrónico", "email", 'autocomplete="email"')}
          </div>
          <div class="im-row im-row--3">
            ${field("phone", "Teléfono", "tel", 'autocomplete="tel"')}
            ${field("age", "Edad", "number", 'min="18" max="99" inputmode="numeric"')}
            ${select("maritalStatus", "Estado civil", opts(["Soltero(a)", "Casado(a)", "Unión libre", "Divorciado(a)", "Viudo(a)"]))}
          </div>
          <div class="im-row im-row--2">
            ${field("residence", "¿En dónde radicas?")}
            ${field("franchiseKnowledge", "¿Cuentas con conocimientos en franquicias?")}
          </div>
          <div class="im-row im-row--2">
            ${field("occupation", "Ocupación")}
            ${field("cityOfInterest", "Ciudad de interés para la franquicia")}
          </div>
          <div class="im-row im-row--2">
            ${select("source", "¿En qué medio te enteraste de nosotros?", opts(["Redes sociales", "Anuncio publicitario", "Alguien me recomendó"]))}
            ${select("capital", "Capital disponible de inversión", opts(["$400,000 a $600,000", "$600,000 a $800,000", "$800,000 a +$1 millón"]))}
          </div>
          <div class="im-row im-row--2">
            ${select("timeframe", "Tiempo estimado en adquirir franquicia", opts(["Inmediatamente", "2 a 3 meses", "4 a 5 meses"]))}
            ${select("franchise", "Selecciona la franquicia de tu interés", franchiseOptions())}
          </div>
          <label class="im-check">
            <input name="privacy" type="checkbox" value="1" required />
            <span>He leído y acepto el <a href="${privacyHref}" target="_blank" rel="noopener">aviso de privacidad</a>. <span class="req">*</span></span>
          </label>
          <div class="invest-form__actions">
            <button class="btn btn--primary invest-form__submit" type="submit">Enviar solicitud</button>
          </div>
          <p class="invest-form__status" role="status" aria-live="polite"></p>
        </form>
      </div>`;
    document.body.appendChild(modal);
    return modal;
  }

  let modal = null;
  let lastFocus = null;

  function open(e) {
    if (e) e.preventDefault();
    if (!modal) {
      modal = build();
      bind(modal);
    }
    lastFocus = document.activeElement;
    document.querySelector("[data-mega-trigger]")?.classList.remove("is-open");
    modal.removeAttribute("hidden");
    requestAnimationFrame(() => modal.classList.add("is-open"));
    document.documentElement.classList.add("im-lock");
    setTimeout(() => modal.querySelector("input")?.focus({ preventScroll: true }), 250);
  }

  function close() {
    if (!modal) return;
    modal.classList.remove("is-open");
    document.documentElement.classList.remove("im-lock");
    setTimeout(() => modal.setAttribute("hidden", ""), 280);
    lastFocus?.focus?.({ preventScroll: true });
  }

  function validate(form) {
    let ok = true;
    form.querySelectorAll(".is-error").forEach((el) => el.classList.remove("is-error"));
    form.querySelectorAll("input[required], select[required]").forEach((el) => {
      let bad = el.type === "checkbox" ? !el.checked : !el.value.trim();
      if (!bad && el.type === "email") bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim());
      if (!bad && el.type === "tel") bad = el.value.replace(/\D/g, "").length < 10;
      if (bad) {
        (el.closest(".im-field") || el.closest(".im-check"))?.classList.add("is-error");
        ok = false;
      }
    });
    return ok;
  }

  async function submit(form) {
    const status = form.querySelector(".invest-form__status");
    const button = form.querySelector('[type="submit"]');
    const data = Object.fromEntries(new FormData(form).entries());
    const franchise = window.MagnoFranchiseAPI?.getById?.(data.franchise);
    const payload = {
      ...data,
      franchiseId: data.franchise,
      franchiseName: franchise?.name || data.franchise,
      privacyAccepted: true,
      source: "invest-modal",
      page: window.location.pathname,
      submittedAt: new Date().toISOString(),
    };
    const endpoint = window.MagnoConfig?.forms?.endpoint;

    button.disabled = true;
    status.className = "invest-form__status";
    status.textContent = "Enviando…";

    try {
      if (!endpoint) {
        await new Promise((r) => setTimeout(r, 700));
        console.info("[Magno inversión — listo para backend]", payload);
      } else {
        const res = await fetch(endpoint, {
          method: window.MagnoConfig.forms.method || "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Error de servidor");
      }
      status.textContent = "¡Gracias! Recibimos tu solicitud. Te contactaremos pronto.";
      status.classList.add("is-success");
      form.reset();
      form.querySelector('[name="franchise"]').innerHTML = franchiseOptions();
    } catch (err) {
      status.textContent = "No pudimos enviar tu solicitud. Intenta de nuevo o escríbenos por WhatsApp.";
      status.classList.add("is-error");
    } finally {
      button.disabled = false;
    }
  }

  function bind(m) {
    m.querySelectorAll("[data-im-close]").forEach((el) => el.addEventListener("click", close));
    const form = m.querySelector(".invest-form");
    form.addEventListener("input", (e) => {
      (e.target.closest(".im-field") || e.target.closest(".im-check"))?.classList.remove("is-error");
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validate(form)) {
        const status = form.querySelector(".invest-form__status");
        status.className = "invest-form__status is-error";
        status.textContent = "Revisa los campos marcados.";
        form.querySelector(".is-error input, .is-error select")?.focus();
        return;
      }
      submit(form);
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && !modal.hasAttribute("hidden")) close();
  });

  document.querySelectorAll(TRIGGERS).forEach((el) => el.addEventListener("click", open));
})();
