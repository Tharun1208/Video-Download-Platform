// =========================================================
// AUTOMATIC THEME BASED ON IST
// 10:00 AM to 12:00 PM IST  → LIGHT
// All other times            → DARK
// =========================================================

export const getAutomaticTheme = () => {
  try {
    const now = new Date();
    const indiaTime = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(now);

    const [hour] = indiaTime.split(":").map(Number);

    if (hour >= 10 && hour < 12) {
      return "light";
    }
  } catch (e) {
    console.error("IST calculation error:", e);
  }

  return "dark";
};

// =========================================================
// GET THEME MODE ('auto' | 'light' | 'dark')
// =========================================================

export const getThemeMode = () => {
  const mode = localStorage.getItem("theme_mode");
  if (mode === "auto" || mode === "light" || mode === "dark") {
    return mode;
  }
  // Default to auto schedule if no preference exists
  return "auto";
};

// =========================================================
// GET EFFECTIVE SAVED THEME ('light' | 'dark')
// =========================================================

export const getSavedTheme = () => {
  const mode = getThemeMode();

  if (mode === "auto") {
    return getAutomaticTheme();
  }

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return getAutomaticTheme();
};

// =========================================================
// APPLY THEME
// Accepts 'auto', 'light', or 'dark'
// =========================================================

export const applyTheme = (themeOrMode) => {
  let effectiveTheme = "dark";
  const currentMode = getThemeMode();

  if (themeOrMode === "auto") {
    localStorage.setItem("theme_mode", "auto");
    effectiveTheme = getAutomaticTheme();
  } else if (themeOrMode === "light" || themeOrMode === "dark") {
    localStorage.setItem("theme_mode", themeOrMode);
    effectiveTheme = themeOrMode;
  } else {
    // Preserve whatever mode is currently configured
    if (currentMode === "auto") {
      effectiveTheme = getAutomaticTheme();
    } else {
      effectiveTheme = currentMode === "light" ? "light" : "dark";
    }
  }

  // Persist effective theme
  localStorage.setItem("theme", effectiveTheme);

  // Update HTML Element
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(effectiveTheme);
  document.documentElement.setAttribute("data-theme", effectiveTheme);
  document.documentElement.style.colorScheme = effectiveTheme;

  // Update Body Element
  if (document.body) {
    document.body.classList.remove("light", "dark");
    document.body.classList.add(effectiveTheme);
    document.body.setAttribute("data-theme", effectiveTheme);
  }

  // Update Root Container
  const root = document.getElementById("root");
  if (root) {
    root.classList.remove("light", "dark");
    root.classList.add(effectiveTheme);
    root.setAttribute("data-theme", effectiveTheme);
  }

  // Notify all listening components
  window.dispatchEvent(
    new CustomEvent("themeChanged", {
      detail: effectiveTheme,
    })
  );

  console.log(`Theme updated to: ${effectiveTheme} (mode: ${getThemeMode()})`);
};

// =========================================================
// INITIALIZE THEME AND SCHEDULE CHECKER
// =========================================================

let timerStarted = false;

export const initializeTheme = () => {
  const mode = getThemeMode();
  applyTheme(mode);

  // If in auto mode, watch every 60 seconds to switch at 10 AM / 12 PM IST automatically
  if (!timerStarted && typeof window !== "undefined") {
    timerStarted = true;
    setInterval(() => {
      if (getThemeMode() === "auto") {
        const expected = getAutomaticTheme();
        const current = localStorage.getItem("theme");
        if (expected !== current) {
          applyTheme("auto");
        }
      }
    }, 60000);
  }
};