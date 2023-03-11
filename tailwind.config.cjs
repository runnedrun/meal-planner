const colors = require("tailwindcss/colors")
const plugin = require("tailwindcss/plugin")

module.exports = {
  important: "#__next",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./views/**/*.{js,ts,jsx,tsx}",
    "./tailwind-components/**/*.{js,ts,jsx,tsx}",
    "./images/*.{jpg,svg,png,jpeg}",
    "./styles/*.css",
    "./utils/**/*.{js,ts,jsx,tsx}",
    "./helpers/**/*.{js,ts,jsx,tsx}",
    "./data/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./page_helpers/**/*.{js,ts,jsx,tsx}",
    "./gen/**/*.{js,ts,jsx,tsx}",
  ],
  variants: {
    extend: {},
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
  theme: {
    fontFamily: {
      sans: ["montserrat", "sans-serif"],
      serif: ["serif"],
    },
    extend: {
      animation: {
        "pulse-once": "pulse 2s linear 1",
      },
      colors: {
        current: colors.blue,
        primary: colors.green,
        error: colors.red,
        secondary: colors.orange,
        defaultOutline: "rgba(0, 0, 0, 0.23)",
        background: "#9C8168",
      },
    },
  },
  experimental: {
    optimizeUniversalDefaults: true,
  },
}
