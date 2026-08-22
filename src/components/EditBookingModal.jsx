import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../lib/supabaseClient";
import banderaEspana from "../assets/espana.png";

const DIAS = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];
const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const MESES_A_MOSTRAR = 6;
const MAX_PERSONAS_POR_GUIA = 20;

function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function buildMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let day = 1; day <= lastDay.getDate(); day++) {
    cells.push(new Date(year, month, day));
  }
  return cells;
}

export default function EditBookingModal({
  booking,
  isOpen,
  onClose,
  onUpdated,
}) {
  // ⚠️ IMPORTANTE: ya NO hacemos "return null" aquí arriba.
  // Todos los hooks deben ejecutarse siempre, en el mismo orden,
  // en cada render, independientemente de isOpen/booking.

  // Estado del número de asistentes (con valores por defecto seguros
  // por si "booking" todavía es null en el primer render)
  const [numAdults, setNumAdults] = useState(booking?.num_adults || 1);
  const [numMinors, setNumMinors] = useState(booking?.num_minors || 0);

  // Fecha y horarios
  const [today, setToday] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    booking?.booking_date || null,
  );
  const [selectedSlot, setSelectedSlot] = useState(
    booking
      ? { schedule_id: booking.schedule_id, booking_time: booking.booking_time }
      : null,
  );

  // Estados de control
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [assistantChangedNotice, setAssistantChangedNotice] = useState(false);
  // Controla si el panel de horarios está tapando la caja del calendario
  const [horariosOpen, setHorariosOpen] = useState(false);

  const totalPersonas = numAdults + numMinors;
  const requierePrepago = totalPersonas >= 5;

  // El tour_id puede venir con distintos nombres según el join que use tu
  // consulta de reservas. Probamos varias rutas para no depender de una sola.
  const tourId =
    booking?.tour_id ??
    booking?.tourId ??
    booking?.tour?.id ??
    booking?.tours?.id ??
    null;

  const originalTotalPersonas =
    (booking?.num_adults || 0) + (booking?.num_minors || 0);

  // Reiniciar el estado del formulario cada vez que se abre el modal
  // o cambia la reserva que se está editando (el componente ya no se
  // desmonta al cerrar, así que sin esto se quedaría con datos viejos).
  useEffect(() => {
    if (!isOpen || !booking) return;

    setNumAdults(booking.num_adults || 1);
    setNumMinors(booking.num_minors || 0);
    setSelectedDate(booking.booking_date || null);
    setSelectedSlot({
      schedule_id: booking.schedule_id,
      booking_time: booking.booking_time,
    });
    setError(null);
  }, [isOpen, booking?.id]);

  // Cargar fecha servidor
  useEffect(() => {
    if (!isOpen) return;

    supabase.rpc("get_server_today").then(({ data, error }) => {
      if (error) {
        setToday(new Date());
      } else {
        setToday(new Date(`${data}T00:00:00`));
      }
    });
  }, [isOpen]);

  const monthsList = useMemo(() => {
    if (!today) return [];
    return Array.from({ length: MESES_A_MOSTRAR }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }, [today]);

  // Cargar disponibilidad
  useEffect(() => {
    if (!isOpen || !today || monthsList.length === 0) return;

    // Si no logramos determinar el tour_id, NO nos quedamos colgados en
    // "Cargando disponibilidad..." — avisamos y cortamos el loading.
    if (!tourId) {
      console.warn(
        "[EditBookingModal] No se encontró tour_id en el objeto booking:",
        booking,
      );
      setError(
        "No se pudo determinar el tour de esta reserva (falta tour_id).",
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const last = monthsList[monthsList.length - 1];
    const end = new Date(last.year, last.month + 1, 0);

    supabase
      .rpc("get_availability", {
        p_tour_id: tourId,
        p_start_date: toISODate(today),
        p_end_date: toISODate(end),
      })
      .then(({ data, error }) => {
        if (error) {
          console.error("[EditBookingModal] get_availability error:", error);
          setError("No se pudo cargar la disponibilidad");
        } else {
          setAvailability(data || []);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("[EditBookingModal] get_availability excepción:", err);
        setError("No se pudo cargar la disponibilidad");
        setLoading(false);
      });
  }, [isOpen, today, tourId, monthsList]);

  // Horarios para el día seleccionado
  const slotsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return availability.filter((a) => a.booking_date === selectedDate);
  }, [availability, selectedDate]);

  // Datos reales (con "remaining") del horario actualmente seleccionado,
  // buscados dentro de la disponibilidad ya cargada.
  const currentSlotData = useMemo(() => {
    if (!selectedSlot || !selectedDate) return null;
    return (
      availability.find(
        (a) =>
          a.schedule_id === selectedSlot.schedule_id &&
          a.booking_date === selectedDate,
      ) || null
    );
  }, [availability, selectedSlot, selectedDate]);

  // ¿El horario elegido es el mismo que ya tenía la reserva original?
  const isSameSlotAsOriginal =
    !!booking &&
    selectedSlot?.schedule_id === booking.schedule_id &&
    selectedDate === booking.booking_date;

  // Plazas máximas disponibles para esta edición. Si es el mismo horario
  // que ya tenía la reserva, "devolvemos" las personas que ya ocupaba esa
  // reserva antes de calcular el máximo (si no, nunca podrías reconfirmar
  // la misma cantidad de gente que ya tenías).
  const maxPlazas = useMemo(() => {
    const baseRemaining =
      currentSlotData?.remaining ??
      currentSlotData?.available_spots ??
      MAX_PERSONAS_POR_GUIA;

    const adjusted = isSameSlotAsOriginal
      ? baseRemaining + originalTotalPersonas
      : baseRemaining;

    return Math.min(MAX_PERSONAS_POR_GUIA, adjusted);
  }, [currentSlotData, isSameSlotAsOriginal, originalTotalPersonas]);

  // Detectar si hubo algún cambio real respecto a la reserva original
  const isChanged = useMemo(() => {
    if (!booking) return false;

    const adultsChanged = numAdults !== booking.num_adults;
    const minorsChanged = numMinors !== (booking.num_minors || 0);
    const dateChanged = selectedDate !== booking.booking_date;
    const timeChanged = selectedSlot?.booking_time !== booking.booking_time;

    return adultsChanged || minorsChanged || dateChanged || timeChanged;
  }, [numAdults, numMinors, selectedDate, selectedSlot, booking]);

  const handleSelectDate = (date) => {
    if (!date || date < today) return;
    setSelectedDate(toISODate(date));
    setSelectedSlot(null);
    setHorariosOpen(true);
  };

  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
    setHorariosOpen(false);
  };

  const handleCambiarAsistentes = () => {
    setAssistantChangedNotice(true);
    setTimeout(() => setAssistantChangedNotice(false), 3000);
  };

  const formatFechaLegible = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    const monthIndex = parseInt(month, 10) - 1;
    return `${parseInt(day, 10)} de ${MESES[monthIndex]}`;
  };

  const handleConfirmChanges = async () => {
    if (!booking) return;

    if (!selectedSlot) {
      setError("Por favor, selecciona un horario.");
      return;
    }

    if (totalPersonas > maxPlazas) {
      setError(
        `Solo quedan ${maxPlazas} plazas disponibles para este horario.`,
      );
      return;
    }

    setSubmitting(true);
    setError(null);

    const { data, error } = await supabase.rpc("update_booking", {
      p_booking_id: booking.id,
      p_schedule_id: selectedSlot.schedule_id,
      p_booking_date: selectedDate,
      p_booking_time: selectedSlot.booking_time,
      p_num_adults: numAdults,
      p_num_minors: numMinors,
    });

    setSubmitting(false);

    if (error) {
      console.error("[EditBookingModal] update_booking error:", error);
      setError("Ha ocurrido un error al modificar la reserva");
      return;
    }

    if (!data?.success) {
      setError(
        data?.error === "sin_cupo"
          ? `Solo quedan ${data.remaining} plazas, por favor ajusta la cantidad.`
          : data?.message || "No se pudo completar la reserva",
      );
      return;
    }

    if (onUpdated) {
      onUpdated({
        ...data,
        id: booking.id,
        schedule_id: selectedSlot.schedule_id,
        booking_date: selectedDate,
        booking_time: selectedSlot.booking_time,
        num_adults: numAdults,
        num_minors: numMinors,
      });
    }
    onClose();
  };

  // ✅ Ahora sí, el early return va DESPUÉS de todos los hooks.
  if (!isOpen || !booking) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4">
      <div className="relative w-full h-full md:h-auto md:max-h-[90vh] md:max-w-lg bg-base-100 rounded-none md:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-base-200 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-circle btn-sm bg-base-200/60"
            aria-label="Cerrar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <span className="font-bold text-lg">Editar reserva</span>
          <div className="w-8" />
        </div>

        {/* Cuerpos del Modal */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {error && (
            <div className="p-3 bg-error/10 border border-error/30 rounded-xl text-error text-sm font-medium text-center">
              {error}
            </div>
          )}

          {/* SECCIÓN 1: PERSONAS */}
          <section className="space-y-4">
            <h3 className="text-xl font-extrabold text-base-content">
              Cambia el número de personas
            </h3>

            <div className="bg-base-200/40 p-4 rounded-2xl space-y-4">
              {/* Adultos */}
              <div className="flex items-center justify-between">
                <span className="font-semibold text-base-content">Adultos</span>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    className="btn btn-circle btn-sm bg-base-100 border border-base-300 shadow-sm disabled:opacity-30"
                    onClick={() => setNumAdults((n) => Math.max(1, n - 1))}
                    disabled={numAdults <= 1}
                  >
                    −
                  </button>
                  <span className="w-4 text-center font-bold text-lg">
                    {numAdults}
                  </span>
                  <button
                    type="button"
                    className="btn btn-circle btn-sm bg-base-100 border border-base-300 shadow-sm disabled:opacity-30"
                    onClick={() => setNumAdults((n) => n + 1)}
                    disabled={totalPersonas >= maxPlazas}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Niños */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-base-content block">
                    Niños
                  </span>
                  <span className="text-xs text-base-content/50">
                    (hasta 15 años)
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    className="btn btn-circle btn-sm bg-base-100 border border-base-300 shadow-sm disabled:opacity-30"
                    onClick={() => setNumMinors((n) => Math.max(0, n - 1))}
                    disabled={numMinors <= 0}
                  >
                    −
                  </button>
                  <span className="w-4 text-center font-bold text-lg">
                    {numMinors}
                  </span>
                  <button
                    type="button"
                    className="btn btn-circle btn-sm bg-base-100 border border-base-300 shadow-sm disabled:opacity-30"
                    onClick={() => setNumMinors((n) => n + 1)}
                    disabled={totalPersonas >= maxPlazas}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {selectedSlot && (
              <p className="text-xs text-base-content/60 text-center">
                Quedan disponibles {maxPlazas} plazas para este horario. Total
                seleccionado: <span className="font-bold">{totalPersonas}</span>
              </p>
            )}

            {/* Aviso de prepago para grupos de 5 o más */}
            {requierePrepago && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs space-y-1">
                <p className="font-bold">
                  ⚠️ Aviso para grupos reducidos (5+ personas)
                </p>
                <p>
                  Al ser un grupo de 5 o más asistentes (incluyendo niños), se
                  requiere un prepago de <strong>15€ por persona</strong> que
                  deberá abonarse al guía antes de comenzar el tour.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleCambiarAsistentes}
              className="btn btn-neutral w-auto px-6 rounded-xl text-white font-semibold"
            >
              Cambiar asistentes
            </button>

            {assistantChangedNotice && (
              <p className="text-xs text-success font-medium">
                ✓ Número de asistentes actualizado
              </p>
            )}
          </section>

          <hr className="border-base-200" />

          {/* SECCIÓN 2: CALENDARIO Y HORARIOS */}
          <section className="space-y-3">
            <h3 className="text-xl font-extrabold text-base-content">
              Elige un nuevo horario
            </h3>

            {/* Caja del calendario: alto fijo, scroll interno para los meses.
                El panel de horarios aparece ENCIMA de esta misma caja, tapando
                los meses, con una X para volver. */}
            <div className="relative h-[40vh] min-h-[320px] rounded-2xl border border-base-200 overflow-hidden">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-sm text-base-content/60">
                    Cargando disponibilidad...
                  </p>
                </div>
              ) : (
                <div className="h-full overflow-y-auto p-4">
                  {/* Días de la semana */}
                  <div className="sticky top-0 bg-base-100 grid grid-cols-7 text-center text-xs font-bold text-base-content/60 py-2 border-b border-base-200 z-[1]">
                    {DIAS.map((d) => (
                      <span key={d}>{d}</span>
                    ))}
                  </div>

                  {/* Meses */}
                  {monthsList.map(({ year, month }) => (
                    <div key={`${year}-${month}`} className="mt-4">
                      <p className="font-extrabold text-base mb-3 capitalize text-neutral">
                        {MESES[month]}{" "}
                        <span className="font-normal text-base-content/40">
                          {year}
                        </span>
                      </p>

                      <div className="grid grid-cols-7 gap-2">
                        {buildMonthGrid(year, month).map((date, i) => {
                          if (!date) return <span key={i} />;
                          const iso = toISODate(date);
                          const isPast = date < today;
                          const isSelected = iso === selectedDate;

                          return (
                            <button
                              type="button"
                              key={iso}
                              disabled={isPast}
                              onClick={() => handleSelectDate(date)}
                              className={`btn btn-circle w-full aspect-square text-sm ${
                                isSelected
                                  ? "btn-neutral shadow-lg scale-105 text-white"
                                  : "btn-ghost hover:bg-base-200"
                              } ${isPast ? "btn-disabled opacity-20" : ""}`}
                            >
                              {date.getDate()}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Panel de horarios, tapa la caja del calendario */}
              {horariosOpen && selectedDate && (
                <div className="absolute inset-0 bg-base-100 flex flex-col z-10">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-base-200 shrink-0">
                    <p className="font-bold text-sm">
                      Horarios para el {formatFechaLegible(selectedDate)}
                    </p>
                    <button
                      type="button"
                      onClick={() => setHorariosOpen(false)}
                      className="btn btn-ghost btn-circle btn-xs bg-base-200/60"
                      aria-label="Volver al calendario"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-2 gap-3">
                      {slotsForSelectedDate.length === 0 ? (
                        <p className="col-span-2 text-sm text-base-content/50 py-2">
                          No hay plazas para esta fecha.
                        </p>
                      ) : (
                        slotsForSelectedDate.map((slot) => {
                          const sinCupo = slot.remaining <= 0;
                          const isSelected =
                            selectedSlot?.schedule_id === slot.schedule_id;

                          return (
                            <button
                              type="button"
                              key={slot.schedule_id}
                              disabled={sinCupo}
                              onClick={() => handleSelectSlot(slot)}
                              className={`btn btn-md justify-start gap-3 px-4 rounded-xl border ${
                                isSelected
                                  ? "btn-neutral shadow-md text-white"
                                  : "btn-outline border-base-300"
                              } ${sinCupo ? "btn-disabled opacity-40" : ""}`}
                            >
                              <img
                                src={banderaEspana}
                                alt="Español"
                                className="w-5 h-5 rounded-full object-cover shrink-0 border border-base-200"
                              />
                              <span className="font-bold text-base">
                                {slot.booking_time.slice(0, 5)}
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Resumen corto de la fecha/hora elegida, para volver a abrir el panel */}
            {selectedDate && selectedSlot && !horariosOpen && (
              <button
                type="button"
                onClick={() => setHorariosOpen(true)}
                className="w-full text-left text-sm text-base-content/70 px-1 hover:text-base-content transition-colors"
              >
                📅 {formatFechaLegible(selectedDate)} ·{" "}
                {selectedSlot.booking_time?.slice(0, 5)} hrs{" "}
                <span className="underline">(cambiar)</span>
              </button>
            )}

            {/* RESUMEN DINÁMICO: solo aparece cuando hay un cambio real */}
            {isChanged && selectedSlot && (
              <div className="p-4 bg-neutral/5 border border-neutral/15 rounded-2xl">
                <p className="text-sm font-medium text-base-content/80 leading-relaxed">
                  Su tour se ha modificado para{" "}
                  <span className="font-bold text-neutral">
                    {numAdults} {numAdults === 1 ? "adulto" : "adultos"}
                    {numMinors > 0 &&
                      ` y ${numMinors} ${numMinors === 1 ? "niño" : "niños"}`}
                  </span>{" "}
                  el{" "}
                  <span className="font-bold text-neutral">
                    {formatFechaLegible(selectedDate)}
                  </span>{" "}
                  a las{" "}
                  <span className="font-bold text-neutral">
                    {selectedSlot.booking_time.slice(0, 5)} hrs
                  </span>
                  .
                </p>
              </div>
            )}

            {/* BOTÓN GUARDAR CAMBIOS: pegado justo debajo de la caja del calendario.
                Gris/deshabilitado sin cambios, negro/activo en cuanto hay un
                cambio real y un horario válido seleccionado. */}
            <button
              type="button"
              onClick={handleConfirmChanges}
              disabled={!isChanged || !selectedSlot || submitting}
              className={`btn w-full rounded-xl font-bold shadow-md transition-colors ${
                isChanged && selectedSlot
                  ? "btn-neutral text-white"
                  : "bg-base-300 text-base-content/40 cursor-not-allowed border-none hover:bg-base-300"
              }`}
            >
              {submitting ? (
                <span className="loading loading-spinner" />
              ) : (
                "Guardar cambios"
              )}
            </button>
          </section>
        </div>
      </div>
    </div>,
    document.body,
  );
}
