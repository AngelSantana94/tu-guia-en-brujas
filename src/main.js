import '../sass/main.scss';

import Swiper from 'https://unpkg.com/swiper@9/swiper-bundle.esm.browser.min.js';

// -------- Sticky Header ----------
window.addEventListener('scroll', () => {
  const header = document.querySelector('.header');
  if (!header) return;
  header.classList.toggle('is-scrolled', window.scrollY > 10);
});


// -------- Toggle Menu ------------
document.addEventListener("DOMContentLoaded", () => {
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
});

// Animación de las cards Tours
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".tours__card");

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("tours__card--visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.25,
    }
  );

  cards.forEach(card => observer.observe(card));
});

// Selecciona todos los botones con la clase
const botones = document.querySelectorAll('.tours__button');

botones.forEach(boton => {
  boton.addEventListener('click', () => {
    const url = boton.dataset.url; // toma la URL del atributo data-url
    if (url) {
      window.location.href = url; // redirige al hacer click
    }
  });
});

document.querySelectorAll('.faq__question').forEach(btn => {
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', !expanded);

    const answer = btn.nextElementSibling;
    answer.style.maxHeight = expanded ? '0' : answer.scrollHeight + 'px';
  });
});

//Cookie Banner
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


  document.querySelectorAll('.route__question').forEach(button => {
    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', !expanded);

      const answer = button.nextElementSibling;

      if (!expanded) {
        answer.style.maxHeight = answer.scrollHeight + "px";
      } else {
        answer.style.maxHeight = 0;
      }
    });
  });


// Animación de las cards Offers
const offerCards = document.querySelectorAll('.offers__card');

function handleIntersection(entries, observer) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('offers__card--visible');
            observer.unobserve(entry.target);
        }
    });
}

const observer = new IntersectionObserver(handleIntersection, {
    root: null, // viewport
    threshold: 0.2 // 20% visible
});

offerCards.forEach(card => {
    // Observa cada tarjeta para disparar la animación al entrar en viewport
    observer.observe(card); 
});

// ctafooter sticky que se despega al llegar al footer
document.addEventListener('DOMContentLoaded', () => {
  const cta = document.getElementById('sticky-tour-cta');

  // Guardamos la posición original del CTA respecto al documento
  const ctaOriginalOffsetTop = cta.offsetTop;

  window.addEventListener('scroll', () => {
      const scrollY = window.scrollY || window.pageYOffset;

      if (scrollY + window.innerHeight < ctaOriginalOffsetTop + cta.offsetHeight) {
          // Todavía no llegó a su posición original -> sticky
          cta.classList.add('tour-cta--sticky');
      } else {
          // Llegó a su posición natural -> quitar sticky
          cta.classList.remove('tour-cta--sticky');
      }
  });
});















