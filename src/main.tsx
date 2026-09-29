import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/app.css";

// No <StrictMode>: in development it runs effects twice, which would double every Groq call
// and eat into the free tier's 8,000 tokens/minute.
createRoot(document.getElementById("root")!).render(<App />);
