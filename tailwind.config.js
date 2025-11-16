/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      colors: {
        telegram: {
          bg: 'var(--tg-theme-bg-color, #212121)',
          text: 'var(--tg-theme-text-color, #ffffff)',
          hint: 'var(--tg-theme-hint-color, #707579)',
          link: 'var(--tg-theme-link-color, #6ab7ff)',
          button: 'var(--tg-theme-button-color, #5288c1)',
          'button-text': 'var(--tg-theme-button-text-color, #ffffff)',
          'secondary-bg': 'var(--tg-theme-secondary-bg-color, #181818)',
          'header-bg': 'var(--tg-theme-header-bg-color, #212121)',
          'section-bg': 'var(--tg-theme-section-bg-color, #212121)',
          'section-header-text': 'var(--tg-theme-section-header-text-color, #ffffff)',
          'subtitle-text': 'var(--tg-theme-subtitle-text-color, #707579)',
          'destructive-text': 'var(--tg-theme-destructive-text-color, #ff453a)',
        }
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      minHeight: {
        'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
      },
      screens: {
        'xs': '375px',
      },
    },
  },
  plugins: [],
}

