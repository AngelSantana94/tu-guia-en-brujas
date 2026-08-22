import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import BookingFlow from "./BookingFlow";

export default function BookingWidget({ tourSlug }) {
  const [tour, setTour] = useState(null);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    supabase
      .from("tours")
      .select("*")
      .eq("slug", tourSlug)
      .single()
      .then(({ data, error }) => {
        if (error) setError("No se pudo cargar el tour");
        else setTour(data);
      });
  }, [tourSlug]);

  useEffect(() => {
    if (isOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [isOpen]);

  if (error) {
    return <p className="text-sm text-red-600 p-4">{error}</p>;
  }

  return (
    <>
      {/* ---------- ESCRITORIO (Sticky + Fijo en modo claro) ---------- */}
      <div className="hidden md:block md:sticky md:top-6 md:self-start">
        <div className="flex flex-col bg-white shadow-xl border border-gray-200 rounded-3xl w-[400px] h-[500px] overflow-hidden relative">
          <div className="relative flex-1 overflow-hidden">
            {tour ? (
              <BookingFlow tour={tour} />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="loading loading-spinner text-gray-800"></span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---------- MÓVIL (Fijo en modo claro) ---------- */}
      <div className="block md:hidden">
        {/* Botón CTA Flotante */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-gray-200 z-40 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
          <button
            type="button"
            className="w-full py-3.5 px-6 rounded-2xl bg-gray-900 text-white font-bold text-base shadow-lg hover:bg-gray-800 transition-all cursor-pointer"
            onClick={() => setIsOpen(true)}
          >
            Ver disponibilidad
          </button>
        </div>

        {/* Modal a pantalla completa (Calendario) */}
        {isOpen && (
          <div className="fixed inset-0 z-[9999] bg-white flex flex-col">
            <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200 shrink-0 bg-white shadow-sm">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar calendario"
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <span className="font-bold text-lg text-gray-900 truncate">
                {tour?.name || "Cargando..."}
              </span>
            </div>

            <div className="relative flex-1 overflow-hidden">
              {tour ? (
                <BookingFlow
                  tour={tour}
                  size="lg"
                  onBooked={() => setIsOpen(false)}
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="loading loading-spinner text-gray-800"></span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
