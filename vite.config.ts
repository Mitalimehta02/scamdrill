import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The browser app runs on :5173; /api/* is forwarded to the Express server on :3001,
// so the Groq key never has to be in the browser.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { "/api": "http://localhost:3001" },
  },
});
