import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import AppRoutes from "./routes/AppRoutes.jsx";
import { initializeTheme } from "./utils/theme.js";
import ScrollManager from "./components/common/ScrollManager.jsx";

function App() {
  // =========================================================
  // INITIALIZE THEME & BACKGROUND IST SCHEDULE WATCHER
  // =========================================================

  useEffect(() => {
    initializeTheme();
  }, []);

  // =========================================================
  // APP
  // =========================================================

  return (
    <BrowserRouter>
      <ScrollManager />
      <AppRoutes />

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,

          style: {
            background: "#1e293b",
            color: "#fff",
            border:
              "1px solid #334155",
          },
        }}
      />

    </BrowserRouter>
  );
}

export default App;