import '../sass/main.scss';

/*
import Swiper from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
*/



console.log('MAIN.JS ARRANCA');

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
/*
/////////////////////////////////
// Swiper JS opniniones de lo usuarios


const API_KEY = 'AIzaSyCoGca6bNd2ANrjI2rAe82ph6htrhlUQXc';
const PLACE_ID = 'ChIJe5xdgU9Rw0cRk1EWx94VNnw';
const CACHE_KEY = 'tg_reviews_cache_v1';
const CACHE_TTL_MS = 1000 * 60 * 60 * 6;

// ---- Google Maps loader ----
function loadMapsScript() {
  return new Promise((res, rej) => {
    if (window.google?.maps?.places) return res();

    window.initReviews = () => res();

    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&callback=initReviews`;
    s.async = true;
    s.defer = true;
    s.onerror = rej;
    document.head.appendChild(s);
  });
}

// ---- Cache helpers ----
function getCached() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

function setCached(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch {}
}

// ---- Render ----
function renderReviews(reviews) {
  const container = document.getElementById('reviews-container');
  if (!container) return;

  container.innerHTML = '';

  reviews.slice(0, 10).forEach(r => {
    const date = r.time
      ? new Date(r.time * 1000).toLocaleDateString()
      : r.relative_time_description || '';

    const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
    const photo = r.profile_photo_url || '';

    const slide = document.createElement('div');
    slide.className = 'swiper-slide';

    slide.innerHTML = `
      <article class="review-card">
        <div class="review-card__header">
          <div class="review-card__avatar">
            ${photo ? `<img src="${photo}" alt="">` : ''}
          </div>
          <div>
            <h3 class="review-card__name">${escapeHtml(r.author_name || 'Anónimo')}</h3>
            <p class="review-card__location">${date}</p>
            <div class="review-card__stars">${stars}</div>
          </div>
        </div>
        <p class="review-card__text">${escapeHtml(r.text || '')}</p>
      </article>
    `;

    container.appendChild(slide);
  });
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[s])
  );
}

// ---- Swiper ----
let swiper;
function initSwiper() {
  if (swiper) swiper.destroy(true, true);

  swiper = new Swiper('#reviews-swiper', {
    slidesPerView: 1,
    spaceBetween: 18,
    loop: true,
    autoplay: { delay: 4500 },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev'
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true
    },
    breakpoints: {
      900: { slidesPerView: 2 }
    }
  });
}

// ---- Google Places ----
async function fetchReviewsFromPlaces() {
  await loadMapsScript();

  return new Promise((resolve, reject) => {
    const service = new google.maps.places.PlacesService(document.createElement('div'));
    service.getDetails(
      { placeId: PLACE_ID, fields: ['reviews'] },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place?.reviews) {
          resolve(place.reviews.sort((a, b) => (b.time || 0) - (a.time || 0)));
        } else {
          reject(status);
        }
      }
    );
  });
}

// ---- Init ----
async function init() {

  // TEST TEMPORAL — NO BORRES EL RETURN
  renderReviews([{
    author_name: 'TEST',
    text: 'Si ves esto, el DOM y Swiper funcionan',
    rating: 5,
    time: Math.floor(Date.now() / 1000)
  }]);
  initSwiper();
  return;

  // --- código real (no se ejecuta ahora) ---
  const cached = getCached();
  if (cached?.length) {
    renderReviews(cached);
    initSwiper();
  }

  try {
    const reviews = await fetchReviewsFromPlaces();
    setCached(reviews);
    renderReviews(reviews);
    initSwiper();
  } catch (e) {
    console.warn('Places error:', e);
  }
}


document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', init)
  : init();
*/