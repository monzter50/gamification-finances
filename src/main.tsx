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

import { installGlobalErrorHandlers } from "@/shared/errors";

import App from "./App.tsx";

// Report uncaught errors / unhandled rejections that escape React and try/catch.
installGlobalErrorHandlers();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
