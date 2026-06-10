import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Self-hosted brand fonts (no external request).
// Hanken Grotesk → font-sans (default). JetBrains Mono → font-mono (numeric).
import "@fontsource/hanken-grotesk/400.css";
import "@fontsource/hanken-grotesk/500.css";
import "@fontsource/hanken-grotesk/600.css";
import "@fontsource/hanken-grotesk/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/700.css";

import "./index.css";

import App from "./App.tsx";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
 
    <App />
   
  </StrictMode>,
);
