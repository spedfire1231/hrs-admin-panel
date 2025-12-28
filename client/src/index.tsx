import React from 'react';
import { createRoot } from 'react-dom/client';  // ← не default
import './index.css';
import App from './App';
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/components.css";
import "./styles/users-v3.css";
import "./styles/dashboard-cyber.css";


const root = createRoot(document.getElementById('root')!);
root.render(<App />);