export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}', // Include all pages
    './src/components/**/*.{js,ts,jsx,tsx}', // Include all components
    './src/**/*.{js,ts,jsx,tsx}', // Optionally include all files in src
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};