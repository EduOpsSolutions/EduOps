/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [ 
    "./src/**/*.{js,jsx,ts,tsx}",  
    'node_modules/flowbite-react/lib/esm/**/*.js',
    "./node_modules/flowbite/**/*.js"
  ], 
  theme: {
    extend: {
        colors:{
          'german-yellow': '#FFCF00',
          'german-black': '#000000',
          'german-red': '#DE0000',
          'bright-red': '#FD0100',
          'dark-red': '#890E07',
          'dark-red-2': '#890E07',
          'dark-red-3': '#700A06',
          'dark-red-4': '#550702',
          'white-yellow-tone': '#FFFDF2',
          'black-red-tone': '#0A0202',
          'grey-1': '#D9D9D9'
        },
        fontFamily: {
          'sans': ['"Open Sans"'],
        },
        boxShadow: {
          'login-form': '0px 10px 50px rgba(0, 0, 0, 0.6)', 
        }
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}

