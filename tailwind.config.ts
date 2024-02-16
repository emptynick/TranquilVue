/** @type {import('tailwindcss').Config} */
import FormKitVariants from '@formkit/themes/tailwindcss'
import Typography from '@tailwindcss/typography'

export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  safelist: [
    'h-64', 'w-64',
    'h-72', 'w-72',
    'h-80', 'w-80',
    'h-96', 'w-96',
    'h-128', 'w-128',
  ],
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.grey.100'),
          },
        },
      }),
      animation: {
        wiggle: 'wiggle 0.25s ease-in-out infinite',
        shake: 'shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both'
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-0.2deg)' },
          '50%': { transform: 'rotate(0.2deg)' }
        },
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px,0,0)'},
          '20%, 80%': { transform: 'translate3d(2px,0,0)'},
          '30%, 50%, 70%': { transform: 'translate3d(-4px,0,0)'},
          '40%, 60%': { transform: 'translate3d(4px,0,0)'},
        }
      },
      spacing: {
        '128': '32rem',
      }
    },
  },
  plugins: [Typography, FormKitVariants],
}

