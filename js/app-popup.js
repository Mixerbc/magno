/**
 * Popup "Descarga nuestra app" — manda a App Store o Google Play según el teléfono
 */
(function () {
  const cfg = window.MagnoConfig?.app || {};
  const SEEN_KEY = "magno-app-popup-seen";
  if (sessionStorage.getItem(SEEN_KEY)) return;

  const ua = navigator.userAgent || "";
  const isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  const prefix = /\/franquicias\//.test(window.location.pathname) ? "../" : "";

  const APPLE =
    '<svg viewBox="0 0 384 512" aria-hidden="true"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>';
  const PLAY =
    '<svg viewBox="0 0 512 512" aria-hidden="true"><path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/></svg>';

  const storeBtn = (url, icon, small, big) =>
    `<a class="app-popup__store" href="${url || "#"}" target="_blank" rel="noopener" data-track="app-download">
      ${icon}<span><small>${small}</small>${big}</span>
    </a>`;

  let buttons;
  if (isIOS) buttons = storeBtn(cfg.iosUrl, APPLE, "Descárgala en", "App Store");
  else if (isAndroid) buttons = storeBtn(cfg.androidUrl, PLAY, "Disponible en", "Google Play");
  else
    buttons =
      storeBtn(cfg.iosUrl, APPLE, "Descárgala en", "App Store") +
      storeBtn(cfg.androidUrl, PLAY, "Disponible en", "Google Play");

  function close(modal) {
    modal.classList.remove("is-open");
    document.removeEventListener("keydown", onKey);
    setTimeout(() => modal.remove(), 300);
  }

  function onKey(e) {
    if (e.key === "Escape") close(document.querySelector(".app-popup"));
  }

  function show() {
    if (document.querySelector(".invest-modal.is-open")) {
      setTimeout(show, 4000);
      return;
    }
    sessionStorage.setItem(SEEN_KEY, "1");
    const modal = document.createElement("div");
    modal.className = "app-popup";
    modal.innerHTML = `
      <div class="app-popup__backdrop" data-app-close></div>
      <div class="app-popup__dialog" role="dialog" aria-modal="true" aria-labelledby="app-popup-title">
        <button class="app-popup__close" type="button" aria-label="Cerrar" data-app-close>&times;</button>
        <img class="app-popup__logo" src="${prefix}assets/logos/magno-logo.png" alt="Franquicias Magno" width="180" height="33" />
        <h2 class="app-popup__title" id="app-popup-title">Descarga nuestra app</h2>
        <p class="app-popup__text">Recibe promociones y beneficios exclusivos de todas nuestras marcas directo en tu teléfono.</p>
        <div class="app-popup__stores">${buttons}</div>
        <button class="app-popup__later" type="button" data-app-close>Ahora no</button>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelectorAll("[data-app-close]").forEach((el) => el.addEventListener("click", () => close(modal)));
    modal.querySelectorAll(".app-popup__store").forEach((a) =>
      a.addEventListener("click", (e) => {
        if (a.getAttribute("href") === "#") e.preventDefault();
        else close(modal);
      })
    );
    document.addEventListener("keydown", onKey);
    requestAnimationFrame(() => modal.classList.add("is-open"));
  }

  setTimeout(show, cfg.popupDelayMs ?? 6000);
})();
