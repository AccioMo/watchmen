/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
	  ],
	theme: {
		extend: {
			colors: {
				"primary": "#0d0d0d",
				"secondary": "#0c0c0c",
				"accent": "#0a0a0a",
				"glass": "rgba(255, 255, 255, 0.1)",
				"glass-border": "rgba(255, 255, 255, 0.15)",
				"imdb": "#deb522",
				"roto": "#ef4444",
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
