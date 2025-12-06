/** @type {import('next').NextConfig} */
const nextConfig = {
	// Removed output: "export" to enable dynamic routes
	// distDir: "./dist", // Changes the build output directory to `./dist/`.
	images: {
		domains: ['image.tmdb.org'], // Allow TMDB images
	},
};

export default nextConfig;
