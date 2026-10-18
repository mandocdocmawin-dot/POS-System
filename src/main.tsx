import {ensureCashDrawers} from './services/cashDrawerService';
import {initializeBranches} from './services/initializeBranches';
import {initializeAccountData} from './data/seed/accounts';
import {initializeStaffData} from './data/seed/phase5';
import './styles/print.css';
import {initializePosData} from './services/initializePosData';
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

import { dataService } from "./services/dataService";
dataService.initialize();
initializePosData();
initializeStaffData();
initializeAccountData();
initializeBranches();
ensureCashDrawers();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
