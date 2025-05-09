/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    // important: true,
  corePlugins: {
    preflight: false,
  },
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
  	extend: {
  		colors: {
  			es: {
  				'50': '#fff6f0',
  				'100': '#ffedd9',
  				'200': '#ffdcb3',
  				'300': '#ffcb8d',
  				'400': '#ff9f44',
  				'500': '#ffa31a',
  				'600': '#ff9900',
  				'700': '#ff8a00',
  				'800': '#ff7a00',
  				'900': '#ff6b00'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
