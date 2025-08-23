import axios from "axios";

const TMDB_ACCESS_TOKEN = process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN;

export type JSONValue =
	| string
	| number
	| boolean
	| { [x: string]: JSONValue }
	| Array<JSONValue>;

export interface Movie {
	id: number;
	title: string;
	overview: string;
	backdrop_path: string;
	poster_path: string;
	release_date: string;
	vote_average: number;
	vote_count: number;
	genre_ids: number[];
	adult: boolean;
	original_language: string;
	original_title: string;
	popularity: number;
	video: boolean;
}

const tmdbAPI = axios.create({
	baseURL: "https://api.themoviedb.org/3/",
	headers: {
		Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
		accept: "application/json",
	},
});

const getTMDBMovies = async (
	path: string,
	pageNum: number | 1
): Promise<Movie[]> => {
	if (pageNum < 1 || path === "") return [];
	
	if (!TMDB_ACCESS_TOKEN) {
		console.error("TMDB Access Token is not configured");
		return [];
	}
	
	return tmdbAPI
		.get(`movie/${path}?language=en-US&page=${pageNum}`)
		.then((response) => {
			return response?.data?.results || [];
		})
		.catch((error) => {
			if (error.response?.status === 401) {
				console.error("Unauthorized: Check your TMDB API key and access token");
			} else if (error.response?.status === 429) {
				console.error("Rate limit exceeded: Too many requests to TMDB API");
			} else {
				console.error("Error fetching TMDB movies:", error.message);
			}
			return [];
		});
};

const getImageURL = (imageID: string, quality: string): string => {
	switch (quality) {
		case "max":
			return `https://image.tmdb.org/t/p/original/${imageID}`;
		case "min":
			return `https://image.tmdb.org/t/p/w500/${imageID}`;
		default:
			return `https://image.tmdb.org/t/p/w1280/${imageID}`;
	}
};

const getMoviePoster = async (quality: number, path: string) => {
	axios
		.get(`https://image.tmdb.org/t/p/w${quality}/${path}`)
		.then((response) => {
			return response;
		})
		.catch((error) => {
			console.error(error);
			return null;
		});
};

export { tmdbAPI, getTMDBMovies, getImageURL, getMoviePoster };
