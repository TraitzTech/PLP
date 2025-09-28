import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Urbanist', ...fontFamily.sans],
        urbanist: ['Urbanist', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'plp-gradient': 'linear-gradient(135deg, #390058 0%, #FF4672 50%, #FFB43B 100%)',
        'plp-gradient-reverse': 'linear-gradient(135deg, #FFB43B 0%, #FF4672 50%, #390058 100%)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        // PLP Brand Colors from Brand Guidelines
        'plp-purple': '#390058',
        'plp-pink': '#FF4672', 
        'plp-yellow': '#FFB43B',
        'plp-seance': '#831597',
        'plp-medium-red-violet': '#BB3083',
        'plp-carnation': '#F66E5E',
        'plp-tan-hide': '#F98E4C',
        
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: '#390058', // PLP Purple
          foreground: '#FFFFFF',
          50: '#F4F1F8',
          100: '#E9E2F0',
          200: '#D3C5E1',
          300: '#BDA8D2',
          400: '#A78BC3',
          500: '#916EB4',
          600: '#7B51A5',
          700: '#653496',
          800: '#4F1787',
          900: '#390058',
        },
        secondary: {
          DEFAULT: '#FF4672', // PLP Pink
          foreground: '#FFFFFF',
          50: '#FFF1F3',
          100: '#FFE2E7',
          200: '#FFC5CF',
          300: '#FFA8B7',
          400: '#FF8B9F',
          500: '#FF6E87',
          600: '#FF516F',
          700: '#FF3457',
          800: '#FF173F',
          900: '#FF4672',
        },
        accent: {
          DEFAULT: '#FFB43B', // PLP Yellow
          foreground: '#000000',
          50: '#FFFBF1',
          100: '#FFF7E2',
          200: '#FFEFC5',
          300: '#FFE7A8',
          400: '#FFDF8B',
          500: '#FFD76E',
          600: '#FFCF51',
          700: '#FFC734',
          800: '#FFBF17',
          900: '#FFB43B',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;