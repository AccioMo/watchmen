import React, { useState, useEffect, useCallback } from "react";
import Image from 'next/image';
import { useRouter } from "next/navigation";
import { getImageURL, Movie, getMovieVideos } from "../../API/TMDB";
import Button from "./Button";

type Props = {
    movies: Movie[];
    className?: string;
};

const HorizontalMovieCard: React.FC<Props> = ({ movies, className = "" }) => {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [trailerKey, setTrailerKey] = useState<string | null>(null);

    const fetchTrailer = useCallback(async (id: number) => {
        const videos = await getMovieVideos(id);
        const trailer = videos.results?.find((v: any) => v.type === "Trailer" && v.site === "YouTube");
        setTrailerKey(trailer?.key || null);
    }, []);

    useEffect(() => {
        if (movies[currentIndex]) {
            fetchTrailer(movies[currentIndex].id);
        }
    }, [currentIndex, movies, fetchTrailer]);

    const handlePlayClick = (id: number) => {
        router.push(`/movie/watch/${id}`);
    };

    const handleTrailerClick = () => {
        if (trailerKey) {
            window.open(`https://www.youtube.com/watch?v=${trailerKey}`, '_blank');
        }
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
    };

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, [movies.length]);

    // Auto-rotate every 10 seconds
    useEffect(() => {
        if (movies.length <= 1) return;
        const interval = setInterval(handleNext, 10000);
        return () => clearInterval(interval);
    }, [movies.length, handleNext]);

    // Swipe Support
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
        setTouchEnd(null);
        if ('touches' in e) {
            setTouchStart(e.targetTouches[0].clientX);
        } else {
            setTouchStart((e as React.MouseEvent).clientX);
        }
    };

    const onTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
        if ('touches' in e) {
            setTouchEnd(e.targetTouches[0].clientX);
        } else {
            setTouchEnd((e as React.MouseEvent).clientX);
        }
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            handleNext();
        } else if (isRightSwipe) {
            handlePrev();
        }
    };

    return (
        <div
            className={`relative w-full h-screen overflow-hidden bg-black group ${className}`}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onMouseDown={onTouchStart}
            onMouseMove={onTouchMove}
            onMouseUp={onTouchEnd}
            onMouseLeave={onTouchEnd}
        >
            {/* Carousel Track */}
            <div
                className="flex h-full transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {movies.map((movie, index) => {
                    const backdropUrl = movie.backdrop_path ? getImageURL(movie.backdrop_path, 'max') : '';
                    const posterUrl = movie.poster_path ? getImageURL(movie.poster_path, 'mid') : '';

                    return (
                        <div key={movie.id} className="relative min-w-full h-full select-none">
                            {/* Background Image */}
                            {backdropUrl && (
                                <div className="absolute inset-0">
                                    <Image
                                        src={backdropUrl}
                                        alt={movie.title}
                                        fill
                                        className="object-cover opacity-60 pointer-events-none"
                                        priority={index === 0}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent"></div>
                                </div>
                            )}

                            {/* Content Container */}
                            <div className="absolute inset-0 flex items-end pb-20 md:items-center md:pb-0 px-8 md:px-16 container mx-auto pointer-events-none">
                                <div className="flex flex-col md:flex-row items-end gap-8 w-full">

                                    {/* Vertical Poster */}
                                    <div className="hidden md:block relative w-48 lg:w-64 aspect-[2/3] rounded-lg shadow-2xl overflow-hidden flex-shrink-0">
                                        {posterUrl && (
                                            <Image
                                                src={posterUrl}
                                                alt={movie.title + " Poster"}
                                                fill
                                                className="object-cover"
                                            />
                                        )}
                                    </div>

                                    {/* Text Details */}
                                    <div className="text-white max-w-2xl mb-4 md:mb-0 pointer-events-auto">
                                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-4 tracking-tight drop-shadow-lg">
                                            {movie.title}
                                        </h1>
                                        <div className="flex flex-wrap items-center gap-4 text-sm md:text-base font-medium text-white/80 mb-6">
                                            <span className="text-yellow-400 font-bold flex items-center gap-1">
                                                <span className="text-lg">★</span> {movie.vote_average?.toFixed(1)}
                                            </span>
                                            <span>•</span>
                                            <span>{movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</span>
                                            <span>•</span>
                                            <span className="uppercase tracking-wider text-xs border border-white/30 px-2 py-1 rounded">
                                                {movie.original_language}
                                            </span>
                                        </div>
                                        <p className="text-base md:text-lg text-white/70 line-clamp-3 md:line-clamp-4 leading-relaxed max-w-xl mb-8 drop-shadow-md">
                                            {movie.overview}
                                        </p>

                                        <div className="flex gap-4">
                                            {trailerKey && (
                                                <Button
                                                    onClick={handleTrailerClick}
                                                    variant="primary"
                                                    size="md"
                                                    icon={
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    }
                                                >
                                                    Watch Trailer
                                                </Button>
                                            )}
                                            <Button
                                                onClick={() => handlePlayClick(movie.id)}
                                                variant="secondary"
                                                size="md"
                                                icon={
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M8 5v14l11-7z" />
                                                    </svg>
                                                }
                                            >
                                                Watch Now
                                            </Button>
                                            <Button
                                                onClick={() => router.push(`/movie/${movie.id}`)}
                                                variant="ghost"
                                                size="md"
                                                className="hover:bg-white/10"
                                            >
                                                Details
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Edge Gradients */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black/80 to-transparent pointer-events-none z-10" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black/80 to-transparent pointer-events-none z-10" />

            {/* Arrow Navigation */}
            <button
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 text-white/50 hover:text-white transition-colors p-4 hidden md:block"
            >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6" />
                </svg>
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 text-white/50 hover:text-white transition-colors p-4 hidden md:block"
            >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                </svg>
            </button>

            {/* Indicators */}
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex gap-2 z-30">
                {movies.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-1 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/30 hover:bg-white/60'}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default HorizontalMovieCard;
