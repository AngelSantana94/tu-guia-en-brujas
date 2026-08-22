import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import OtpAuth from "./OtpAuth";
import UserDashboard from "./UserDashboard";

export default function PanelPage() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Verificar si existe una sesión previa guardada en el navegador
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Escuchar en tiempo real si el usuario inicia o cierra sesión
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Mientras verifica el token en Supabase, mostramos un loader de DaisyUI
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-[#8a3cb8]"></span>
      </div>
    );
  }

  // SI NO HAY SESIÓN: Bloqueamos el panel y mostramos la pantalla de login por email
  if (!session) {
    return (
      <div className="py-16 px-4 max-w-md mx-auto">
        <OtpAuth onAuthenticated={(user) => setSession(user)} />
      </div>
    );
  }

  // SI HAY SESIÓN: Mostramos el panel de reservas
  return <UserDashboard user={session.user} />;
}
