import React, { useState } from "react";
import EditBookingModal from "./EditBookingModal";
import CancelBookingModal from "./CancelBookingModal";
import ReviewModal from "./ReviewModal";

// Formatear Fecha: "9 de agosto de 2026"
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// Calcular Rango Horario
const calculateTimeRange = (timeStr, durationHours = 2) => {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(":").map(Number);
  const startFormatted = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

  const endHours = (hours + durationHours) % 24;
  const endFormatted = `${String(endHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

  return `${startFormatted} - ${endFormatted}`;
};

// Comprobar si por horario ya terminó el tour
const isTourTimePassed = (dateStr, timeStr, durationHours = 2) => {
  if (!dateStr || !timeStr) return false;
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);

  const tourEnd = new Date(
    year,
    month - 1,
    day,
    hours + durationHours,
    minutes,
  );
  return new Date() >= tourEnd;
};

export default function BookingCard({
  booking,
  onModify,
  onCancel,
  onReview,
  reviewedTourIds,
}) {
  // Estado local para abrir / cerrar la modal de edición
  const [isEditOpen, setIsEditOpen] = useState(false);
  // Estado local para abrir / cerrar la modal de cancelación
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  // Estado local para abrir / cerrar la modal de valoración
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const {
    status,
    attended = false,
    booking_date,
    booking_time,
    tours,
  } = booking;

  // 1. Número de personas (admite ambas nomenclaturas de DB)
  const numAdults = booking.num_adults ?? booking.num_adult ?? 0;
  const numMinors = booking.num_minors ?? booking.num_mino ?? 0;

  // 2. Comprobar si ya fue valorado (por tour, ya que "reviews" no tiene booking_id)
  const isReviewed =
    reviewedTourIds?.has(booking.tour_id) ??
    (booking.has_reviewed || booking.reviewed || false);

  // 3. Estados principales
  const isCancelled =
    status === "cancelled" || status === "cancelada" || status === "no_show";

  const isCompleted =
    attended ||
    status === "completed" ||
    isTourTimePassed(booking_date, booking_time, 2);

  // 4. Datos del tour
  const tourName =
    tours?.name || "Free tour Brujas Auténtica con guía local y Chocolate";
  const tourImage =
    tours?.image_url ||
    tours?.thumb_url ||
    "/images/tours/thumb-brujas-autentica.avif";

  // 5. Formato inteligente de Asistentes
  const adultsText =
    numAdults > 0 ? `${numAdults} adulto${numAdults > 1 ? "s" : ""}` : "";
  const minorsText =
    numMinors > 0 ? `${numMinors} niño${numMinors > 1 ? "s" : ""}` : "";
  const peopleText = [adultsText, minorsText].filter(Boolean).join(", ");

  // Estilo unificado y limpio para botones
  const buttonStyle =
    "px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 bg-white hover:bg-gray-100 transition-colors cursor-pointer shadow-xs";

  return (
    <div className="flex flex-col md:flex-row border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-xs hover:shadow-md transition-all w-full relative">
      {/* Imagen */}
      <div className="md:w-64 h-48 md:h-auto md:self-stretch shrink-0 relative overflow-hidden bg-gray-100">
        <img
          src={tourImage}
          alt={tourName}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Contenido */}
      <div className="p-5 flex flex-col justify-between flex-grow gap-3">
        <div className="flex flex-col gap-1.5">
          {/* Indicador de Estado */}
          {isCancelled ? (
            <div className="flex items-center gap-1.5 text-gray-800 text-sm font-medium">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-rose-600 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span>Reserva cancelada</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-gray-800 text-sm font-medium">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-emerald-600 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>
                {isCompleted ? "Tour realizado" : "Reserva confirmada"}
              </span>
            </div>
          )}

          {/* Título */}
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
            {tourName}
          </h2>

          {/* Fecha y Rango Horario */}
          <p className="text-gray-500 text-sm font-medium">
            {formatDate(booking_date)} <span className="mx-1">•</span>{" "}
            {calculateTimeRange(booking_time)}
          </p>

          {/* Asistentes */}
          {peopleText && <p className="text-gray-500 text-sm">{peopleText}</p>}
        </div>

        {/* Acciones */}
        {!isCancelled && (
          <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-gray-100 mt-2">
            {!isCompleted && (
              <>
                {/* BOTÓN EDITAR CON SU ONCLICK */}
                <button
                  type="button"
                  onClick={() => setIsEditOpen(true)}
                  className={buttonStyle}
                >
                  Editar
                </button>

                <button
                  type="button"
                  onClick={() => setIsCancelOpen(true)}
                  className={buttonStyle}
                >
                  Cancelar
                </button>
              </>
            )}

            {isCompleted && !isReviewed && (
              <button
                type="button"
                onClick={() => setIsReviewOpen(true)}
                className={buttonStyle}
              >
                Valorar
              </button>
            )}
          </div>
        )}
      </div>

      {/* MODAL EDITAR RESERVA */}
      <EditBookingModal
        booking={booking}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onUpdated={(updatedData) => {
          setIsEditOpen(false);
          if (onModify) onModify(updatedData); // Notifica al componente padre si necesitas refrescar datos
        }}
      />

      {/* MODAL CANCELAR RESERVA */}
      <CancelBookingModal
        booking={booking}
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        onCancelled={(updatedData) => {
          setIsCancelOpen(false);
          if (onCancel) onCancel(updatedData); // Notifica al padre para refrescar el estado local
        }}
      />

      {/* MODAL VALORAR TOUR */}
      <ReviewModal
        booking={booking}
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        onReviewed={(tourId) => {
          setIsReviewOpen(false);
          if (onReview) onReview(tourId); // Notifica al padre para marcar el tour como valorado
        }}
      />
    </div>
  );
}
