// ============================================
// MEGA MENÚ (Nuestros tours / Información / Contáctanos)
// Escritorio: hover + click sobre [data-mega-item].
// Móvil: "Nuestros tours" usa el drawer "mobile-tours" (ver initDrawers
// en main.js); Información/Contáctanos usan <details> nativos, sin JS.
// Las categorías (data-mega-categories / data-mega-cat-panel) se
// reutilizan igual en el panel de escritorio y en el drawer móvil.
// ============================================

const MD_BREAKPOINT = 768;
const isDesktop = () => window.innerWidth >= MD_BREAKPOINT;

export function initMegaMenu() {
  initDesktopPanels();
  initCategorySwitcher();
}

function initDesktopPanels() {
  const items = document.querySelectorAll("[data-mega-item]");
  if (!items.length) return;

  let closeTimeout = null;

  const getPanel = (item) => item.querySelector("[data-mega-panel]");
  const getTrigger = (item) => item.querySelector("[data-mega-trigger]");

  const openPanel = (item) => {
    closeAllExcept(item);
    const panel = getPanel(item);
    const trigger = getTrigger(item);
    if (!panel || !trigger) return;

    panel.classList.remove(
      "opacity-0",
      "invisible",
      "translate-y-2",
      "pointer-events-none",
    );
    panel.classList.add("opacity-100", "visible", "translate-y-0");
    trigger.setAttribute("aria-expanded", "true");
    item.setAttribute("data-mega-open", "true");
  };

  const closePanel = (item) => {
    const panel = getPanel(item);
    const trigger = getTrigger(item);
    if (!panel || !trigger) return;

    panel.classList.add(
      "opacity-0",
      "invisible",
      "translate-y-2",
      "pointer-events-none",
    );
    panel.classList.remove("opacity-100", "visible", "translate-y-0");
    trigger.setAttribute("aria-expanded", "false");
    item.removeAttribute("data-mega-open");
  };

  const closeAllExcept = (except) => {
    items.forEach((item) => item !== except && closePanel(item));
  };

  const closeAll = () => items.forEach(closePanel);

  items.forEach((item) => {
    const trigger = getTrigger(item);
    if (!trigger) return;

    item.addEventListener("mouseenter", () => {
      if (!isDesktop()) return;
      clearTimeout(closeTimeout);
      openPanel(item);
    });

    item.addEventListener("mouseleave", () => {
      if (!isDesktop()) return;
      closeTimeout = setTimeout(() => closePanel(item), 150);
    });

    trigger.addEventListener("click", (e) => {
      if (!isDesktop()) return;
      e.preventDefault();
      const isOpen = item.hasAttribute("data-mega-open");
      isOpen ? closePanel(item) : openPanel(item);
    });
  });

  document.addEventListener("click", (e) => {
    if (!isDesktop()) return;
    if (!e.target.closest("[data-mega-item]")) closeAll();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll();
  });

  window.addEventListener("resize", () => {
    if (!isDesktop()) closeAll();
  });
}

function initCategorySwitcher() {
  document.querySelectorAll("[data-mega-categories]").forEach((catList) => {
    const container = catList.closest("[data-mega-body]");
    if (!container) return;

    const buttons = catList.querySelectorAll("[data-mega-cat]");
    const panels = container.querySelectorAll("[data-mega-cat-panel]");

    const activate = (catId) => {
      buttons.forEach((btn) => {
        const active = btn.getAttribute("data-mega-cat") === catId;
        btn.classList.toggle("bg-white", active);
        btn.classList.toggle("shadow-sm", active);
        btn.classList.toggle("text-[#8a3cb8]", active);
        btn.classList.toggle("text-gray-600", !active);
        btn.setAttribute("aria-selected", active ? "true" : "false");
      });
      panels.forEach((panel) => {
        panel.classList.toggle(
          "hidden",
          panel.getAttribute("data-mega-cat-panel") !== catId,
        );
      });
    };

    const firstButton = buttons[0];
    if (firstButton) {
      activate(firstButton.getAttribute("data-mega-cat"));
    }

    buttons.forEach((btn) => {
      const catId = btn.getAttribute("data-mega-cat");
      btn.addEventListener("click", () => activate(catId));
      btn.addEventListener("mouseenter", () => {
        if (isDesktop()) activate(catId);
      });
    });
  });
}
