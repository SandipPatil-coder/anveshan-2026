import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Hand over from the static boot screen in index.html
const boot = document.getElementById("boot");
if (boot) boot.remove();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
