"use server";

import { searchMovie } from './TMDBActions';
import axios from 'axios';
import { Movie } from './TMDBUtils';

const TASTEDIVE_API_KEY = process.env.TASTEDIVE_API_KEY || process.env.NEXT_PUBLIC_TASTEDIVE_API_KEY;

interface TasteDiveResult {
    name: string;
    type: string;
    wTeaser?: string;
    wUrl?: string;
    yUrl?: string;
    yID?: string;
}

interface TasteDiveResponse {
    similar: {
        info: TasteDiveResult[];
        results: TasteDiveResult[];
    };
}

export const getTasteDiveRecommendations = async (query: string): Promise<Movie[]> => {
    // If no key is provided, we might still be able to hit the API if it allows limited public access, 
    // but typically it requires a key. We'll proceed assuming a key might be added or we handle the 403.
    // NOTE: The user needs to add TASTEDIVE_API_KEY to their .env

    try {
        // Documentation ambiguity: The 'Response' section of the docs mentions 'verbose=1', 
        // but the 'Parameters' section only lists 'info=1'. 
        // A 400 Bad Request suggests 'verbose' might be an invalid parameter. Reverting to only 'info=1'.
        const response = await axios.get<TasteDiveResponse>("https://tastedive.com/api/similar", {
            params: {
                q: query.replace(":", ""),
                type: "movie",
                info: "1",
                limit: "10",
                k: TASTEDIVE_API_KEY
            }
        });

        const data = response.data;
        console.log(data);
        const results = data?.similar?.results || [];

        // Now resolve these names to TMDB objects
        const moviePromises = results.map(async (item) => {
            const tmdbResults = await searchMovie(item.name);
            // Return the first match that is a movie
            return tmdbResults.length > 0 ? tmdbResults[0] : null;
        });

        const allowedMovies = (await Promise.all(moviePromises)).filter((m): m is Movie => m !== null);

        // Filter out duplicates based on ID (just in case)
        const uniqueMovies = Array.from(new Map(allowedMovies.map(m => [m.id, m])).values());

        return uniqueMovies;

    } catch (error) {
        console.error("Error fetching TasteDive recommendations:", error);
        return [];
    }
};
