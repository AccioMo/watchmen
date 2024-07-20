import axios from "axios";

const TMDB_ACCESS_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN;

const tmdbAPI = axios.create({
	baseURL: "https://api.themoviedb.org/3/",
	headers: {
		"Authorization": `Bearer ${TMDB_ACCESS_TOKEN}`,
		accept: "application/json",
	},
});

export { tmdbAPI };