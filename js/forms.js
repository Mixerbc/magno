/**
 * Lead forms — validation, states, WhatsApp, endpoint ready for backend
 */
(function () {
  function fillFranchiseSelects() {
    const franchises = window.MagnoFranchiseAPI?.getAll?.() || [];
    document.querySelectorAll("[data-franchise-select]").forEach((select) => {
      const current = select.getAttribute("data-selected") || select.dataset.selected || "";
      const pageBrand = document.body.dataset.brand || "";
      const preferred = current || pageBrand;

      const options = [
        `<option value="">Selecciona una franquicia</option>`,
        ...franchises.map(
          (f) =>
            `<option value="${f.id}" ${f.id === preferred || f.slug === preferred ? "selected" : ""}>${f.name}</option>`
        ),
      ];
      select.innerHTML = options.join("");
    });
  }

  function wireWhatsApp() {
    const brandId = document.body.dataset.brand;
    const franchise = brandId ? window.MagnoFranchiseAPI?.getById?.(brandId) : null;
    const name = franchise?.name || null;
    const url = window.MagnoConfig?.whatsapp.getUrl(name);

    document.querySelectorAll("[data-whatsapp]").forEach((el) => {
      const override = el.getAttribute("data-franchise-name");
      el.setAttribute("href", window.MagnoConfig.whatsapp.getUrl(override || name));
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer");
      el.setAttribute("data-track", "whatsapp-click");
      if (franchise) el.setAttribute("data-franchise", franchise.id);
    });

    return url;
  }

  function showFieldError(field, message) {
    const wrap = field.closest(".form-field") || field.closest(".form-check");
    if (!wrap) return;
    wrap.classList.add("is-error");
    const err = wrap.querySelector(".form-field__error");
    if (err && message) err.textContent = message;
  }

  function clearErrors(form) {
    form.querySelectorAll(".is-error").forEach((el) => el.classList.remove("is-error"));
  }

  function validate(form) {
    clearErrors(form);
    let ok = true;
    const name = form.querySelector('[name="name"]');
    const email = form.querySelector('[name="email"]');
    const phone = form.querySelector('[name="phone"]');
    const franchise = form.querySelector('[name="franchise"]');
    const message = form.querySelector('[name="message"]');
    const privacy = form.querySelector('[name="privacy"]');

    if (!name?.value.trim() || name.value.trim().length < 2) {
      showFieldError(name, "Ingresa tu nombre completo.");
      ok = false;
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email?.value.trim() || "");
    if (!emailOk) {
      showFieldError(email, "Ingresa un correo válido.");
      ok = false;
    }

    const phoneDigits = (phone?.value || "").replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      showFieldError(phone, "Ingresa un teléfono a 10 dígitos o más.");
      ok = false;
    }

    if (!franchise?.value) {
      showFieldError(franchise, "Selecciona una franquicia.");
      ok = false;
    }

    if (message && message.hasAttribute("required") && !message.value.trim()) {
      showFieldError(message, "Cuéntanos brevemente tu interés.");
      ok = false;
    }

    if (!privacy?.checked) {
      showFieldError(privacy, "Debes aceptar el aviso de privacidad.");
      ok = false;
    }

    return ok;
  }

  function getPayload(form) {
    const data = new FormData(form);
    const franchiseId = data.get("franchise");
    const franchise = window.MagnoFranchiseAPI?.getById?.(franchiseId);
    return {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      franchiseId,
      franchiseName: franchise?.name || franchiseId,
      message: String(data.get("message") || "").trim(),
      privacyAccepted: true,
      source: form.getAttribute("data-form-source") || "website",
      page: window.location.pathname,
      submittedAt: new Date().toISOString(),
    };
  }

  async function submitForm(form) {
    const status = form.querySelector("[data-form-status]");
    const button = form.querySelector('[type="submit"]');
    const payload = getPayload(form);
    const endpoint = window.MagnoConfig?.forms?.endpoint;
    const method = window.MagnoConfig?.forms?.method || "POST";

    button?.classList.add("is-loading");
    if (button) button.disabled = true;
    if (status) {
      status.textContent = "Enviando…";
      status.classList.remove("is-success", "is-error");
    }

    /* Tracking attrs ready for Analytics */
    form.setAttribute("data-track-submit", "lead-form");
    form.setAttribute("data-franchise", payload.franchiseId);

    try {
      if (!endpoint) {
        /* Simulación local hasta conectar backend */
        await new Promise((r) => setTimeout(r, 700));
        console.info("[Magno lead — listo para backend]", payload);
        if (status) {
          status.textContent =
            "Solicitud registrada (modo demo). Conecta el endpoint en js/config.js para envío real.";
          status.classList.add("is-success");
        }
        form.reset();
        fillFranchiseSelects();
        return;
      }

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error de servidor");

      if (status) {
        status.textContent = "Gracias. Hemos recibido tu solicitud. Te contactaremos pronto.";
        status.classList.add("is-success");
      }
      form.reset();
      fillFranchiseSelects();
    } catch (err) {
      if (status) {
        status.textContent = "No pudimos enviar tu solicitud. Intenta de nuevo o escríbenos por WhatsApp.";
        status.classList.add("is-error");
      }
    } finally {
      button?.classList.remove("is-loading");
      if (button) button.disabled = false;
    }
  }

  document.querySelectorAll("[data-lead-form]").forEach((form) => {
    form.setAttribute("novalidate", "true");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validate(form)) {
        const status = form.querySelector("[data-form-status]");
        if (status) {
          status.textContent = "Revisa los campos marcados.";
          status.classList.add("is-error");
        }
        return;
      }
      submitForm(form);
    });
  });

  fillFranchiseSelects();
  wireWhatsApp();

  /* Contact info hydration */
  const cfg = window.MagnoConfig;
  if (cfg) {
    document.querySelectorAll("[data-contact-phone]").forEach((el) => {
      el.textContent = cfg.phoneDisplay;
      if (el.tagName === "A") el.href = `tel:+${cfg.phoneE164}`;
    });
    document.querySelectorAll("[data-contact-email]").forEach((el) => {
      el.textContent = cfg.email;
      if (el.tagName === "A") el.href = `mailto:${cfg.email}`;
    });
    document.querySelectorAll("[data-contact-address]").forEach((el) => {
      el.textContent = cfg.address;
    });
  }
})();
