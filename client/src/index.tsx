import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";

import "./index.css";
import App from "./App";

import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/components.css";
import "./styles/users-v3.css";
import "./styles/dashboard-cyber.css";
import "./styles/layout.css";

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
