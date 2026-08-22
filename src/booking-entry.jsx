import { createRoot } from 'react-dom/client'
import BookingWidget from './components/BookingWidget'
import './tailwind.css'

// Busca TODOS los elementos marcados con data-booking-widget en la página
// y monta un <BookingWidget> independiente en cada uno, usando el slug
// que le pongas en data-tour-slug. Así puedes repetir esto varias veces
// en la misma página (freetour, esencial auténtica, esencial nocturno...).
//
// Ejemplo en tu HTML:
// <div data-booking-widget data-tour-slug="free-tour-brujas"></div>
// <div data-booking-widget data-tour-slug="esencial-autentica"></div>

document.querySelectorAll('[data-booking-widget]').forEach((el) => {
  const slug = el.dataset.tourSlug
  if (!slug) {
    console.warn('Falta data-tour-slug en un div de reserva', el)
    return
  }
  createRoot(el).render(<BookingWidget tourSlug={slug} />)
})