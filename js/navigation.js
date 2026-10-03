/**
 * Header, mega-menu, mobile nav
 */
(function () {
  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  const megaItem = document.querySelector("[data-mega-trigger]");
  const megaButton = megaItem?.querySelector(".site-nav__link");
  let megaCloseTimer = 0;

  function setHeaderState() {
    if (!header) return;
    const solid = header.hasAttribute("data-header-solid");
    if (solid || window.scrollY > 40) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }

  function closeMobile() {
    if (!toggle || !mobileNav) return;
    toggle.setAttribute("aria-expanded", "false");
    mobileNav.classList.remove("is-open");
    header?.classList.remove("is-open");
    document.body.classList.remove("nav-locked");
  }

  function openMobile() {
    if (!toggle || !mobileNav) return;
    toggle.setAttribute("aria-expanded", "true");
    mobileNav.classList.add("is-open");
    header?.classList.add("is-open");
    document.body.classList.add("nav-locked");
  }

  function closeMega() {
    if (!megaItem || !megaButton) return;
    window.clearTimeout(megaCloseTimer);
    megaItem.classList.remove("is-open");
    megaButton.setAttribute("aria-expanded", "false");
  }

  function scheduleCloseMega() {
    window.clearTimeout(megaCloseTimer);
    megaCloseTimer = window.setTimeout(closeMega, 220);
  }

  function openMega() {
    if (!megaItem || !megaButton) return;
    window.clearTimeout(megaCloseTimer);
    megaItem.classList.add("is-open");
    megaButton.setAttribute("aria-expanded", "true");
  }

  window.addEventListener("scroll", setHeaderState, { passive: true });
  setHeaderState();

  toggle?.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    if (expanded) closeMobile();
    else openMobile();
  });

  mobileNav?.querySelectorAll("[data-mobile-submenu-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".mobile-nav__item");
      item?.classList.toggle("is-open");
      const open = item?.classList.contains("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  mobileNav?.querySelectorAll("a[href]").forEach((link) => {
    link.addEventListener("click", () => closeMobile());
  });

  if (megaButton && megaItem) {
    megaButton.addEventListener("click", (e) => {
      e.preventDefault();
      const open = megaItem.classList.contains("is-open");
      if (open) closeMega();
      else openMega();
    });

    megaItem.addEventListener("mouseenter", openMega);
    megaItem.addEventListener("mouseleave", scheduleCloseMega);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMobile();
      closeMega();
    }
  });

  document.addEventListener("click", (e) => {
    if (megaItem && !megaItem.contains(e.target)) closeMega();
  });

  /* Populate mega menu + mobile franchise links */
  function pathPrefix() {
    const depth = document.body.dataset.pathDepth;
    return depth === "1" ? "../" : "";
  }

  function populateMenus() {
    const franchises = window.MagnoFranchiseAPI?.getAll?.() || [];
    const prefix = pathPrefix();
    const megaGrid = document.querySelector("[data-mega-grid]");
    const mobileSub = document.querySelector("[data-mobile-franchises]");

    if (megaGrid) {
      megaGrid.innerHTML = franchises
        .map((f) => {
          const href = prefix + f.page;
          const img = prefix + String(f.logo || f.cardImage || f.heroImage || "").replace(/^\.\.\//, "");
          return `
          <a class="mega-menu__item" href="${href}" data-track="mega-franchise" data-franchise="${f.id}">
            <img class="mega-menu__thumb" src="${img}" alt="${f.name}" width="88" height="56" />
            <div>
              <p class="mega-menu__cat">${f.category}</p>
              <p class="mega-menu__name">${f.shortName || f.name}</p>
            </div>
          </a>`;
        })
        .join("");
    }

    if (mobileSub) {
      mobileSub.innerHTML = franchises
        .map(
          (f) =>
            `<a class="mobile-nav__sub-link" href="${prefix + f.page}" data-track="mobile-franchise" data-franchise="${f.id}">
              <img src="${prefix + String(f.logo || "").replace(/^\.\.\//, "")}" alt="" width="36" height="24" />
              ${f.name}
            </a>`
        )
        .join("");
    }
  }

  populateMenus();
})();
