import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'gradient': 'gradient 3s ease infinite',
        'float': 'float 3s ease-in-out infinite',
        'float-delayed': 'float 3s ease-in-out infinite 1.5s',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
export default config