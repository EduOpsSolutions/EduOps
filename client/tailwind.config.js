/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [ "./src/**/*.{js,jsx,ts,tsx}",  'node_modules/flowbite-react/lib/esm/**/*.js'], 
  theme: {
    extend: {
        colors:{
          'german-red': '#DE0000',
          'bright-red': '#FD0100',
          'dark-red-2': '#890E07',
          'dark-red-3': '#700A06',
          'dark-red-4': '#550702',
          'dark-red-5': '#9F090A',
          'german-yellow': '#FFCF00',
          'white-yellow': '#FFFDF2',
          'black-red': '#0A0202',
          'modal-overlay': '#00000066',
          'grey-1': '#D9D9D9',
        },
        fontSize:{
          'modal-head': ['1.5rem', '2rem'],
        },
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}

