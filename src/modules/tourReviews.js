// /src/modules/tourReviews.js
import { supabase } from "/src/lib/supabaseClient.js";

const REVIEWS_CONTAINER_SELECTOR = "[data-tour-reviews]";

export async function initTourReviews() {
  const containers = document.querySelectorAll(REVIEWS_CONTAINER_SELECTOR);

  if (!containers.length) return;

  containers.forEach(async (container) => {
    const tourId = container.getAttribute("data-tour-reviews");
    if (!tourId) return;

    try {
      const { data: reviews, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("tour_id", tourId)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      renderReviewsDashboard(container, reviews || []);
    } catch (err) {
      console.error("[tourReviews] Error al cargar las opiniones:", err);
    }
  });
}

function renderReviewsDashboard(container, reviews) {
  const total = reviews.length;
  const average =
    total > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(2)
      : "0.0";

  container.innerHTML = `
    <div class="space-y-6">
      <!-- Encabezado de la Sección -->
      <div>
        <h2 class="text-2xl font-bold text-base-content mb-2" data-theme="light">Opiniones</h2>
        
        <div class="flex items-center gap-2 text-sm">
          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-900 text-white font-semibold text-xs shadow-xs">
            <span>${average}</span>
            <svg class="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </span>
          <span class="text-base-content/70 font-medium text-xs sm:text-sm">(${total} opiniones)</span>
        </div>
      </div>

      <!-- Contenedor Scrollable de Reseñas -->
      <div class="max-h-[380px] overflow-y-auto pr-2 space-y-4">
        ${
          total === 0
            ? `<p class="text-base-content/50 text-sm py-4">Aún no hay opiniones escritas para este tour.</p>`
            : reviews.map((review) => renderCardReview(review)).join("")
        }
      </div>
    </div>
  `;
}

function renderCardReview(review) {
  const authorName = review.user_name || "Viajero";
  const initial = authorName.charAt(0).toUpperCase();

  const dateFormatted = new Date(review.created_at).toLocaleDateString(
    "es-ES",
    {
      month: "short",
      year: "numeric",
    },
  );

  return `
    <div class="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex flex-col gap-3">
      <!-- Cabecera: Avatar, Nombre/Reseñas y Estrellas -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-[#f6e6dc] text-[#7a4c33] font-semibold text-xl flex items-center justify-center shrink-0">
            ${initial}
          </div>
          <div class="flex flex-col">
            <span class="font-bold text-gray-800 text-base leading-snug">${authorName}</span>
            <span class="text-xs text-gray-400">1 Reseña</span>
          </div>
        </div>

        <div class="flex items-center gap-0.5">
          ${renderStars(review.rating)}
        </div>
      </div>

      <!-- Meta Info: Reserva Verificada + Fecha -->
      <div class="flex items-center gap-2 text-xs sm:text-sm">
        <span class="font-bold text-gray-700">Reserva verificada</span>
        <span class="text-gray-400">•</span>
        <span class="text-gray-500">${dateFormatted}</span>
      </div>

      <!-- Texto del comentario -->
      <p class="text-sm sm:text-base text-gray-600 leading-relaxed">${review.comment || ""}</p>
    </div>
  `;
}

function renderStars(rating) {
  let html = "";
  for (let i = 1; i <= 5; i++) {
    const active = i <= rating;
    html += `
      <svg class="w-4 h-4 ${active ? "fill-[#4a4a4a] text-[#4a4a4a]" : "fill-gray-200 text-gray-200"}" viewBox="0 0 24 24">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
      </svg>
    `;
  }
  return html;
}
