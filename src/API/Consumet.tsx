import axios from "axios";

const CONSUMET_BASE_URL = process.env.NEXT_PUBLIC_CONSUMET_API_URL || "http://localhost:4000";

const consumetAPI = axios.create({
	baseURL: `${CONSUMET_BASE_URL}/`,
	headers: {
		accept: "application/json",
	},
	timeout: 15000,
});

export interface ConsumetResult {
	id: string;
	title: string;
	url: string;
	image: string;
	releaseDate?: string;
	type?: string;
}

export interface StreamingServer {
	name: string;
	url: string;
	id?: string;
}

export interface StreamingLinks {
	sources: Array<{
		url: string;
		isM3U8: boolean;
		quality?: string;
	}>;
	subtitles?: Array<{
		lang: string;
		url: string;
	}>;
}

export interface MovieDetails {
	id: string;
	title: string;
	url: string;
	image: string;
	description?: string;
	genres?: string[];
	type?: string;
	casts?: string[];
	production?: string;
	duration?: string;
	releaseDate?: string;
	episodes?: Array<{
		id: string;
		number: number;
		title?: string;
		url: string;
		image?: string;
		releaseDate?: string;
		description?: string;
	}>;
}

export interface SearchResponse {
	currentPage: number;
	hasNextPage: boolean;
	results: ConsumetResult[];
}

/**
 * Search for a movie on Consumet API (FlixHQ provider)
 * @param query - Movie title to search for
 * @param page - Page number for pagination (default: 1)
 * @returns Search results with pagination info
 */
export const searchConsumetMovie = async (
	query: string,
	page: number = 1
): Promise<ConsumetResult[]> => {
	if (!query || query.trim() === "") return [];

	try {
		const response = await consumetAPI.get(`movies/flixhq/${query}?page=${page}`);
		return response?.data?.results || [];
	} catch (error) {
		console.warn(`Consumet movie search failed for "${query}":`, error);
		return [];
	}
};

/**
 * Get detailed movie information including episodes
 * @param movieId - ID of the movie (from search results)
 * @returns Movie details with episodes information
 */
export const getConsumetMovieInfo = async (
	movieId: string
): Promise<MovieDetails | null> => {
	if (!movieId || movieId.trim() === "") return null;

	try {
		const response = await consumetAPI.get(`movies/flixhq/info`, {
			params: { id: movieId },
		});

		const data = response?.data || {};
		return {
			id: data.id || movieId,
			title: data.title || "",
			url: data.url || "",
			image: data.image || "",
			description: data.description,
			genres: data.genres,
			type: data.type,
			casts: data.casts,
			production: data.production,
			duration: data.duration,
			releaseDate: data.releaseDate,
			episodes: data.episodes || [],
		};
	} catch (error) {
		console.warn(`Failed to fetch movie info for "${movieId}":`, error);
		return null;
	}
};

/**
 * Get available servers for a specific episode
 * @param mediaId - The media/movie ID
 * @param episodeId - The episode ID (default: 1 for movies)
 * @returns Array of available streaming servers
 */
export const getConsumetMovieServers = async (
	mediaId: string,
	episodeId: string = "1"
): Promise<StreamingServer[]> => {
	if (!mediaId) return [];

	try {
		const response = await consumetAPI.get(`movies/flixhq/servers?mediaId=${mediaId}&episodeId=${episodeId}`);

		const data = response?.data || [];
		// Response is typically an array of servers
		if (Array.isArray(data)) {
			return data.map((server: any) => ({
				name: server.name || "Unknown Server",
				url: server.url || "",
			}));
		}
		return [];
	} catch (error) {
		console.warn("Failed to fetch movie servers:", error);
		return [];
	}
};

/**
 * Get streaming links from a specific server
 * @param mediaId - The media/movie ID
 * @param server - The server name to fetch from
 * @param episodeId - The episode ID (default: 1 for movies)
 * @returns Streaming links with sources and subtitles
 */
export const getConsumetStreamingLinks = async (
	mediaId: string,
	server: string,
	episodeId: string = "1"
): Promise<StreamingLinks | null> => {
	if (!mediaId || !server) return null;

	try {
		const url = `movies/flixhq/watch?mediaId=${mediaId}&episodeId=${episodeId}&server=${server}`;
		console.log('🔗 Fetching streaming links:', {
			url,
			mediaId,
			episodeId,
			server
		});

		const response = await consumetAPI.get(url);
		const data = response?.data || {};

		console.log('📦 Streaming links response:', {
			sourcesCount: data.sources?.length || 0,
			subtitlesCount: data.subtitles?.length || 0,
			firstSource: data.sources?.[0] ? {
				url: data.sources[0].url?.substring(0, 100),
				quality: data.sources[0].quality,
				isM3U8: data.sources[0].isM3U8
			} : null
		});

		return {
			sources: data.sources || [],
			subtitles: data.subtitles || [],
		};
	} catch (error) {
		console.warn("Failed to fetch streaming links:", error);
		return null;
	}
};

/**
 * Search for a TV show on Consumet API
 * @param query - TV show title to search for
 * @returns Array of matching results or empty array if not found
 */
export const searchConsumetTV = async (
	query: string
): Promise<ConsumetResult[]> => {
	if (!query || query.trim() === "") return [];

	try {
		const response = await consumetAPI.get("tv/dramacool/search", {
			params: { query: query.trim() },
		});
		return response?.data?.results || [];
	} catch (error) {
		console.warn(`Consumet TV search failed for "${query}":`, error);
		return [];
	}
};

/**
 * Search for anime on Consumet API
 * @param query - Anime title to search for
 * @returns Array of matching results or empty array if not found
 */
export const searchConsumetAnime = async (
	query: string
): Promise<ConsumetResult[]> => {
	if (!query || query.trim() === "") return [];

	try {
		const response = await consumetAPI.get("anime/gogoanime/search", {
			params: { query: query.trim() },
		});
		return response?.data?.results || [];
	} catch (error) {
		console.warn(`Consumet anime search failed for "${query}":`, error);
		return [];
	}
};

/**
 * Check if a movie/show is available on Consumet
 * Searches movies, TV shows, and anime
 * @param title - Title to search for
 * @returns true if found on any platform, false otherwise
 */
export const isMediaAvailableOnConsumet = async (
	title: string
): Promise<boolean> => {
	if (!title || title.trim() === "") return false;

	try {
		const [movies, tvShows, anime] = await Promise.all([
			searchConsumetMovie(title),
			searchConsumetTV(title),
			searchConsumetAnime(title),
		]);

		return movies.length > 0 || tvShows.length > 0 || anime.length > 0;
	} catch (error) {
		console.warn("Error checking media availability:", error);
		return false;
	}
};

export { consumetAPI };