/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [ "./src/**/*.{js,jsx,ts,tsx}",  'node_modules/flowbite-react/lib/esm/**/*.js'], 
  theme: {
    extend: {
        colors:{
          'german-yellow': '#FFCF00',
          'german-black': '#000000',
          'german-red': '#DE0000',
          'bright-red': '#FD0100',
          'dark-red': '#890E07',
          'dark-red-2': '#700A06',
          'dark-red-3': '#550702',
          'dark-red-4': '#9F090A',
          'white-yellow-tone': '#FFFDF2',
          'black-red-tone': '#0A0202',
          'grey-1': '#D9D9D9'
        }
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}

