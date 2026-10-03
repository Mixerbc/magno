/**
 * Bootstrapping: franchise cards, brand hydration, media paths
 */
(function () {
  const yearEls = document.querySelectorAll("[data-year]");
  const year = new Date().getFullYear();
  yearEls.forEach((el) => {
    el.textContent = String(year);
  });

  const prefix = document.body.dataset.pathDepth === "1" ? "../" : "";

  function asset(path) {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    return prefix + String(path).replace(/^\.\.\//, "");
  }

  function mountBrandAtmosphere(kind) {
    const hero = document.querySelector(".brand-hero");
    if (!hero || hero.querySelector(".brand-fx")) return;
    const fx = document.createElement("div");
    fx.className = "brand-fx brand-fx--" + kind;
    fx.setAttribute("aria-hidden", "true");

    if (kind === "sea") {
      fx.innerHTML =
        '<div class="brand-fx__caustics"></div>' +
        Array.from({ length: 18 }, function () {
          return '<span class="brand-fx__bubble"></span>';
        }).join("") +
        '<div class="brand-fx__waves"><span></span><span></span><span></span></div>';
      fx.querySelectorAll(".brand-fx__bubble").forEach(function (b, i) {
        b.style.left = 4 + ((i * 5.4) % 92) + "%";
        b.style.setProperty("--s", String(0.35 + (i % 6) * 0.18));
        b.style.animationDuration = 6 + (i % 7) + "s";
        b.style.animationDelay = i * 0.35 + "s";
      });
    } else if (kind === "war") {
      fx.innerHTML =
        '<div class="brand-fx__camo"></div>' +
        '<div class="brand-fx__scan"></div>' +
        '<div class="brand-fx__smoke"></div>' +
        '<div class="brand-fx__hud"></div>';
    } else if (kind === "cafe") {
      fx.innerHTML =
        '<div class="brand-fx__haze"></div>' +
        '<div class="brand-fx__steam"></div>' +
        Array.from({ length: 14 }, function () {
          return '<span class="brand-fx__mote"></span>';
        }).join("");
      fx.querySelectorAll(".brand-fx__mote").forEach(function (m, i) {
        m.style.left = 8 + ((i * 7) % 84) + "%";
        m.style.animationDuration = 10 + (i % 8) + "s";
        m.style.animationDelay = i * 0.45 + "s";
      });
    }

    hero.appendChild(fx);
  }

  function renderFranchiseCards() {
    const mount = document.querySelector("[data-franchise-cards]");
    if (!mount) return;
    if (!window.MagnoFranchiseAPI || !window.MagnoFranchiseAPI.getAll) {
      mount.innerHTML = "";
      return;
    }
    const franchises = window.MagnoFranchiseAPI.getAll();
    mount.innerHTML = franchises
      .map((f) => {
        const img = asset(f.cardPhoto || f.cardImage || f.heroImage);
        const mediaClass = f.cardPhoto ? "franchise-card__media--photo" : "franchise-card__media--food";
        return `
      <article class="concept-card" data-reveal>
        <a class="franchise-card" href="${prefix}${f.page}" data-tilt data-track="franchise-card" data-franchise="${f.id}">
          <div class="franchise-card__media ${mediaClass}">
            <span class="franchise-card__badge">${f.category}</span>
            <span class="franchise-card__shine" aria-hidden="true"></span>
            <img src="${img}" alt="${f.name}" loading="lazy" width="640" height="480" />
          </div>
          <div class="franchise-card__body">
            <h3 class="franchise-card__name">${f.shortName || f.name}</h3>
            <p class="franchise-card__desc">${f.shortDescription}</p>
            <span class="franchise-card__link">Conocer este concepto</span>
          </div>
        </a>
      </article>`;
      })
      .join("");

    mount.querySelectorAll("[data-reveal]").forEach((el, i) => {
      el.style.transitionDelay = Math.min(i, 7) * 70 + "ms";
      requestAnimationFrame(() => el.classList.add("is-visible"));
    });
    window.MagnoMotion?.bindTiltCards?.();
  }

  function bindBenefitToggles(root) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const easing = "cubic-bezier(0.22, 1, 0.36, 1)";

    root.querySelectorAll("details.benefit").forEach((details) => {
      const summary = details.querySelector("summary");
      const body = details.querySelector(".benefit__body");
      if (!summary || !body) return;
      let anim = null;

      summary.addEventListener("click", (e) => {
        e.preventDefault();
        const opening = !details.classList.contains("is-open");
        details.classList.toggle("is-open", opening);

        if (reduce) {
          details.open = opening;
          return;
        }

        const from = details.open ? body.getBoundingClientRect().height : 0;
        if (anim) anim.cancel();
        details.open = true;
        const to = opening ? body.scrollHeight : 0;

        anim = body.animate(
          [
            { height: `${from}px`, opacity: opening ? 0 : 1 },
            { height: `${to}px`, opacity: opening ? 1 : 0 },
          ],
          { duration: 420, easing }
        );
        anim.onfinish = () => {
          anim = null;
          details.open = opening;
        };
      });
    });
  }

  function hydrateBrandPage() {
    const brandId = document.body.dataset.brand;
    if (!brandId) return;
    const f = window.MagnoFranchiseAPI.getById(brandId);
    if (!f) return;

    const setText = (sel, value) => {
      document.querySelectorAll(sel).forEach((el) => {
        el.textContent = value;
      });
    };

    setText("[data-brand-name]", f.name);
    setText("[data-brand-category]", f.category);
    setText("[data-brand-description]", f.shortDescription || f.description);
    setText("[data-brand-about]", f.about || f.description);
    setText("[data-brand-concept]", f.concept);
    setText("[data-brand-experience]", f.experience);
    setText("[data-brand-model]", f.businessModel);
    setText("[data-brand-investment]", f.investmentNote);

    const story = document.querySelector("[data-brand-story]");
    if (story && f.story && f.story.length) {
      story.innerHTML = f.story
        .map(
          (block) => `
        <article class="brand-about__block">
          <h3>${block.title}</h3>
          <p>${block.text}</p>
        </article>`
        )
        .join("");
    }

    const aboutFeature = document.querySelector("[data-brand-about-feature]");
    if (aboutFeature && (f.aboutFeature || f.cardImage)) {
      aboutFeature.src = asset(f.aboutFeature || f.cardImage);
      aboutFeature.alt = f.name;
    }

    const aboutThumbs = document.querySelector("[data-brand-about-thumbs]");
    if (aboutThumbs) {
      const thumbs = (Array.isArray(f.aboutThumbs) ? f.aboutThumbs : [f.cardImage, f.heroImage]).filter(Boolean);
      aboutThumbs.hidden = thumbs.length === 0;
      aboutThumbs.innerHTML = thumbs
        .slice(0, 2)
        .map(
          (src, i) =>
            `<span class="brand-about__thumb" style="--thumb-img: url('${asset(src)}')"><img src="${asset(src)}" alt="${f.name} — producto ${i + 1}" /></span>`
        )
        .join("");
    }

    document.body.classList.toggle("brand-page--light", f.theme === "light");
    document.body.classList.toggle("brand-page--dark", f.theme !== "light");
    document.body.classList.toggle("brand-hero--photo", f.imageFit === "cover" && !f.atmosphere && !f.heroVideo);
    document.body.classList.toggle("brand-hero--video", Boolean(f.heroVideo));

    const heroImg = document.querySelector("[data-brand-hero-img]");
    const product = document.querySelector("[data-brand-product]");
    const heroMedia = document.querySelector(".brand-hero .hero__media");

    if (f.heroVideo && heroMedia) {
      if (heroImg) {
        heroImg.removeAttribute("src");
        heroImg.classList.add("is-empty");
        heroImg.alt = "";
      }
      if (product) product.remove();
      let video = heroMedia.querySelector("[data-brand-hero-video]");
      if (!video) {
        video = document.createElement("video");
        video.setAttribute("data-brand-hero-video", "");
        video.className = "hero__video";
        video.autoplay = true;
        video.muted = true;
        video.defaultMuted = true;
        video.loop = true;
        video.playsInline = true;
        video.setAttribute("playsinline", "");
        video.setAttribute("muted", "");
        video.preload = "metadata";
        video.setAttribute("aria-hidden", "true");
        heroMedia.appendChild(video);
      }
      if (f.heroImage) video.poster = asset(f.heroImage);
      video.src = asset(f.heroVideo);
      const play = video.play();
      if (play && typeof play.catch === "function") play.catch(function () {});
    } else if (f.atmosphere) {
      if (heroImg) {
        heroImg.removeAttribute("src");
        heroImg.classList.add("is-empty");
        heroImg.alt = "";
      }
      if (product) {
        product.src = asset(f.cardImage || f.heroImage);
        product.alt = f.name;
      }
      mountBrandAtmosphere(f.atmosphere);
    } else if (heroImg && f.heroImage) {
      if (f.imageFit === "cover") {
        heroImg.src = asset(f.heroImage);
        heroImg.alt = f.name;
        heroImg.classList.remove("is-empty");
        if (product) product.remove();
      } else {
        heroImg.src = asset("assets/images/hero/foto-inicio.png");
        heroImg.alt = `${f.name} — ambiente Magno`;
        if (product) {
          product.src = asset(f.heroImage);
          product.alt = `${f.name} — producto`;
        }
      }
    } else if (product && f.heroImage) {
      product.src = asset(f.heroImage);
      product.alt = `${f.name} — producto`;
    }

    const benefits = document.querySelector("[data-brand-benefits]");
    if (benefits) {
      benefits.innerHTML = f.benefits
        .map((b) => {
          const title = typeof b === "string" ? b : b.title;
          const text = typeof b === "string" ? "" : b.text;
          if (!text) {
            return `
        <li class="benefit-list__item">
          <span class="benefit-list__icon" aria-hidden="true">+</span>
          <div>
            <p class="benefit-list__title">${title}</p>
          </div>
        </li>`;
          }
          return `
        <li class="benefit-list__item benefit-list__item--toggle">
          <details class="benefit">
            <summary class="benefit__summary">
              <span class="benefit-list__icon" aria-hidden="true">+</span>
              <span class="benefit-list__title">${title}</span>
            </summary>
            <div class="benefit__body"><p class="benefit-list__text">${text}</p></div>
          </details>
        </li>`;
        })
        .join("");
      bindBenefitToggles(benefits);
    }

    const gallery = document.querySelector("[data-brand-gallery]");
    if (gallery) {
      const images = (f.gallery && f.gallery.length ? f.gallery : [f.cardImage || f.heroImage]).filter(Boolean);
      gallery.innerHTML = images
        .map(
          (src, i) => `
        <figure class="gallery-editorial__item is-visible" style="--gallery-img: url('${asset(src)}')">
          <img src="${asset(src)}" alt="${f.name} — imagen ${i + 1}" loading="lazy" width="800" height="600" />
          <figcaption class="gallery-editorial__caption">${f.shortName}</figcaption>
        </figure>`
        )
        .join("");
    }

    const galleryLead = document.querySelector("[data-gallery-lead]");
    if (galleryLead) {
      galleryLead.textContent = "Imágenes oficiales de " + f.shortName + ".";
    }
  }

  /* Mega menu thumbs with real images */
  const megaGrid = document.querySelector("[data-mega-grid]");
  if (megaGrid && window.MagnoFranchiseAPI) {
    // navigation.js already populates; enhance after a tick if empty thumbs
    setTimeout(() => {
      megaGrid.querySelectorAll(".mega-menu__item").forEach((item) => {
        const id = item.getAttribute("data-franchise");
        const f = window.MagnoFranchiseAPI.getById(id);
        if (!f) return;
        const thumb = item.querySelector(".mega-menu__thumb");
        if (thumb && thumb.tagName !== "IMG") {
          const img = document.createElement("img");
          img.className = "mega-menu__thumb";
          img.src = asset(f.logo || f.cardImage || f.heroImage);
          img.alt = f.name;
          img.loading = "lazy";
          thumb.replaceWith(img);
        }
      });
    }, 0);
  }

  renderFranchiseCards();
  hydrateBrandPage();
  renderHeroSpotlight();
  renderLogoMarquee();
  initInvestFlow();

  function renderHeroSpotlight() {
    const root = document.querySelector("[data-hero-stage]");
    if (!root) return;
    if (!window.MagnoFranchiseAPI || !window.MagnoFranchiseAPI.getAll) return;

    const franchises = window.MagnoFranchiseAPI.getAll().slice(0, 8);
    if (!franchises.length) return;

    const depth = document.body.dataset.pathDepth === "1" ? "../" : "";
    const feature = root.querySelector("[data-stage-feature]");
    const img = root.querySelector("[data-stage-image]");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function foodPath(f) {
      return depth + String(f.cardImage || f.heroImage || "").replace(/^\.\.\//, "");
    }

    var index = 0;
    var timer = null;

    function show(i) {
      index = (i + franchises.length) % franchises.length;
      var f = franchises[index];
      var nextSrc = foodPath(f);

      feature.setAttribute("href", depth + f.page);
      feature.setAttribute("data-franchise", f.id);
      feature.setAttribute("aria-label", "Conocer " + f.name);

      if (reduce) {
        img.src = nextSrc;
        img.alt = f.name;
        return;
      }

      feature.classList.add("is-switching");
      window.setTimeout(function () {
        img.src = nextSrc;
        img.alt = f.name;
        feature.classList.remove("is-switching");
      }, 520);
    }

    function restart() {
      if (reduce) return;
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 4200);
    }

    root.addEventListener("pointerenter", function () {
      window.clearInterval(timer);
    });
    root.addEventListener("pointerleave", restart);

    show(0);
    restart();
  }

  function renderLogoMarquee() {
    const track = document.querySelector("[data-logo-marquee]");
    if (!track) return;
    if (!window.MagnoFranchiseAPI || !window.MagnoFranchiseAPI.getAll) return;

    const franchises = window.MagnoFranchiseAPI.getAll();
    const depth = document.body.dataset.pathDepth === "1" ? "../" : "";

    function itemHtml(f) {
      var logo = depth + String(f.logo || "").replace(/^\.\.\//, "");
      var href = depth + f.page;
      return (
        '<a class="logo-marquee__item" href="' +
        href +
        '" data-track="logo-marquee" data-franchise="' +
        f.id +
        '" aria-label="' +
        f.name +
        '">' +
        '<img src="' +
        logo +
        '" alt="' +
        f.name +
        '" width="168" height="84" decoding="async" />' +
        "</a>"
      );
    }

    var set = franchises.map(itemHtml).join("");
    track.innerHTML = set + set + set;
  }

  function initInvestFlow() {
    const root = document.querySelector("[data-invest-flow]");
    if (!root) return;

    const steps = [
      {
        label: "Ficha",
        title: "Conoce el modelo",
        text: "Empieza por entender cómo opera Franquicias Magno: las 8 marcas, el tipo de concepto y el acompañamiento. Aquí no hay cifras inventadas: los montos oficiales se entregan en la ficha y en la COF.",
        you: "Exploras las marcas y eliges el concepto que más te interesa.",
        magno: "Te damos contexto claro del sistema de franquicias y del proceso.",
      },
      {
        label: "Solicitud",
        title: "Envía tu pre-solicitud",
        text: "Completas el formulario de este sitio (nombre, contacto y franquicia de interés). Es el primer filtro formal y toma pocos minutos.",
        you: "Llenas el formulario de contacto con datos reales y el concepto que te llama.",
        magno: "Recibimos tu interés y preparamos la revisión interna.",
      },
      {
        label: "Revisión",
        title: "Análisis confidencial",
        text: "El equipo directivo revisa tu información con absoluta confidencialidad para ver si hay coincidencia de perfil, ubicación e interés.",
        you: "Esperas el contacto. No necesitas enviar documentos extra en este paso.",
        magno: "Analizamos tu pre-solicitud y definimos si avanzamos al siguiente paso.",
      },
      {
        label: "COF",
        title: "Recibe la información oficial",
        text: "Si hay match, te enviamos la Circular de Oferta de Franquicia (COF): el documento con el detalle del proyecto para que tomes una decisión informada.",
        you: "Revisas la COF con calma y anotas dudas.",
        magno: "Entregamos la información oficial del modelo y condiciones.",
      },
      {
        label: "Entrevista",
        title: "Nos conocemos",
        text: "Agendamos una entrevista para aclarar dudas de la COF, platicar tu plaza y confirmar que el concepto encaja contigo.",
        you: "Asistes a la entrevista (presencial o remota) con tus preguntas.",
        magno: "Resolvemos dudas y evaluamos juntos el siguiente paso.",
      },
      {
        label: "Contrato",
        title: "Firma e inicio",
        text: "Si ambas partes estamos de acuerdo, se firma el contrato y arranca tu proyecto de franquicia con el acompañamiento Magno.",
        you: "Confirmas la decisión y firmas cuando estés listo.",
        magno: "Formalizamos el acuerdo y te guiamos en el arranque.",
      },
    ];

    const list = root.querySelector(".invest-flow__steps");
    const kicker = root.querySelector("[data-invest-kicker]");
    const title = root.querySelector("[data-invest-title]");
    const text = root.querySelector("[data-invest-text]");
    const you = root.querySelector("[data-invest-you]");
    const magno = root.querySelector("[data-invest-magno]");
    const prev = root.querySelector("[data-invest-prev]");
    const next = root.querySelector("[data-invest-next]");
    let index = 0;

    list.innerHTML = steps
      .map(function (s, i) {
        return (
          '<button type="button" class="invest-flow__step" role="tab" data-invest-step="' +
          i +
          '" aria-selected="false">' +
          '<span class="invest-flow__num">' +
          String(i + 1).padStart(2, "0") +
          "</span>" +
          '<span class="invest-flow__name">' +
          s.label +
          "</span>" +
          "</button>"
        );
      })
      .join("");

    function show(i) {
      index = Math.max(0, Math.min(steps.length - 1, i));
      const s = steps[index];
      kicker.textContent = "Paso " + (index + 1) + " de " + steps.length;
      title.textContent = s.title;
      text.textContent = s.text;
      you.textContent = s.you;
      magno.textContent = s.magno;
      prev.disabled = index === 0;
      next.textContent = index === steps.length - 1 ? "Ir al formulario" : "Siguiente paso";
      list.querySelectorAll(".invest-flow__step").forEach(function (btn, bi) {
        const on = bi === index;
        btn.classList.toggle("is-active", on);
        btn.classList.toggle("is-done", bi < index);
        btn.setAttribute("aria-selected", on ? "true" : "false");
      });
    }

    list.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-invest-step]");
      if (!btn) return;
      show(Number(btn.getAttribute("data-invest-step")));
    });

    prev.addEventListener("click", function () {
      show(index - 1);
    });

    next.addEventListener("click", function () {
      if (index === steps.length - 1) {
        const form = document.querySelector("#contacto");
        if (form) form.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      show(index + 1);
    });

    show(0);
  }
})();
