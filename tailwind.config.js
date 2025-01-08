/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    // 背景色
    {
      pattern: /bg-(blue|teal|emerald|orange|purple)-(50|500|900)/,
    },
    // 文字颜色
    {
      pattern: /text-(blue|teal|emerald|orange|purple)-(400|500)/,
    },
    // 边框颜色
    {
      pattern: /border-(blue|teal|emerald|orange|purple)-500/,
    },
    // 阴影颜色
    {
      pattern: /shadow-(blue|teal|emerald|orange|purple)-500/,
    },
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} 