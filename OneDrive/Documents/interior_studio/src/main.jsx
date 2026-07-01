import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./styles/global.css";

// #region agent log
fetch("http://127.0.0.1:7663/ingest/b8f5551c-eec6-4ffb-a978-d7c0b3c54bd5", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Debug-Session-Id": "c768d3",
  },
  body: JSON.stringify({
    sessionId: "c768d3",
    runId: "pre-fix",
    hypothesisId: "H7_APP_RENDERING_STATIC_SHELL",
    location: "src/main.jsx:8",
    message: "Main bootstrap render started",
    data: {
      pathname: window.location.pathname,
      hasRoot: Boolean(document.getElementById("root")),
    },
    timestamp: Date.now(),
  }),
}).catch(() => {});
// #endregion

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
