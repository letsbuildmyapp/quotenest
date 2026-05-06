/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Clash Display"', '"General Sans"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      // Apple HIG-derived type scale (web-adapted). Pair with Inter for body, Clash Display for headlines.
      fontSize: {
        // [size, { lineHeight, letterSpacing, fontWeight? }]
        caption:     ['0.75rem',  { lineHeight: '1rem' }],            // 12 / 16
        footnote:    ['0.8125rem',{ lineHeight: '1.125rem' }],        // 13 / 18
        subheadline: ['0.9375rem',{ lineHeight: '1.25rem' }],         // 15 / 20
        body:        ['1rem',     { lineHeight: '1.5rem' }],          // 16 / 24
        headline:    ['1.0625rem',{ lineHeight: '1.375rem', fontWeight: '600' }], // 17 / 22 semibold
        title3:      ['1.25rem',  { lineHeight: '1.625rem' }],        // 20 / 26
        title2:      ['1.375rem', { lineHeight: '1.75rem' }],         // 22 / 28
        title1:      ['1.75rem',  { lineHeight: '2.125rem' }],        // 28 / 34
        largeTitle:  ['2.125rem', { lineHeight: '2.5625rem' }],       // 34 / 41
        // Aliases that override Tailwind defaults so existing class usage maps to HIG floors.
        // text-xs = 12 (caption floor; never below). text-sm = 14 admin-only floor.
        xs:   ['0.75rem',   { lineHeight: '1rem' }],         // 12 / 16
        sm:   ['0.875rem',  { lineHeight: '1.25rem' }],      // 14 / 20
        base: ['1rem',      { lineHeight: '1.5rem' }],       // 16 / 24, body min on marketing
        lg:   ['1.125rem',  { lineHeight: '1.6875rem' }],    // 18 / 27
        xl:   ['1.25rem',   { lineHeight: '1.75rem' }],      // 20 / 28
        '2xl':['1.5rem',    { lineHeight: '2rem' }],         // 24 / 32
        '3xl':['1.875rem',  { lineHeight: '2.25rem', letterSpacing: '-0.01em' }],
        '4xl':['2.25rem',   { lineHeight: '2.5rem',  letterSpacing: '-0.015em' }],
        '5xl':['3rem',      { lineHeight: '1.05',    letterSpacing: '-0.02em' }],
        '6xl':['3.75rem',   { lineHeight: '1.05',    letterSpacing: '-0.02em' }],
        '7xl':['4.5rem',    { lineHeight: '1.05',    letterSpacing: '-0.025em' }],
      },
      colors: {
        sun: {
          50: '#fff8ed', 100: '#ffefd2', 200: '#ffdaa3', 300: '#ffbe6a',
          400: '#ff9d3a', 500: '#fb7c14', 600: '#ec5f0a', 700: '#c4470b',
          800: '#9c3911', 900: '#7e3112',
        },
        grape: {
          50: '#f6f3ff', 100: '#ece6ff', 200: '#d9cfff', 300: '#bda6ff',
          400: '#9d75ff', 500: '#8047ff', 600: '#7028f5', 700: '#5f17d9',
          800: '#4f15b1', 900: '#421490',
        },
        ink: {
          50: '#f6f6f7', 100: '#e7e7ea', 200: '#cfcfd6', 300: '#a9a9b5',
          400: '#7d7d8d', 500: '#5d5d6d', 600: '#4a4a58', 700: '#3c3c47',
          800: '#23232b', 900: '#15151b',
        },
        cream: '#fff9f1',
      },
      borderRadius: { '4xl': '2rem' },
      boxShadow: {
        pop: '0 10px 0 0 rgba(21,21,27,1)',
        'pop-sm': '0 4px 0 0 rgba(21,21,27,1)',
      },
      keyframes: {
        wiggle: { '0%, 100%': { transform: 'rotate(-2deg)' }, '50%': { transform: 'rotate(2deg)' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
      },
      animation: {
        wiggle: 'wiggle 1.2s ease-in-out infinite',
        float: 'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
