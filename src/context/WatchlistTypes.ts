import { Movie, TVShow } from "../API/TMDB";

export type WatchlistItem = (Movie & { media_type: "movie" }) | (TVShow & { media_type: "tv" });
