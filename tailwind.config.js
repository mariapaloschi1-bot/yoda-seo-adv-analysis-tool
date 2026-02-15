/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      colors: {
        yoda: {
          teal: '#2dd4bf',
          dark: '#0f172a',
          slate: {
            800: '#1e293b',
            700: '#334155',
            600: '#475569',
            500: '#64748b',
            400: '#94a3b8',
            300: '#cbd5e1',
            200: '#e2e8f0',
          }
        }
      },
      boxShadow: {
        'glow-teal': '0 0 20px rgba(45, 212, 191, 0.5)',
        'glow-teal-lg': '0 0 30px rgba(45, 212, 191, 0.6)',
      }
    },
  },
  plugins: [],
}
