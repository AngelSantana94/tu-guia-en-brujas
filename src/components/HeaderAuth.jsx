import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import AuthModal from "./AuthModal";

// Paleta de colores para el avatar cuando no hay foto (misma lógica que en MyReviews,
// determinista a partir del id/nombre para que no cambie en cada render).
const AVATAR_COLORS = [
  "bg-rose-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-fuchsia-500",
  "bg-pink-500",
];

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const second = parts[1]?.[0] || "";
  return (first + second).toUpperCase();
}

function getAvatarColor(seed) {
  if (!seed) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export default function HeaderAuth() {
  const [session, setSession] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Cerrar el dropdown de escritorio si el usuario hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        window.innerWidth >= 768 &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Bloquear scroll SOLO cuando el drawer móvil está realmente visible (< md).
  // En escritorio nunca se toca el overflow del html: quitar la barra de scroll
  // ahí ensancha el viewport y descuadra el hero (letra/tamaño cambian de golpe).
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");

    const applyScrollLock = () => {
      if (isMenuOpen && mq.matches) {
        document.documentElement.classList.add("overflow-hidden");
      } else {
        document.documentElement.classList.remove("overflow-hidden");
      }
    };

    applyScrollLock();
    mq.addEventListener("change", applyScrollLock);

    const handleEsc = (e) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.documentElement.classList.remove("overflow-hidden");
      mq.removeEventListener("change", applyScrollLock);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsMenuOpen(false);
  };

  // Datos del usuario para el avatar (foto real o iniciales de color)
  const user = session?.user;
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Usuario";
  const avatarUrl = user?.user_metadata?.avatar_url || null;
  const avatarColor = getAvatarColor(user?.id || displayName);
  const initials = getInitials(displayName);

  return (
    <>
      {session ? (
        /* ==========================================
           1. ESTADO LOGEADO: 2 ELEMENTOS (Reservas + Perfil)
        =========================================== */
        <div className="flex items-center gap-3 relative" ref={menuRef}>
          {/* BOTÓN IZQUIERDA: Mis reservas — solo escritorio, en móvil vive dentro del drawer */}
          <a
            href="/mis-reservas/"
            className="hidden md:inline-flex bg-[#8a3cb8] hover:bg-[#6d2d93] text-white! font-semibold text-[0.9rem] px-4 py-2 rounded-xl transition-colors duration-200 items-center gap-2 no-underline!"
          >
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Mis reservas</span>
          </a>

          {/* ICONO DERECHA: avatar del usuario (foto o iniciales) */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-label="Menú de usuario"
            title="Menú de usuario"
            className="shrink-0 rounded-full ring-2 ring-transparent hover:ring-[#8a3cb8]/40 transition-all cursor-pointer border-0 bg-transparent p-0 flex items-center justify-center focus:outline-none"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-9 h-9 rounded-full object-cover"
              />
            ) : (
              <div
                className={`w-9 h-9 rounded-full text-white flex items-center justify-center font-bold text-xs ${avatarColor}`}
              >
                {initials}
              </div>
            )}
          </button>

          {/* ===== DESKTOP: dropdown clásico ===== */}
          {isMenuOpen && (
            <div className="hidden md:block absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 text-gray-800 animate-in fade-in zoom-in-95 duration-150">
              <a
                href="/panel-usuario/"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#8a3cb8] transition-colors no-underline font-medium"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Editar perfil</span>
              </a>

              <hr className="my-1 border-gray-100" />

              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors border-0 bg-transparent cursor-pointer"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Cerrar sesión</span>
              </button>
            </div>
          )}

          {/* ===== MÓVIL: drawer a pantalla completa, entra de derecha a izquierda ===== */}
          <div
            className={`md:hidden fixed inset-0 z-[100] ${isMenuOpen ? "" : "pointer-events-none"}`}
            aria-hidden={!isMenuOpen}
          >
            <div
              onClick={() => setIsMenuOpen(false)}
              className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ease-out ${
                isMenuOpen ? "opacity-100" : "opacity-0"
              }`}
            />

            <div
              className={`absolute inset-y-0 right-0 h-full w-[78%] max-w-xs bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
                isMenuOpen ? "translate-x-0" : "translate-x-full"
              }`}
            >
              {/* Cabecera del drawer: avatar + nombre */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3 min-w-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div
                      className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-sm shrink-0 ${avatarColor}`}
                    >
                      {initials}
                    </div>
                  )}
                  <span className="font-semibold text-[#222222] truncate">
                    {displayName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Cerrar"
                  className="p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors duration-200 border-0 bg-transparent cursor-pointer shrink-0"
                >
                  <svg
                    className="w-5 h-5 text-[#222222]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <nav className="flex flex-col p-3 gap-1">
                {/* Mis reservas */}
                <a
                  href="/mis-reservas/"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[#222222] font-semibold text-[0.95rem] no-underline! hover:bg-gray-100 transition-colors duration-200"
                >
                  <svg
                    className="w-4 h-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>Mis reservas</span>
                </a>

                {/* Editar perfil */}
                <a
                  href="/panel-usuario/"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[#222222] font-semibold text-[0.95rem] no-underline! hover:bg-gray-100 transition-colors duration-200"
                >
                  <svg
                    className="w-4 h-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Editar perfil</span>
                </a>

                <hr className="my-1 border-gray-100" />

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-red-600 font-semibold text-[0.95rem] hover:bg-red-50 transition-colors duration-200 border-0 bg-transparent cursor-pointer"
                >
                  <svg
                    className="w-4 h-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Cerrar sesión</span>
                </button>
              </nav>
            </div>
          </div>
        </div>
      ) : (
        /* ==========================================
          2. ESTADO NO LOGEADO: Botón Único Acceso / Registro
        =========================================== */
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          aria-label="Acceso / Registro"
          className="
    inline-flex items-center justify-center
    w-9 h-9 md:w-auto md:h-auto
    rounded-full md:rounded-xl
    border border-[#8a3cb8]
    text-[#8a3cb8]
    hover:bg-[#8a3cb8]/10
    md:bg-[#8a3cb8]
    md:text-white!
    md:border-0
    md:hover:bg-[#6d2d93]
    transition-colors duration-200
    cursor-pointer
    md:px-4 md:py-2
    md:font-semibold
    md:text-[0.9rem]
    md:gap-2
  "
        >
          <svg
            className="w-[18px] h-[18px] shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>

          <span className="hidden md:inline">Acceso / Registro</span>
        </button>
      )}

      {/* Modal interactivo */}
      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
