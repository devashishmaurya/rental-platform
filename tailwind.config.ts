import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#0a3d5c', // Darker blue for nav/hero background
        },
        accent: {
          green: '#10b981', // Green for "Add Listing" button
          'green-hover': '#059669',
        },
        secondary: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#404040',
          800: '#27272a',
          900: '#18181b',
        },
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'hero-title': ['2.5rem', { lineHeight: '1.15' }],
        'hero-lead': ['1.25rem', { lineHeight: '1.5' }],
        'section-title': ['1.875rem', { lineHeight: '1.2' }],
      },
    },
  },
  plugins: [],
}
export default config
