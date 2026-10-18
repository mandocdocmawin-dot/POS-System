import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-700.css';
import {AppErrorBoundary} from './core/errors/AppErrorBoundary';
import { HydrationGate } from './core/hydration/HydrationGate';
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import './styles/print.css';
import App from "./App.tsx";



createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppErrorBoundary><HydrationGate><App /></HydrationGate></AppErrorBoundary>
  </StrictMode>,
);
