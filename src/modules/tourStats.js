// /src/modules/tourStats.js
import { supabase } from "../lib/supabaseClient";

/**
 * Módulo para calcular las estadísticas de opiniones (media y total)
 * de los tours. Se ejecuta una sola vez para poblar los contenedores HTML.
 */

const STATS_CONTAINERS_SELECTOR = "[data-tour-stats]";

/**
 * Función principal que busca contenedores de estadísticas,
 * consulta la API y renderiza los resultados.
 */
export async function initTourStats() {
  const containers = document.querySelectorAll(STATS_CONTAINERS_SELECTOR);

  if (!containers.length) {
    return;
  }

  // Obtenemos los IDs únicos de los contenedores para hacer una sola consulta
  const tourIds = [...containers].map((c) => c.getAttribute("data-tour-stats"));

  try {
    const { data: reviews, error } = await supabase
      .from("reviews")
      .select("tour_id, rating")
      .in("tour_id", tourIds)
      .eq("is_approved", true);

    if (error) throw error;

    // Agrupamos las reviews por tour_id y calculamos las estadísticas
    const statsByTour = calculateStatsByTour(reviews);

    // Renderizamos las estadísticas en cada contenedor correspondiente
    containers.forEach((container) => {
      const tourId = container.getAttribute("data-tour-stats");
      const stats = statsByTour[tourId] || { average: 0, total: 0 };
      renderStats(container, stats);
    });
  } catch (error) {
    console.error("Error al obtener estadísticas de tour:", error);
  }
}

/**
 * Agrupa las reviews por tour_id y calcula la media y el total para cada tour.
 * @param {Array} reviews - Lista de opiniones obtenidas de la base de datos.
 * @returns {Object} - Objeto donde las claves son tour_id y los valores son objetos { average, total }.
 */
function calculateStatsByTour(reviews) {
  return reviews.reduce((acc, review) => {
    const { tour_id, rating } = review;
    if (!acc[tour_id]) {
      acc[tour_id] = { sum: 0, total: 0 };
    }
    acc[tour_id].sum += rating;
    acc[tour_id].total += 1;
    acc[tour_id].average = parseFloat(
      (acc[tour_id].sum / acc[tour_id].total).toFixed(2),
    );
    return acc;
  }, {});
}

/**
 * Renderiza la píldora oscura con el promedio y el total de opiniones.
 * @param {HTMLElement} container - El elemento contenedor HTML.
 * @param {Object} stats - Objeto con las estadísticas calculadas { average, total }.
 */
function renderStats(container, stats) {
  const { average, total } = stats;

  container.innerHTML = `
    <div class="inline-flex items-center gap-2 text-sm" data-theme="light">
      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-900 text-white font-semibold text-xs shadow-xs">
        <span>${average}</span>
        <svg class="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      </span>
      <span class="text-base-content/70 font-medium text-xs sm:text-sm">(${total} opiniones)</span>
    </div>
  `;
}
