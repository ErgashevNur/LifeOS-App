import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  server: {
    hmr: {
      overlay: false,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@assets": path.resolve(__dirname, "./src/assets"),
    },
  },
  // React Compiler (babel-plugin-react-compiler) Vercel build paytida
  // gensync/babel ichidan xatolik berishi mumkin (eksperimental).
  // O'chirib qo'yildi — production uchun barqaror bo'lishi uchun.
  plugins: [
    react(),
    tailwindcss(),
  ],
});
