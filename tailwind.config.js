/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
	  ],
	theme: {
		extend: {
			colors: {
				"primary": "#2D1E2F",
				"glass": "rgba(128, 128, 128, 0.25)",
				"imdb": "#deb522",
				"roto": "#7a2f2f",
			},
		},
	},
	plugins: [],
};
