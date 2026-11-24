/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        cream: 'var(--cream)',
        surface: 'var(--surface)',
        border: 'var(--border)',
        content: {
          DEFAULT: 'var(--text)',
          secondary: 'var(--text-2)',
          muted: 'var(--text-3)',
        },
        mg: {
          DEFAULT: 'var(--mg)',
          light: 'var(--mg-light)',
          pale: 'var(--mg-pale)',
          border: 'var(--mg-border)',
          text: 'var(--mg-text)',
        },
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        serif: ['Instrument Serif', 'Georgia', 'serif'],
        arabic: ['IBM Plex Sans Arabic', 'system-ui', 'sans-serif'],
        amiri: ['Amiri', 'serif'],
      },
      borderRadius: {
        DEFAULT: 'var(--radius, 4px)',
        sm: '2px',
        md: '4px',
        lg: '6px',
        pill: '100px',
      },
      transitionDuration: {
        DEFAULT: '220ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'ease',
      },
    },
  },
  plugins: [],
};
