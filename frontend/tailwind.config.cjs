/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        azulCorp: "#0A192F",
        azulTec: "#1F6FEB",
        cian: "#00E5FF",
        turquesa: "#26C6DA",
        neutroOscuro: "#121212",
        neutroClaro: "#F4F6F8",
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        orbitron: ["Orbitron", "sans-serif"],
        source: ["Source Sans Pro", "sans-serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
