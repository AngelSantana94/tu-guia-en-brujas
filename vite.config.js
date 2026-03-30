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
          brujas: "privado-brujas/index.html",
          gante: "privado-gante/index.html",
          bruselas: "privado-bruselas/index.html",
          antwerpen: "privado-amberes/index.html",
          privacidad: "politica-de-privacidad/index.html",
          cookies: "politica-de-cookies/index.html",
          aviso: "aviso-legal/index.html",
        },
      },
    },
  };
});