/**
 * Scroll reveal, parallax, tilt 3D, magnetic, cursor glow, carousel
 */
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    });
  });

  const revealEls = document.querySelectorAll("[data-reveal]");
  if (!reduce && "IntersectionObserver" in window) {
    const parents = new Map();
    revealEls.forEach((el) => {
      const parent = el.parentElement;
      const i = parents.get(parent) || 0;
      parents.set(parent, i + 1);
      el.style.transitionDelay = Math.min(i, 6) * 80 + "ms";
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  const hero = document.querySelector(".hero--immersive");
  const heroVideo = document.querySelector(".hero__video");
  if (heroVideo) {
    if (reduce) {
      heroVideo.pause();
      heroVideo.removeAttribute("autoplay");
    } else {
      const play = () => {
        const p = heroVideo.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
      };
      if (heroVideo.readyState >= 2) play();
      else heroVideo.addEventListener("loadeddata", play, { once: true });
    }
  }

  if (hero) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => hero.classList.add("is-ready"));
    });
  }

  const parallax = document.querySelector("[data-parallax]");
  const stage = document.querySelector("[data-tilt-stage]");
  const floaters = document.querySelectorAll("[data-depth]");
  const heroContent = document.querySelector(".hero__content--animated");

  if (!reduce) {
    let ticking = false;
    let latestY = 0;

    window.addEventListener(
      "scroll",
      () => {
        latestY = window.scrollY;
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          if (parallax && latestY < window.innerHeight * 1.2) {
            const base = parallax.dataset.mx || "0";
            const baseY = parallax.dataset.my || "0";
            parallax.style.transform = `translate3d(${base}px, ${latestY * 0.25 + Number(baseY)}px, 0) scale(1.12)`;
          }
          if (heroContent && latestY < window.innerHeight) {
            heroContent.style.transform = `translate3d(0, ${latestY * 0.12}px, 0)`;
            heroContent.style.opacity = String(Math.max(0, 1 - latestY / (window.innerHeight * 0.85)));
          }
          ticking = false;
        });
      },
      { passive: true }
    );

    if (stage) {
      stage.addEventListener("pointermove", (e) => {
        const rect = stage.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        floaters.forEach((el) => {
          const depth = Number(el.getAttribute("data-depth") || 0.2);
          el.style.translate = `${px * -55 * depth}px ${py * -40 * depth}px`;
        });
        if (parallax) {
          const mx = px * -18;
          const my = py * -12;
          parallax.dataset.mx = String(mx);
          parallax.dataset.my = String(my);
          parallax.style.translate = `${mx}px ${my}px`;
        }
        if (heroContent) {
          heroContent.style.translate = `${px * 10}px ${py * 8}px`;
        }
      });

      stage.addEventListener("pointerleave", () => {
        floaters.forEach((el) => {
          el.style.translate = "";
        });
        if (parallax) {
          parallax.style.translate = "";
          parallax.dataset.mx = "0";
          parallax.dataset.my = "0";
        }
        if (heroContent) heroContent.style.translate = "";
      });
    }
  }

  function ensureShine(card) {
    if (card.querySelector(".franchise-card__shine, .trust-card__shine, .magno-shine")) return;
    const shine = document.createElement("span");
    shine.className = "magno-shine";
    shine.setAttribute("aria-hidden", "true");
    card.appendChild(shine);
  }

  function bindTilt(selector) {
    document.querySelectorAll(selector).forEach((card) => {
      if (card.dataset.tiltBound === "1") return;
      card.dataset.tiltBound = "1";
      ensureShine(card);
      if (reduce || !finePointer) return;
      card.addEventListener("pointermove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        card.classList.add("is-tilting");
        card.style.transition = "transform 160ms ease-out";
        card.style.transform = "scale(1.02)";
        const shine = card.querySelector(".franchise-card__shine, .trust-card__shine, .magno-shine");
        if (shine) {
          shine.style.background =
            "radial-gradient(circle at " +
            x * 100 +
            "% " +
            y * 100 +
            "%, rgba(255,255,255,0.12), transparent 55%)";
          shine.style.opacity = "1";
        }
      });
      card.addEventListener("pointerleave", () => {
        card.classList.remove("is-tilting");
        card.style.transition = "transform 420ms cubic-bezier(0.22, 1, 0.36, 1)";
        card.style.transform = "";
        const shine = card.querySelector(".franchise-card__shine, .trust-card__shine, .magno-shine");
        if (shine) shine.style.opacity = "0";
      });
    });
  }

  const TILT_SELECTORS = [
    ".franchise-card[data-tilt]",
    ".trust-card[data-tilt]",
    ".feature-card",
    ".gallery-editorial__item",
    ".timeline__item",
    ".brand-panel",
    ".benefit-list__item",
  ];

  function bindAllTilt() {
    TILT_SELECTORS.forEach(bindTilt);
  }

  window.MagnoMotion = {
    bindTiltCards() {
      bindAllTilt();
    },
  };

  bindAllTilt();

  const track = document.querySelector("[data-carousel-track]");
  const prev = document.querySelector("[data-carousel-prev]");
  const next = document.querySelector("[data-carousel-next]");

  function scrollCarousel(dir) {
    if (!track) return;
    const slide = track.querySelector(".carousel__slide");
    const amount = slide ? slide.getBoundingClientRect().width + 24 : track.clientWidth * 0.8;
    track.scrollBy({ left: dir * amount, behavior: reduce ? "auto" : "smooth" });
  }

  prev?.addEventListener("click", () => scrollCarousel(-1));
  next?.addEventListener("click", () => scrollCarousel(1));

  if (!reduce) {
    document.querySelectorAll("[data-magnetic], .btn--primary, .btn--whatsapp").forEach((btn) => {
      if (btn.dataset.magneticBound === "1") return;
      btn.dataset.magneticBound = "1";
      btn.style.transition = "transform 360ms cubic-bezier(0.22, 1, 0.36, 1)";
      btn.addEventListener("mouseenter", () => {
        btn.style.transform = "scale(1.04)";
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      });
    });
  }

  if (!reduce && finePointer) {
    document.documentElement.classList.add("has-pointer");
    let glow = document.querySelector(".cursor-glow");
    if (!glow) {
      glow = document.createElement("div");
      glow.className = "cursor-glow";
      glow.setAttribute("aria-hidden", "true");
      document.body.appendChild(glow);
    }
    let gx = 0;
    let gy = 0;
    let tx = 0;
    let ty = 0;
    window.addEventListener(
      "pointermove",
      (e) => {
        gx = e.clientX;
        gy = e.clientY;
        glow.classList.add("is-on");
      },
      { passive: true }
    );
    function follow() {
      tx += (gx - tx) * 0.12;
      ty += (gy - ty) * 0.12;
      glow.style.transform = "translate3d(" + tx + "px, " + ty + "px, 0)";
      requestAnimationFrame(follow);
    }
    requestAnimationFrame(follow);
  }
})();
