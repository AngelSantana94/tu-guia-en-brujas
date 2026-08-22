import React from "react";
import reservaConfirmada from "../assets/reserva-confirmada.jpeg";

export default function SuccessStep({ email, onClose }) {
  return (
    <div className="fixed inset-0 z-[9999] bg-base-100 flex flex-col w-full h-full overflow-y-auto">
      {/* FOTO */}
      <div className="relative w-full h-64 sm:h-80 shrink-0 overflow-hidden rounded-t-3xl sm:max-w-md sm:mx-auto">
        <img
          src={reservaConfirmada}
          alt="Reserva confirmada"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-base-100 to-transparent" />
      </div>

      {/* CONTENIDO DE LA CONFIRMACIÓN */}
      <div className="flex-1 w-full max-w-md mx-auto px-6 pt-8 pb-8 flex flex-col justify-between shadow-[0_25px_60px_-15px_rgba(168,85,247,0.3)] rounded-3xl relative z-10 bg-base-100">
        <div className="space-y-6">
          {/* Cabecera principal */}
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-base-content tracking-tight">
              Reserva confirmada
            </h2>
            <p className="text-sm text-base-content/70 font-medium">
              Recibirás un email con los detalles en:{" "}
              <span className="text-neutral font-semibold underline">
                {email || "tuemail@ejemplo.com"}
              </span>
            </p>
            <p className="text-sm text-base-content/70 font-medium">
              Recuerda revisar la carpeta de spam y de promociones, y marca el
              correo como no es spam para poder enterarte de posibles cambios.
            </p>
          </div>

          <hr className="border-base-200" />
        </div>

        {/* BOTÓN DE CIERRE */}
        <div className="pt-6">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-neutral btn-lg w-full rounded-xl text-white font-medium shadow-md transition-all active:scale-[0.98]"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
