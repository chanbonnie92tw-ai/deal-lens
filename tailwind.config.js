/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#060a0d',
        panel: '#0b1116',
        panel2: '#0e161c',
        line: '#16232b',
        ink: '#e6f0f2',
        muted: '#6b838c',
        dim: '#3a5158',
        green: '#22e39a',
        red: '#ff5470',
        amber: '#ffb020',
        cyan: '#38bdf8',
        violet: '#a78bfa',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [],
}
