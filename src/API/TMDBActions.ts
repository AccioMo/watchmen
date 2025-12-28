"use server";

import { Movie, MovieDetails, TVShow, TVShowDetails, getGenreIdByName } from "./TMDBUtils";

import { upsertMovie } from "../lib/services/movieService";

const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN
const BASE_URL = "https://api.themoviedb.org/3/";

const fetchTMDB = async (endpoint: string, params: Record<string, string> = {}) => {
    if (!TMDB_ACCESS_TOKEN) {
        console.error("TMDB_ACCESS_TOKEN is missing on server!");
        throw new Error("Missing TMDB Access Token");
    }

    const url = new URL(BASE_URL + endpoint);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    try {
        const response = await fetch(url.toString(), {
            headers: {
                Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
                accept: "application/json",
            },
            next: { revalidate: 3600 } // Cache for 1 hour default
        });

        if (!response.ok) {
            console.error(`TMDB Error: ${response.status} ${response.statusText} for ${url}`);
            if (response.status === 401) throw new Error("Unauthorized");
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error("Fetch TMDB failed:", error);
        return null;
    }
};

export const getTMDBMoviesBy = async (
    by: string,
    pageNum: number | 1
): Promise<Movie[]> => {
    if (pageNum < 1 || by === "") return [];

    return fetchTMDB(`movie/${by}`, { language: "en-US", page: pageNum.toString() })
        .then((data) => data?.results || []);
};

export const getTMDBMoviesByNew = async (
    pageNum: number = 1
): Promise<Movie[]> => {
    if (pageNum < 1) return [];

    return fetchTMDB("movie/now_playing", { language: "en-US", page: pageNum.toString() })
        .then((data) => data?.results || []);
};

/**
 * Convenience: fetch movies by genre name (case-insensitive). Returns [] on error or not found.
 */
export const getTMDBMoviesByGenreName = async (
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
export const getTMDBMoviesByGenre = async (
    genreId: number,
    pageNum: number = 1
): Promise<Movie[]> => {
    if (!genreId || typeof genreId !== "number" || pageNum < 1) return [];

    return fetchTMDB("discover/movie", {
        language: "en-US",
        with_genres: genreId.toString(),
        page: pageNum.toString()
    }).then((data) => data?.results || []);
};

/**
 * Fetch detailed movie information by movie ID
 * @param movieId - The TMDB movie ID
 * @returns Movie details or null if not found
 */
export const getMovieById = async (movieId: number | string): Promise<MovieDetails | null> => {
    if (!movieId) return null;
    const data = await fetchTMDB(`movie/${movieId}`, { language: "en-US" });

    if (data) {
        // Fire and forget upsert to not block the response
        upsertMovie({
            tmdb_id: data.id,
            imdb_id: data.imdb_id,
            tmdb_rating: data.vote_average
        }).catch(err => console.error("Failed to cache movie:", err));
    }

    return data;
};

export const getMovieReviews = async (movieId: number | string) => {
    if (!movieId) return { results: [] };
    const data = await fetchTMDB(`movie/${movieId}/reviews`, { language: "en-US" });
    return data || { results: [] };
};

export const getPersonDetails = async (personId: number | string) => {
    if (!personId) return null;
    return fetchTMDB(`person/${personId}`, { language: "en-US" });
};

export const getPersonCombinedCredits = async (personId: number | string) => {
    if (!personId) return { cast: [], crew: [] };
    const data = await fetchTMDB(`person/${personId}/combined_credits`, { language: "en-US" });
    return data || { cast: [], crew: [] };
};

export const getMovieCredits = async (movieId: number | string) => {
    if (!movieId) return { cast: [], crew: [] };
    const data = await fetchTMDB(`movie/${movieId}/credits`, { language: "en-US" });
    return data || { cast: [], crew: [] };
};

export const getSimilarMovies = async (movieId: number | string) => {
    if (!movieId) return [];
    const data = await fetchTMDB(`movie/${movieId}/similar`, { language: "en-US" });
    return data?.results || [];
};

export const getMovieVideos = async (movieId: number | string) => {
    if (!movieId) return { results: [] };
    const data = await fetchTMDB(`movie/${movieId}/videos`, { language: "en-US" });
    return data || { results: [] };
};

export const searchMovie = async (query: string) => {
    if (!query) return [];
    const data = await fetchTMDB(`search/movie`, {
        query: query,
        language: "en-US",
        page: "1"
    });
    return data?.results || [];
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

export const discoverMovies = async (options: DiscoverOptions = {}): Promise<Movie[]> => {
    const params: Record<string, string> = {
        language: "en-US",
        page: (options.page || 1).toString(),
        include_adult: "false",
        include_video: "false",
        ...Object.fromEntries(
            Object.entries(options).map(([key, value]) => [key, value?.toString() || ""])
        )
    };

    // Remove empty params
    Object.keys(params).forEach(key => !params[key] && delete params[key]);

    const data = await fetchTMDB("discover/movie", params);
    return data?.results || [];
};

export const getReviewById = async (reviewId: string) => {
    if (!reviewId) return null;
    return fetchTMDB(`review/${reviewId}`);
};

// TV Show Actions

export const getTMDBTVShowsBy = async (
    by: string,
    pageNum: number = 1
): Promise<TVShow[]> => {
    if (pageNum < 1 || by === "") return [];

    return fetchTMDB(`tv/${by}`, { language: "en-US", page: pageNum.toString() })
        .then((data) => data?.results || []);
};

export const getTMDBTVShowsByAiringToday = async (
    pageNum: number = 1
): Promise<TVShow[]> => {
    return getTMDBTVShowsBy("airing_today", pageNum);
};

export const getTVShowById = async (tvId: number | string): Promise<TVShowDetails | null> => {
    if (!tvId) return null;
    return fetchTMDB(`tv/${tvId}`, { language: "en-US" });
};

export const getTVShowCredits = async (tvId: number | string) => {
    if (!tvId) return { cast: [], crew: [] };
    const data = await fetchTMDB(`tv/${tvId}/credits`, { language: "en-US" });
    return data || { cast: [], crew: [] };
};

export const getSimilarTVShows = async (tvId: number | string): Promise<TVShow[]> => {
    if (!tvId) return [];
    const data = await fetchTMDB(`tv/${tvId}/similar`, { language: "en-US" });
    return data?.results || [];
};

export const getTVShowVideos = async (tvId: number | string) => {
    if (!tvId) return { results: [] };
    const data = await fetchTMDB(`tv/${tvId}/videos`, { language: "en-US" });
    return data || { results: [] };
};

export const searchTVShow = async (query: string): Promise<TVShow[]> => {
    if (!query) return [];
    const data = await fetchTMDB(`search/tv`, {
        query: query,
        language: "en-US",
        page: "1"
    });
    return data?.results || [];
};
