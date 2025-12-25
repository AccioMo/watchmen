import genresData from "../../genres.json";

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
    imdb_id: string;
}

export interface TVShow {
    id: number;
    name: string;
    overview: string;
    backdrop_path: string;
    poster_path: string;
    first_air_date: string;
    vote_average: number;
    vote_count: number;
    genre_ids: number[];
    original_language: string;
    original_name: string;
    popularity: number;
}

export interface TVShowDetails extends TVShow {
    episode_run_time: number[];
    genres: { id: number; name: string }[];
    networks: { id: number; name: string; logo_path?: string }[];
    production_companies: { id: number; name: string; logo_path?: string }[];
    production_countries: { iso_3166_1: string; name: string }[];
    spoken_languages: { iso_639_1: string; name: string }[];
    status: string;
    tagline: string;
    number_of_episodes: number;
    number_of_seasons: number;
}

/**
 * Translate a genre name (case-insensitive) to its TMDB genre id.
 * Returns the id or null if not found.
 */
export const getGenreIdByName = (name: string): number | null => {
    if (!name || typeof name !== "string") return null;
    const normalized = name.trim().toLowerCase();
    const found = (genresData.genres || []).find(
        (g: { id: number; name: string }) => g.name.toLowerCase() === normalized
    );
    return found ? found.id : null;
};

export const getImageURL = (imageID: string, quality: string): string => {
    switch (quality) {
        case "max":
            return `https://image.tmdb.org/t/p/original/${imageID}`;
        case "tiny":
            return `https://image.tmdb.org/t/p/w92/${imageID}`;
        case "min":
            return `https://image.tmdb.org/t/p/w500/${imageID}`;
        default:
            return `https://image.tmdb.org/t/p/w1280/${imageID}`;
    }
};
