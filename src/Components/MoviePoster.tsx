import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from 'next/image';
import { useRouter } from "next/navigation";
import { getImageURL, Movie } from "../API/TMDB";

type Props = {
    movie: Movie;
    className?: string;
    /** Image quality key for TMDB path: 'min' | 'mid' | 'max'. Default: 'mid' */
    imageQualityKey?: 'min' | 'mid' | 'max';
};

const MoviePoster: React.FC<Props> = ({ movie, className = "", imageQualityKey = 'mid' }) => {
    const router = useRouter();
    const [imageErrored, setImageErrored] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const imageUrl = movie.poster_path ? getImageURL(movie.poster_path, imageQualityKey) : '';

    const handleClick = useCallback(() => {
        router.push(`/movie/${movie.id}`);
    }, [router, movie.id]);

    // Observe when the poster enters viewport to defer loading
    useEffect(() => {
        const node = containerRef.current;
        if (!node) return;
        let observer: IntersectionObserver | null = null;
        if ('IntersectionObserver' in window) {
            observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            setIsVisible(true);
                            observer?.disconnect();
                        }
                    });
                },
                { rootMargin: '300px' }
            );
            observer.observe(node);
        } else {
            // Fallback: load immediately
            setIsVisible(true);
        }
        return () => observer?.disconnect();
    }, []);

    const placeholder = (
        <div className="h-full w-full flex items-center justify-center bg-neutral-800 text-neutral-600">
            <div className="w-12 h-12 rounded-full bg-neutral-700/50" />
        </div>
    );

    return (
        <div ref={containerRef} className={`relative transition-all duration-300 h-full w-full group shadow-xl cursor-pointer ${className}`} onClick={handleClick}>
            {/* Hover overlay */}
            <div className="select-none h-full w-full border-none bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-0 group-hover:opacity-100 top-0 left-0 absolute z-10 transition-all duration-300">
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
                // Defer rendering the Next.js Image until the poster is visible to keep network usage low.
                isVisible ? (
                    <Image
                        src={imageUrl}
                        alt={movie.title}
                        fill
                        className="object-cover h-full w-full"
                        sizes="(min-width: 1280px) 16vw, (min-width: 1024px) 20vw, (min-width: 640px) 30vw, 45vw"
                        loading="lazy"
                        onError={() => setImageErrored(true)}
                    />
                ) : (
                    // Keep an empty visual placeholder until the image is in view to avoid layout shift.
                    <div aria-hidden className="h-full w-full bg-neutral-900" />
                )
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none"></div>
        </div>
    );
};

export default React.memo(MoviePoster);
