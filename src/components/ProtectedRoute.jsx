import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient"; // Ajusta la ruta a tu cliente de Supabase

export const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 1. Comprobar sesión inicial
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        window.location.href = "/"; // Redirección limpia al Inicio
      } else {
        setUser(session.user);
        setLoading(false);
      }
    };

    checkAuth();

    // 2. Escuchar cambios de estado en tiempo real
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        window.location.href = "/";
      } else {
        setUser(session.user);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Spinner breve mientras verifica la sesión en localStorage
  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1E293B]"></div>
      </div>
    );
  }

  return user ? children : null;
};
