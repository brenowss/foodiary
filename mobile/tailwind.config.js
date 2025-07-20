import { colors } from './src/styles/colors';

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        'sans-regular': ['HostGrotesk_400Regular', 'sans-serif'],
        'sans-medium': ['HostGrotesk_500Medium', 'sans-serif'],
        'sans-semibold': ['HostGrotesk_600SemiBold', 'sans-serif'],
        'sans-bold': ['HostGrotesk_700Bold', 'sans-serif'],
      },
      colors: colors,
    },
  },
};
