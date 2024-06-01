/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [ "./src/**/*.{js,jsx,ts,tsx}",  'node_modules/flowbite-react/lib/esm/**/*.js'], 
  theme: {
    extend: {
        colors:{
          germanRed: '#DE0000',
          brightRed: '#FD0100',
          darkRed: '#890E07',
          darkRed2: '#700A06',
          darkRed3: '#550702',
          darkRed4: '#9F090A',
          germanBlack: '#000000',
          germanYellow: '#FFCF00',
          whiteYellowTone: '#FFFDF2',
          blackRedTone: '#0A0202'
        }

    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}

