import "./sass/main.scss";

import { 
    initStickyHeader,
    initMenu,
    initCardsAnimation,
    initSmoothScroll ,
    freeTourToTurixe,  
    initAccordionsFQ,
    initAccordionsRQ, 
    initCookies,
    initCtaFooterSticky,
} from './modules/ui.js';

  // Importamos el Boss, pero lo llamaremos con cuidado
  import { initGoogleReviews } from './modules/reviews.js';
  
  document.addEventListener("DOMContentLoaded", () => {
      console.log("🚀 Web cargada y lista");
  
      // --- Funciones Globales ---
        initMenu();
        initCookies();
        initCardsAnimation();
        initAccordionsRQ();
        initAccordionsFQ();
        initStickyHeader();
        initSmoothScroll();
        freeTourToTurixe();
        initCtaFooterSticky();

      // --- Carga Condicional (Optimización) ---
      // Solo activamos las reseñas si existe el contenedor en el HTML
        if (document.getElementById('reviews-swiper')) {
            initGoogleReviews();
        }
});

