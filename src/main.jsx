import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './App.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router";
import { AuthProvider } from "./hooks/useAuth.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename="/Tracker-app">
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
