import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0d0d0f',
        foreground: '#ffffff',
        'gray-800': '#1a1a1a',
        'yellow-500': '#f5c518',
      },
      borderRadius: {
        lg: '1rem',
        md: '0.5rem',
      },
    },
  },
  plugins: [
    require('tw-animate-css'),
  ],
};
export default config;
