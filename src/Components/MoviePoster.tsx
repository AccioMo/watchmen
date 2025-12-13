import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { getImageURL, Movie } from "../API/TMDB";
import LazyImage from "./LazyImage";

type Props = {
    movie: Movie;
    className?: string;
    /** Image quality key for TMDB path: 'min' | 'mid' | 'max'. Default: 'mid' */
    imageQualityKey?: 'min' | 'mid' | 'max';
    showInfo?: boolean;
};

const MoviePoster: React.FC<Props> = ({ movie, className = "", imageQualityKey = 'mid' }) => {
    const router = useRouter();
    const [imageErrored, setImageErrored] = useState(false);

    // Get URLs for both tiny placeholder and actual image
    const imageUrl = movie.poster_path ? getImageURL(movie.poster_path, imageQualityKey) : '';
    const tinyUrl = movie.poster_path ? getImageURL(movie.poster_path, 'tiny') : '';

    const handleClick = useCallback(() => {
        router.push(`/movie/${movie.id}`);
    }, [router, movie.id]);

    const placeholder = (
        <div className="h-full w-full flex items-center justify-center bg-neutral-800 text-neutral-600">
            <div className="w-12 h-12 rounded-full bg-neutral-700/50" />
        </div>
    );

    return (
        <div className={`relative transition-all duration-300 h-full w-full group shadow-xl cursor-pointer ${className}`} onClick={handleClick}>
            {/* Hover overlay */}
            <div className="select-none h-full w-full border-none bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-0 group-hover:opacity-100 top-0 left-0 absolute z-10 transition-all duration-300 pointer-events-none">
                <div className="flex items-end p-4 h-full w-full">
                    <div className="w-full text-white">
                        <h3 className="text-lg font-bold mb-2 text-white drop-shadow-lg line-clamp-2">{movie.title}</h3>
                        <p className="text-xs text-white/90 leading-relaxed line-clamp-3">{movie.overview}</p>
                        <div className="mt-3 flex items-center gap-2">
                            <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">★ {movie.vote_average.toFixed ? movie.vote_average.toFixed(1) : movie.vote_average}</span>
                            <span className="text-xs text-white/70">{movie.release_date ? new Date(movie.release_date).getFullYear() : ''}</span>
                        </div>
                    </div>
                </div>
            </div>

            {!imageUrl || imageErrored ? (
                placeholder
            ) : (
                <LazyImage
                    src={imageUrl}
                    placeholderSrc={tinyUrl}
                    alt={movie.title}
                    fill
                    className="object-cover h-full w-full"
                    sizes="(min-width: 1280px) 16vw, (min-width: 1024px) 20vw, (min-width: 640px) 30vw, 45vw"
                    onError={() => setImageErrored(true)}
                />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none"></div>
        </div>
    );
};

export default React.memo(MoviePoster);
