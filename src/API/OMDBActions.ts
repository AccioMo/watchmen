"use server";

const OMDB_API_KEY = process.env.OMDB_API_KEY;
const BASE_URL = "http://www.omdbapi.com/";

export interface OMDBRatings {
    imdb: string | null;
    rottenTomatoes: string | null;
    metacritic: string | null;
}

export const getOMDBRatings = async (imdbId: string): Promise<OMDBRatings> => {
    if (!OMDB_API_KEY) {
        console.error("OMDB_API_KEY is missing!");
        return { imdb: null, rottenTomatoes: null, metacritic: null };
    }

    if (!imdbId) return { imdb: null, rottenTomatoes: null, metacritic: null };

    try {
        const url = `${BASE_URL}?i=${imdbId}&apikey=${OMDB_API_KEY}`;
        const response = await fetch(url, { next: { revalidate: 3600 * 24 } }); // Cache for 24 hours

        if (!response.ok) {
            console.error(`OMDB Error: ${response.status}`);
            return { imdb: null, rottenTomatoes: null, metacritic: null };
        }

        const data = await response.json();

        if (data.Response === "False") {
            console.warn("OMDB API Error:", data.Error);
            return { imdb: null, rottenTomatoes: null, metacritic: null };
        }

        const ratings = {
            imdb: data.imdbRating && data.imdbRating !== "N/A" ? data.imdbRating : null,
            rottenTomatoes: null,
            metacritic: data.Metascore && data.Metascore !== "N/A" ? data.Metascore : null,
        } as OMDBRatings;

        if (data.Ratings && Array.isArray(data.Ratings)) {
            const rt = data.Ratings.find((r: { Source: string; Value: string }) => r.Source === "Rotten Tomatoes");
            if (rt) {
                ratings.rottenTomatoes = rt.Value;
            }
        }

        return ratings;
    } catch (error) {
        console.error("Fetch OMDB failed:", error);
        return { imdb: null, rottenTomatoes: null, metacritic: null };
    }
};
