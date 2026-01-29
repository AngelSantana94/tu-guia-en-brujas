const API_KEY = 'AIzaSyCoGca6bNd2ANrjI2rAe82ph6htrhlUQXc';
const PLACE_ID = 'ChIJe5xdgU9Rw0cRk1EWx94VNnw';
const CACHE_KEY = 'tg_reviews_cache_v1';
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 ; // cada 1 día me actualiza

// 1. Carga dinámica de la librería de Maps
function loadMapsScript() {
  return new Promise((res, rej) => {
    if (window.google && google.maps && google.maps.places) return res();
    window.initReviewsCallback = () => res(); // Callback global para Google
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&callback=initReviewsCallback`;
    s.async = true;
    s.defer = true;
    s.onerror = rej;
    s.loading = 'async';
    document.head.appendChild(s);
  });
}

// 2. Helpers de Cache y Escape
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
  } catch (e) { return null; }
}

function setCached(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch (e) { }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[s]));
}

// 3. Renderizado y Swiper
function renderReviews(reviews) {
  const container = document.getElementById('reviews-container');
  if (!container) return;
  container.innerHTML = '';

  const max = Math.min(5, reviews.length);
  for (let i = 0; i < max; i++) {
    const r = reviews[i];
    const date = r.time ? new Date(r.time * 1000).toLocaleDateString() : r.relative_time_description || '';
    const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
    const photo = r.profile_photo_url || null;

    const slide = document.createElement('div');
    slide.className = 'swiper-slide';
    slide.innerHTML = `
      <article class="review-card" role="article">
        <div class="review-card__header">
          <div class="review-card__avatar">
            ${photo ? `<img src="${photo}" alt="${escapeHtml(r.author_name || 'Usuario')}">` : ''}
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
  }
}

let mySwiper = null;
function initSwiper() {
  // Swiper debe estar cargado globalmente o vía import. 
  // Si lo cargaste por CDN en el HTML, window.Swiper existirá.
  if (!window.Swiper) return console.warn("Swiper no encontrado");
  
  if (mySwiper) mySwiper.destroy(true, true);
  mySwiper = new Swiper('#reviews-swiper', {
    slidesPerView: 1,
    spaceBetween: 18,
    loop: true,
    autoplay: { delay: 4500, disableOnInteraction: false },
    navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
    pagination: { el: '.swiper-pagination', clickable: true },
    breakpoints: { 900: { slidesPerView: 2 } },
    a11y: true
  });
}

async function fetchReviewsFromPlaces() {
  await loadMapsScript();
  return new Promise((resolve, reject) => {
    try {
      const service = new google.maps.places.PlacesService(document.createElement('div'));
      service.getDetails({ placeId: PLACE_ID, fields: ['reviews'] }, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place?.reviews) {
          const reviews = place.reviews.slice().sort((a, b) => (b.time || 0) - (a.time || 0));
          resolve(reviews);
        } else {
          reject(new Error('Places API Error: ' + status));
        }
      });
    } catch (e) { reject(e); }
  });
}

// 4. FUNCIÓN EXPORTADA (El punto de entrada)
export async function initGoogleReviews() {
  // 1) Intentar desde Cache
  const cached = getCached();
  if (cached?.length) {
    renderReviews(cached);
    initSwiper();
  }

  // 2) Intentar traer datos frescos
  try {
    const reviews = await fetchReviewsFromPlaces();
    if (reviews?.length) {
      setCached(reviews);
      renderReviews(reviews);
      initSwiper();
    }
  } catch (err) {
    console.warn('Google Reviews fetch failed:', err);
  }
}