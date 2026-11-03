/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        finance: {
          bg: '#0a0d14',
          card: '#111726',
          border: '#1e293b',
          muted: '#94a3b8',
          accent: '#38bdf8',
          up: '#10b981', // green
          upDark: '#064e3b',
          down: '#ef4444', // red
          downDark: '#7f1d1d',
          neutral: '#1e293b',
          cbUp: '#3b82f6', // colorblind blue
          cbDown: '#f97316' // colorblind orange
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
