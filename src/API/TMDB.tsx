import axios from "axios";

const TMDB_ACCESS_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN;

const tmdbAPI = axios.create({
	baseURL: "https://api.themoviedb.org/3/",
	headers: {
		"Authorization": `Bearer ${TMDB_ACCESS_TOKEN}`,
		accept: "application/json",
	},
});

const getPopularMovies = async (pageNum: number | 1): Promise<any> => {
	return tmdbAPI
		.get(`movie/top_rated?language=en-US&page=${pageNum}`)
		.then((response) => {
			return response?.data?.results;
		})
		.catch((error) => {
			console.error(error);
			return [];
		});
};

const getMoviePoster = async (quality: number, path: string) => {
	axios.get(
		`https://image.tmdb.org/t/p/w${quality}/${path}`
	)
	.then((response) => {
		return response;
	})
	.catch((error) => {
		console.error(error);
		return null;
	});
};

export { tmdbAPI, getPopularMovies, getMoviePoster };