/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#F6F5FA",
        canvas: "#FFFFFF",
        surface: "#FCFBFF",
        "surface-muted": "#F1EFF8",
        card: "#FFFFFF",
        text: "#17151F",
        "text-muted": "#7E7A8F",
        "text-soft": "#A5A1B5",
        line: "#E7E3F0",
        primary: "#6F58E8",
        "primary-dark": "#5C46D9",
        "primary-soft": "#ECE8FF",
        accent: "#8B7BFF",
        "accent-soft": "#F2EFFF",
        danger: "#D76E86",
        success: "#53B483",
        warning: "#D39A42",
      },
      borderRadius: {
        sm: "12px",
        md: "18px",
        lg: "28px",
        pill: "999px",
      },
      boxShadow: {
        card: "0 8px 18px rgba(62, 45, 125, 0.08)",
      },
      spacing: {
        xs: "6px",
        sm: "10px",
        md: "16px",
        lg: "24px",
        xl: "32px",
      },
      letterSpacing: {
        tightish: "-0.8px",
        metric: "-0.4px",
      },
    },
  },
  plugins: [],
};
