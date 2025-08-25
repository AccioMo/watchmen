/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
	  ],
	theme: {
		extend: {
			colors: {
				"primary": "var(--color-primary)",
				"primary-rgb": "rgb(var(--color-primary-rgb-value))",
				"secondary": "var(--color-secondary)",
				"secondary-rgb": "rgb(var(--color-secondary-rgb-value))",
				"accent": "var(--color-accent)",
				"accent-rgb": "rgb(var(--color-accent-rgb-value))",
				"glass": "rgba(var(--glass-rgb), 0.1)",
				"glass-border": "rgba(var(--glass-rgb), 0.15)",
				"imdb": "var(--color-imdb)",
				"imdb-rgb": "rgb(var(--color-imdb-rgb-value))",
				"roto": "var(--color-roto)",
				"roto-rgb": "rgb(var(--color-roto-rgb-value))",
			},
			animation: {
				'float': 'float 6s ease-in-out infinite',
				'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'blob': 'blob 7s infinite',
			},
			keyframes: {
				float: {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-20px)' },
				},
				blob: {
					'0%': { transform: 'translate(0px, 0px) scale(1)' },
					'33%': { transform: 'translate(30px, -50px) scale(1.1)' },
					'66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
					'100%': { transform: 'translate(0px, 0px) scale(1)' },
				}
			}
		},
	},
	plugins: [
		function({ addUtilities }) {
			const newUtilities = {
				'.line-clamp-1': {
					overflow: 'hidden',
					display: '-webkit-box',
					'-webkit-box-orient': 'vertical',
					'-webkit-line-clamp': '1',
				},
				'.line-clamp-2': {
					overflow: 'hidden',
					display: '-webkit-box',
					'-webkit-box-orient': 'vertical',
					'-webkit-line-clamp': '2',
				},
				'.line-clamp-3': {
					overflow: 'hidden',
					display: '-webkit-box',
					'-webkit-box-orient': 'vertical',
					'-webkit-line-clamp': '3',
				},
			}
			addUtilities(newUtilities)
		}
	],
};
