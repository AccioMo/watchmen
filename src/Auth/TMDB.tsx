import axios from "axios";

const TMDB_API_KEY = import.meta.env.TMDB_API_KEY;

const tmdbAPI = axios.create({
	baseURL: "https://api.themoviedb.org/3/",
	headers: {
		"Content-Type": `Bearer ${TMDB_API_KEY}`,
		accept: "application/json",
	},
});

export { tmdbAPI };