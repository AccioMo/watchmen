"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getImageURL, Movie } from "../../API/TMDB";

type Props = {
    movie: Movie;
    className?: string;
    /** Image quality key for TMDB path: 'min' | 'mid' | 'max'. Default: 'mid' */
    imageQualityKey?: 'min' | 'mid' | 'max';
};

const MoviePoster: React.FC<Props> = ({ movie, className = "", imageQualityKey = 'mid' }) => {
    const router = useRouter();
    const [imageErrored, setImageErrored] = useState(false);
    const [imgLoaded, setImgLoaded] = useState(false);
    const imageUrl = movie.poster_path ? getImageURL(movie.poster_path, imageQualityKey) : '';

    const handleClick = useCallback(() => {
        router.push(`/movie/${movie.id}`);
    }, [router, movie.id]);

    // Keep an effect hook for flipping the imgLoaded state when movie changes
    useEffect(() => {
        setImgLoaded(false);
    }, [movie.poster_path]);

    const placeholder = (
        <div className="h-full w-full flex items-center justify-center bg-gradient-to-tr from-neutral-800 via-neutral-700 to-neutral-900 rounded-xl text-white overflow-hidden">
            <div className="flex flex-col items-center gap-3 p-6 text-center">
                <svg className="w-16 h-16 text-white/90 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M7 21v-4"></path>
                    <path d="M17 21v-4"></path>
                    <polygon points="10 8 16 12 10 16 10 8"></polygon>
                </svg>
                <div className="max-w-xs">
                    <h4 className="font-semibold text-white">{movie.title || 'No preview available'}</h4>
                    <p className="text-xs text-white/70 line-clamp-3 mt-1">{movie.overview || 'Could not load preview.'}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className={`relative rounded-xl transition-all duration-300 h-full w-full group shadow-xl cursor-pointer ${className}`} onClick={handleClick}>
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
                <div className="relative h-full w-full">
                    {/* Tiny SVG blur placeholder behind the Image until it loads */}
                    <div className={`absolute inset-0 transition-opacity duration-300 ${imgLoaded ? 'opacity-0' : 'opacity-100 blur-sm scale-105'}`} aria-hidden>
                        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9" preserveAspectRatio="none">
                            <rect width="100%" height="100%" fill="#1f2937" />
                        </svg>
                    </div>
                    <Image
                        src={imageUrl}
                        alt={movie.title}
                        fill
                        sizes="(min-width: 1280px) 16vw, (min-width: 1024px) 20vw, (min-width: 640px) 30vw, 45vw"
                        loading="lazy"
                        className={`object-cover h-full w-full relative transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                        onLoadingComplete={() => setImgLoaded(true)}
                        onError={() => setImageErrored(true)}
                        placeholder="blur"
                        blurDataURL={'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9" preserveAspectRatio="none"><rect width="100%" height="100%" fill="%231f2937"/></svg>'}
                    />
                </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none"></div>
        </div>
    );
};

export default React.memo(MoviePoster);
