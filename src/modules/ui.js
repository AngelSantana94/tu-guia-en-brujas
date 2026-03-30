// -------- Sticky Header ----------
export function initStickyHeader(){
  const header = document.querySelector('.header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('is-scrolled', window.scrollY > 50);
});
}

// -------- Toggle Menu ------------
export function initMenu(){
    const nav = document.querySelector("[data-nav]");
    const toggleBtn = document.querySelector(".header__nav__toggle");
    
    if (!nav || !toggleBtn) return;
  
    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      
      // Alternar estado activo
      const isActive = !nav.classList.contains("header__nav--active");
      
      if (isActive) {
        nav.classList.add("header__nav--active");
        toggleBtn.classList.add("is-active");
        document.body.classList.add("menu-open");
      } else {
        closeMenu();
      }
      
      toggleBtn.setAttribute("aria-expanded", isActive);
    });
  
    // Cerrar menú al hacer clic fuera
    document.addEventListener("click", (e) => {
      if (!nav.classList.contains("header__nav--active")) return;
  
      const isClickInside = nav.contains(e.target);
      if (!isClickInside) {
        closeMenu();
      }
    });
  
    // Cerrar menú al hacer clic en un enlace (móvil)
    document.querySelectorAll('.header__nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 768) {
          closeMenu();
        }
      });
    });
  
    // Cerrar menú al redimensionar (si se cambia a escritorio)
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768) {
        closeMenu();
      }
    });
  
    function closeMenu() {
      nav.classList.remove("header__nav--active");
      toggleBtn.classList.remove("is-active");
      toggleBtn.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
    }
  }
  

  // -------- Animación de las cards Tours --------
  export function initCardsAnimation() {
    // 1. Buscamos todas las cartas (Tours y Offers) a la vez
    const allCards = document.querySelectorAll(".tours__card, .offers__card");
    
    if (!allCards.length) return;

    // 2. Un solo observador para gobernarlos a todos
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // Si es una card de Tour, ponemos su clase. Si es de Offer, la suya.
                const isTour = entry.target.classList.contains("tours__card");
                const activeClass = isTour ? "tours__card--visible" : "offers__card--visible";
                
                entry.target.classList.add(activeClass);
                
                // Dejamos de observar esta carta porque ya se animó
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 }); 

    // 3. Ponemos al observador a trabajar
    allCards.forEach((card) => observer.observe(card));
}

// -------- Scroll hacia los section de la landingpage --------
export function initSmoothScroll() {
  const scrollLinks = document.querySelectorAll('[data-scroll]');
  const nav = document.querySelector("[data-nav]");
  const toggleBtn = document.querySelector(".header__nav__toggle");

  scrollLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      // 1. Obtener el destino desde el data-scroll="id"
      const targetId = link.getAttribute('data-scroll');
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        // 2. Scroll suave hasta la sección
        targetElement.scrollIntoView({ behavior: "smooth" });

        // 3. Limpieza: Si el menú móvil está abierto, lo cerramos
        if (nav && nav.classList.contains("header__nav--active")) {
          nav.classList.remove("header__nav--active");
          toggleBtn.classList.remove("is-active");
          toggleBtn.setAttribute("aria-expanded", "false");
          document.body.classList.remove("menu-open");
        }
      }
    });
  });
}
  
// -------- Redirigir a Turixe --------
export function freeTourToTurixe(){
  const botones = document.querySelectorAll('.tours__button');
  botones.forEach(boton => {
    boton.addEventListener('click', () => {
      const url = boton.dataset.url; // toma la URL del atributo data-url
      if (url) {
        window.location.href = url; // redirige al hacer click
      }
    });
  });
}

// -------- Acordión para preguntas y respuestas --------
export function initAccordionsFQ(){
  document.querySelectorAll('.faq__question').forEach(btn => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', !expanded);
  
      const answer = btn.nextElementSibling;
      answer.style.maxHeight = expanded ? '0' : answer.scrollHeight + 'px';
    });
  });
}

// -------- Acordión para recorrido --------
export function initAccordionsRQ(){
  document.querySelectorAll('.route__question').forEach(button => {
    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', !expanded);
  
      const answer = button.nextElementSibling;
  
      if (answer) { 
        if (!expanded) {
          answer.style.maxHeight = answer.scrollHeight + "px";
        } else {
          answer.style.maxHeight = 0;
        }
      }
    });
  })
}

  //Cookie Banner
export function initCookies(){
  const banner = document.getElementById("cookieBanner");
  const acceptBtn = document.getElementById("acceptCookies");
  const rejectBtn = document.getElementById("rejectCookies");
  
  // Si ya aceptó o rechazó, ocultamos el banner
  if (localStorage.getItem("cookieChoice")) {
    banner.style.display = "none";
  }
  
  // Aceptar cookies
  acceptBtn.addEventListener("click", () => {
    localStorage.setItem("cookieChoice", "accepted");
    banner.style.display = "none";
  });
  
  // Rechazar cookies
  rejectBtn.addEventListener("click", () => {
    localStorage.setItem("cookieChoice", "rejected");
    banner.style.display = "none";
  });

}

// ctafooter sticky que se despega al llegar al footer
export function initCtaFooterSticky(){
  const cta = document.getElementById('sticky-tour-cta');
  if (!cta) return; 

  const ctaOriginalOffsetTop = cta.offsetTop;

  window.addEventListener('scroll', () => {
      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY || window.pageYOffset;
        if (scrollY + window.innerHeight < ctaOriginalOffsetTop + cta.offsetHeight) {
            cta.classList.add('tour-cta--sticky');
        } else {
            cta.classList.remove('tour-cta--sticky');
        }
      });
  });
}



