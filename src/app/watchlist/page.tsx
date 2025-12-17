"use client";

import { useEffect } from "react";
import { useWatchlist } from "../../context/WatchlistContext";
import LazyImage from "../../Components/LazyImage";
import { getImageURL } from "../../API/TMDB";
import Button from "../../Components/Button";
import Link from "next/link";

export default function WatchlistPage() {
    const { watchlist, removeFromWatchlist, moveMovie } = useWatchlist();

    useEffect(() => {
        document.title = "My Watchlist";
    }, []);

    if (watchlist.length === 0) {
        return (
            <div className="min-h-screen bg-[#0d0d0d] text-white pt-24 px-6 md:px-12 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold mb-4">Your watchlist is empty</h1>
                <p className="text-white/60 mb-8 max-w-md">
                    Movies you add to your watchlist will appear here. Browse movies to find something to watch!
                </p>
                <Link href="/" className="bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-white/90 transition-colors">
                    Browse Movies
                </Link>

                <div className="mt-12 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl max-w-lg">
                    <p className="text-sm text-yellow-200/80">
                        <strong>Note:</strong> Your watchlist is stored locally on this device. Clearing your browser cache or history may delete this list.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white pt-24 px-6 md:px-12 pb-20">
            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                            My Watchlist
                        </h1>
                        <p className="text-white/60">
                            {watchlist.length} {watchlist.length === 1 ? 'Movie' : 'Movies'}
                        </p>
                    </div>

                    <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-xs text-white/40 max-w-xs">
                        LocalStorage: This list exists only in this browser.
                    </div>
                </div>

                <div className="space-y-4">
                    {watchlist.map((movie, index) => (
                        <div key={movie.id} className="bg-white/5 border border-white/5 rounded-xl p-4 flex gap-4 md:gap-6 items-center group hover:bg-white/10 transition-colors">

                            {/* Drag/Order Controls */}
                            <div className="flex flex-col gap-1 text-white/20">
                                <button
                                    onClick={() => moveMovie(index, 'up')}
                                    disabled={index === 0}
                                    className="p-1 hover:text-white hover:bg-white/10 rounded disabled:opacity-0"
                                    title="Move Up"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => moveMovie(index, 'down')}
                                    disabled={index === watchlist.length - 1}
                                    className="p-1 hover:text-white hover:bg-white/10 rounded disabled:opacity-0"
                                    title="Move Down"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            </div>

                            {/* Movie Index */}
                            <span className="text-2xl font-bold text-white/10 font-mono w-8 text-center">{index + 1}</span>

                            {/* Movie Card (Mini) */}
                            <div className="w-16 md:w-24 aspect-[2/3] flex-shrink-0">
                                <Link href={`/movie/${movie.id}`} className="block w-full h-full overflow-hidden rounded-lg relative">
                                    <LazyImage
                                        src={movie.poster_path ? getImageURL(movie.poster_path, 'mid') : ''}
                                        placeholderSrc={movie.poster_path ? getImageURL(movie.poster_path, 'tiny') : ''}
                                        alt={movie.title}
                                        fill
                                        className="object-cover"
                                        sizes="(min-width: 768px) 100px, 64px"
                                    />
                                </Link>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg md:text-xl font-bold text-white mb-1 truncate">{movie.title}</h3>
                                <div className="flex items-center gap-2 text-sm text-white/60">
                                    <span>{new Date(movie.release_date).getFullYear()}</span>
                                    <span>•</span>
                                    <span className="text-yellow-500">★ {movie.vote_average.toFixed(1)}</span>
                                </div>
                                <p className="text-white/40 text-sm mt-2 line-clamp-2 hidden md:block">
                                    {movie.overview}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3">
                                <Link href={`/movie/watch/${movie.id}`}>
                                    <Button variant="primary" size="sm" className="hidden sm:flex">
                                        Watch
                                    </Button>
                                </Link>
                                <button
                                    onClick={() => removeFromWatchlist(movie.id)}
                                    className="p-2 md:p-3 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                                    title="Remove from watchlist"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
