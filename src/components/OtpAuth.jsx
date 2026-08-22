import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function OtpAuth({ onAuthenticated }) {
  const [step, setStep] = useState("email"); // 'email' | 'code'
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Enviar el código de 6 dígitos al correo
  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Introduce un correo válido.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
    });

    setLoading(false);

    if (error) {
      setError("No se pudo enviar el código. Inténtalo de nuevo.");
      return;
    }

    setStep("code");
  };

  // 2. Verificar el código ingresado por el usuario
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (otpCode.length < 6) {
      setError("Introduce el código de 6 dígitos.");
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otpCode.trim(),
      type: "email",
    });

    setLoading(false);

    if (error) {
      setError("Código incorrecto o caducado.");
      return;
    }

    // Usuario autenticado correctamente
    if (onAuthenticated) onAuthenticated(data.user);
  };

  return (
    <div className="max-w-md w-full mx-auto bg-base-100 p-8 rounded-3xl border border-base-200 shadow-xl space-y-6">
      {/* Icono + Título */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 11h14a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-extrabold text-base-content">
          {step === "email"
            ? "Acceso rápido a tus reservas"
            : "Revisa tu correo"}
        </h2>
        <p className="text-sm text-base-content/60">
          {step === "email"
            ? "Sin contraseñas. Te enviaremos un código de un solo uso."
            : `Hemos enviado un código de 6 dígitos a ${email}`}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-error/10 border border-error/20 text-error rounded-xl text-xs font-medium text-center">
          {error}
        </div>
      )}

      {/* PASO 1: ENTRADA DE CORREO */}
      {step === "email" && (
        <form onSubmit={handleSendCode} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-xs uppercase tracking-wider">
                Correo electrónico
              </span>
            </label>
            <input
              type="email"
              placeholder="tu@email.com"
              className="input input-bordered w-full rounded-xl focus:outline-hidden"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-neutral w-full rounded-xl btn-lg text-white font-medium shadow-md"
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              "Continuar"
            )}
          </button>
        </form>
      )}

      {/* PASO 2: VERIFICACIÓN DEL CÓDIGO */}
      {step === "code" && (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-xs uppercase tracking-wider">
                Código de verificación
              </span>
            </label>
            <input
              type="text"
              maxLength={6}
              placeholder="123456"
              className="input input-bordered w-full rounded-xl text-center text-2xl font-mono tracking-widest focus:outline-hidden"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-neutral w-full rounded-xl btn-lg text-white font-medium shadow-md"
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              "Verificar y Entrar"
            )}
          </button>

          <button
            type="button"
            className="btn btn-ghost btn-xs w-full text-base-content/60"
            onClick={() => {
              setStep("email");
              setError(null);
            }}
          >
            ← Cambiar correo
          </button>
        </form>
      )}
    </div>
  );
}
