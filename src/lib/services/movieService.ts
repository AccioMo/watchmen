import prisma from '../prisma';

export const upsertMovie = async (data: {
    tmdb_id: number;
    imdb_id: string; // Required by schema
    tmdb_rating?: number;
    imdb_rating?: number;
    rt_rating?: number;
    metacritic_rating?: number;
}) => {
    if (!data.imdb_id) {
        console.warn(`Skipping upsert for movie TMDB:${data.tmdb_id} because imdb_id is missing.`);
        return null;
    }

    try {
        const movie = await prisma.movie.upsert({
            where: {
                tmdb_id: data.tmdb_id,
            },
            update: {
                imdb_id: data.imdb_id,
                ...(data.tmdb_rating !== undefined && { tmdb_rating: data.tmdb_rating }),
                ...(data.imdb_rating !== undefined && { imdb_rating: data.imdb_rating }),
                ...(data.rt_rating !== undefined && { rt_rating: data.rt_rating }),
                ...(data.metacritic_rating !== undefined && { metacritic_rating: data.metacritic_rating }),
            },
            create: {
                tmdb_id: data.tmdb_id,
                imdb_id: data.imdb_id,
                tmdb_rating: data.tmdb_rating,
                imdb_rating: data.imdb_rating,
                rt_rating: data.rt_rating,
                metacritic_rating: data.metacritic_rating,
            },
        });
        return movie;
    } catch (error) {
        console.error('Error upserting movie:', error);
        return null;
    }
};

export const updateMovieRatings = async (imdb_id: string, ratings: {
    imdb_rating?: number;
    rt_rating?: number;
    metacritic_rating?: number;
}) => {
    if (!imdb_id) return null;

    try {
        // We can only update if it exists because we might not have tmdb_id here to create it
        // Unless we assume we can create with just imdb_id? Schema says tmdb_id is Int (Required).
        // So we can only update existing movies found by imdb_id.
        const movie = await prisma.movie.update({
            where: { imdb_id },
            data: {
                ...(ratings.imdb_rating !== undefined && { imdb_rating: ratings.imdb_rating }),
                ...(ratings.rt_rating !== undefined && { rt_rating: ratings.rt_rating }),
                ...(ratings.metacritic_rating !== undefined && { metacritic_rating: ratings.metacritic_rating }),
            },
        });
        return movie;
    } catch (error) {
        // It's possible the movie doesn't exist yet if we only hit this from OMDB before visiting the main page
        // In that case, we silently fail or warn, as we lack the mandatory tmdb_id to create it.
        // console.warn(`Could not update ratings for IMDB:${imdb_id} - likely not in DB yet.`);
        return null;
    }
};
