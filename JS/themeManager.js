import { THEME_KEY } from "./constants.js";

const DEFAULT_THEME = "dark";

// Theme color definitions for text visibility in different modes
const THEME_COLORS = {
  dark: {
    textColor: "#ffffff",      // White text for dark background
    backgroundColor: "#1a1a2e", // Dark background
  },
  light: {
    textColor: "#000000",       // Black text for light background
    backgroundColor: "#ffffff", // Light background
  },
};

export function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function applyTheme(theme) {
  const normalized = theme === "light" ? "light" : "dark";
  const bodyEl = document.body;
  if (bodyEl) {
    bodyEl.dataset.theme = normalized;
  }

  // Apply theme colors to content area
  const contentEl = document.querySelector("#content");
  if (contentEl) {
    const colors = THEME_COLORS[normalized];
    // Set text color based on theme
    contentEl.style.color = colors.textColor;
    contentEl.style.backgroundColor = colors.backgroundColor;
    
    // Remove any inline color styles that might override theme
    // This ensures the default text color is applied
    const allElements = contentEl.querySelectorAll("*");
    allElements.forEach((el) => {
      // Only clear color if it's not explicitly styled by user
      if (el.style.color && el.style.color !== colors.textColor) {
        // Keep user-applied colors, but log for debugging
        console.log("Keeping user color:", el.style.color);
      }
    });
  }

  const toggleBtn = document.querySelector("#theme-toggle");
  if (toggleBtn) {
    toggleBtn.textContent = normalized === "light" ? "Dark mode" : "Light mode";
  }
}

export function persistTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // ignore storage issues
  }
  applyTheme(theme);
}

export function wireThemeToggle() {
  const toggleBtn = document.querySelector("#theme-toggle");
  if (!toggleBtn) {
    applyTheme(getStoredTheme());
    return;
  }

  applyTheme(getStoredTheme());

  toggleBtn.addEventListener("click", () => {
    const nextTheme = document.body.dataset.theme === "light" ? "dark" : "light";
    persistTheme(nextTheme);
  });
}