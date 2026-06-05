export const Theme = {
  isDark() {
    const theme =
      document.documentElement.getAttribute("data-bs-theme") ||
      document.documentElement.getAttribute("data-theme") ||
      "light";
    return theme === "dark";
  },

  get primary() { return this.isDark() ? "#f97316" : "#4f46e5"; },
  get bgMain() { return this.isDark() ? "#1a1a1a" : "#f0f0f0"; },
  get bgCard() { return this.isDark() ? "#262626" : "#ffffff"; },
  get textPrimary() { return this.isDark() ? "#f3f4f6" : "#111827"; },
  get textSecondary() { return this.isDark() ? "#9ca3af" : "#6b7280"; },
  get border() { return this.isDark() ? "#404040" : "#e5e7eb"; },
  get borderDashed() { return this.isDark() ? "#555555" : "#d1d5db"; },
  get connector() { return this.isDark() ? "#525252" : "#9ca3af"; },
  get undoBg() { return this.isDark() ? "#525252" : "#d1d5db"; },
  get undoText() { return this.isDark() ? "#f3f4f6" : "#111827"; },
  get inputBg() { return this.isDark() ? "#333333" : "#ffffff"; },
  get inputBorder() { return this.isDark() ? "#555555" : "#d1d5db"; },
};
