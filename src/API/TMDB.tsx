import axios from "axios";
import genresData from "../../genres.json";

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

export interface MovieDetails extends Movie {
    runtime: number;
    genres: { id: number; name: string }[];
    production_companies: { id: number; name: string; logo_path?: string }[];
    production_countries: { iso_3166_1: string; name: string }[];
    spoken_languages: { iso_639_1: string; name: string }[];
    budget: number;
    revenue: number;
    tagline: string;
    status: string;
}

const tmdbAPI = axios.create({
    baseURL: "https://api.themoviedb.org/3/",
    headers: {
        Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
        accept: "application/json",
    },
});

const getTMDBMoviesBy = async (
    by: string,
    pageNum: number | 1
): Promise<Movie[]> => {
    if (pageNum < 1 || by === "") return [];

    if (!TMDB_ACCESS_TOKEN) {
        console.error("TMDB Access Token is not configured");
        return [];
    }

    return tmdbAPI
        .get(`movie/${by}?language=en-US&page=${pageNum}`)
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

const getTMDBMoviesByNew = async (
    pageNum: number = 1
): Promise<Movie[]> => {
    if (pageNum < 1) return [];

    if (!TMDB_ACCESS_TOKEN) {
        console.error("TMDB Access Token is not configured");
        return [];
    }

    return tmdbAPI
        .get(`movie/now_playing?language=en-US&page=${pageNum}`)
        .then((response) => {
            return response?.data?.results || [];
        })
        .catch((error) => {
            if (error.response?.status === 401) {
                console.error("Unauthorized: Check your TMDB API key and access token");
            } else if (error.response?.status === 429) {
                console.error("Rate limit exceeded: Too many requests to TMDB API");
            } else {
                console.error("Error fetching TMDB movies by genre:", error.message);
            }
            return [];
        });
};

/**
 * Translate a genre name (case-insensitive) to its TMDB genre id.
 * Returns the id or null if not found.
 */
const getGenreIdByName = (name: string): number | null => {
    if (!name || typeof name !== "string") return null;
    const normalized = name.trim().toLowerCase();
    const found = (genresData.genres || []).find(
        (g: { id: number; name: string }) => g.name.toLowerCase() === normalized
    );
    return found ? found.id : null;
};

/**
 * Convenience: fetch movies by genre name (case-insensitive). Returns [] on error or not found.
 */
const getTMDBMoviesByGenreName = async (
    genreName: string,
    pageNum: number = 1
): Promise<Movie[]> => {
    const id = getGenreIdByName(genreName);
    if (!id) {
        console.error(`Genre not found for name: ${genreName}`);
        return [];
    }
    return getTMDBMoviesByGenre(id, pageNum);
};

/**
 * Fetch movies by genre id using TMDB's discover endpoint.
 * Returns an array of Movie or empty array on error/invalid input.
 */
const getTMDBMoviesByGenre = async (
    genreId: number,
    pageNum: number = 1
): Promise<Movie[]> => {
    if (!genreId || typeof genreId !== "number" || pageNum < 1) return [];

    if (!TMDB_ACCESS_TOKEN) {
        console.error("TMDB Access Token is not configured");
        return [];
    }

    return tmdbAPI
        .get(`discover/movie?language=en-US&with_genres=${genreId}&page=${pageNum}`)
        .then((response) => {
            return response?.data?.results || [];
        })
        .catch((error) => {
            if (error.response?.status === 401) {
                console.error("Unauthorized: Check your TMDB API key and access token");
            } else if (error.response?.status === 429) {
                console.error("Rate limit exceeded: Too many requests to TMDB API");
            } else {
                console.error("Error fetching TMDB movies by genre:", error.message);
            }
            return [];
        });
};

/**
 * Fetch detailed movie information by movie ID
 * @param movieId - The TMDB movie ID
 * @returns Movie details or null if not found
 */
const getMovieById = async (movieId: number | string): Promise<MovieDetails | null> => {
    if (!movieId) return null;

    if (!TMDB_ACCESS_TOKEN) {
        console.error("TMDB Access Token is not configured");
        return null;
    }

    try {
        const response = await tmdbAPI.get(`movie/${movieId}?language=en-US`);
        return response?.data || null;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                console.error("Unauthorized: Check your TMDB API key and access token");
            } else if (error.response?.status === 429) {
                console.error("Rate limit exceeded: Too many requests to TMDB API");
            } else if (error.response?.status === 404) {
                console.error(`Movie with ID ${movieId} not found`);
            } else {
                console.error("Error fetching movie details:", error.message);
            }
        }
        return null;
    }
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

const getMovieReviews = async (movieId: number | string) => {
    if (!movieId) return { results: [] };
    if (!TMDB_ACCESS_TOKEN) return { results: [] };

    try {
        const response = await tmdbAPI.get(`movie/${movieId}/reviews?language=en-US`);
        return response?.data || { results: [] };
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return { results: [] };
    }
};

const getPersonDetails = async (personId: number | string) => {
    if (!personId) return null;
    if (!TMDB_ACCESS_TOKEN) return null;

    try {
        const response = await tmdbAPI.get(`person/${personId}?language=en-US`);
        return response?.data || null;
    } catch (error) {
        console.error("Error fetching person details:", error);
        return null;
    }
};

const getPersonCombinedCredits = async (personId: number | string) => {
    if (!personId) return { cast: [], crew: [] };
    if (!TMDB_ACCESS_TOKEN) return { cast: [], crew: [] };

    try {
        const response = await tmdbAPI.get(`person/${personId}/combined_credits?language=en-US`);
        return response?.data || { cast: [], crew: [] };
    } catch (error) {
        console.error("Error fetching person credits:", error);
        return { cast: [], crew: [] };
    }
};

const getMovieCredits = async (movieId: number | string) => {
    if (!movieId) return { cast: [], crew: [] };
    if (!TMDB_ACCESS_TOKEN) return { cast: [], crew: [] };

    try {
        const response = await tmdbAPI.get(`movie/${movieId}/credits?language=en-US`);
        return response?.data || { cast: [], crew: [] };
    } catch (error) {
        console.error("Error fetching credits:", error);
        return { cast: [], crew: [] };
    }
};

const getSimilarMovies = async (movieId: number | string) => {
    if (!movieId) return [];
    if (!TMDB_ACCESS_TOKEN) return [];

    try {
        const response = await tmdbAPI.get(`movie/${movieId}/similar?language=en-US`);
        return response?.data?.results || [];
    } catch (error) {
        console.error("Error fetching similar movies:", error);
        return [];
    }
};

const getMovieVideos = async (movieId: number | string) => {
    if (!movieId) return { results: [] };
    if (!TMDB_ACCESS_TOKEN) return { results: [] };

    try {
        const response = await tmdbAPI.get(`movie/${movieId}/videos?language=en-US`);
        return response?.data || { results: [] };
    } catch (error) {
        console.error("Error fetching videos:", error);
        return { results: [] };
    }
};

const searchMovie = async (query: string) => {
    if (!query) return [];
    if (!TMDB_ACCESS_TOKEN) return [];

    try {
        const response = await tmdbAPI.get(`search/movie?query=${encodeURIComponent(query)}&language=en-US&page=1`);
        return response?.data?.results || [];
    } catch (error) {
        console.error("Error searching movie:", error);
        return [];
    }
};


interface DiscoverOptions {
    sort_by?: string;
    with_genres?: string;
    primary_release_year?: number;
    "primary_release_date.gte"?: string;
    "primary_release_date.lte"?: string;
    "vote_average.gte"?: number;
    "vote_average.lte"?: number;
    "vote_count.gte"?: number;
    "with_runtime.gte"?: number;
    "with_runtime.lte"?: number;
    page?: number;
}

const discoverMovies = async (options: DiscoverOptions = {}): Promise<Movie[]> => {
    if (!TMDB_ACCESS_TOKEN) {
        console.error("TMDB Access Token is not configured");
        return [];
    }

    const params = new URLSearchParams({
        language: "en-US",
        page: (options.page || 1).toString(),
        include_adult: "false",
        include_video: "false",
        ...Object.fromEntries(
            Object.entries(options).map(([key, value]) => [key, value?.toString() || ""])
        )
    });

    // Remove empty params
    for (const [key, value] of Array.from(params.entries())) {
        if (!value) params.delete(key);
    }

    return tmdbAPI
        .get(`discover/movie?${params.toString()}`)
        .then((response) => {
            return response?.data?.results || [];
        })
        .catch((error) => {
            console.error("Error discovering movies:", error);
            return [];
        });
};

export {
    tmdbAPI,
    getTMDBMoviesBy,
    getTMDBMoviesByNew,
    getTMDBMoviesByGenre,
    getTMDBMoviesByGenreName,
    getGenreIdByName,
    getMovieById,
    getImageURL,
    getMoviePoster,
    getMovieReviews,
    getPersonDetails,
    getPersonCombinedCredits,
    getMovieCredits,
    getSimilarMovies,
    getMovieVideos,
    searchMovie,
    discoverMovies,
};
