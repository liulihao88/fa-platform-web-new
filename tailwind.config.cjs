/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg_color: 'var(--el-bg-color)',
        primary: 'var(--el-color-primary)',
        text_color_primary: 'var(--el-text-color-primary)',
        text_color_regular: 'var(--el-text-color-regular)',
      },
      zIndex: {
        2002: '2002',
      },
    },
  },
  plugins: [],
}
