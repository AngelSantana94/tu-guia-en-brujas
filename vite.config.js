// vite.config.js
import { defineConfig } from "vite";

export default defineConfig(() => {
  return {
    // ✅ Con dominio personalizado, la base es raíz "/"
    base: "/",

    build: {
      rollupOptions: {
        input: {
          main: "index.html",
          brujas: "privado-brujas.html",
          gante: "privado-gante.html",
          bruselas: "privado-bruselas.html",
          antwerpen: "privado-antwerpen.html",
          privacidad: "politica-privacidad.html",
          cookies: "politica-cookies.html",
          aviso: "aviso-legal.html",
        },
      },
    },
  };
});