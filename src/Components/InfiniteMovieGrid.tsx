
"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { getTMDBMoviesByGenreName, Movie } from "../API/TMDB";
import { MovieBox } from "./MovieBox";
import InteractiveMovieBox from "./InteractiveMovieBox";
import HorizontalMovieCard from "./HorizontalMovieCard";
import MoviePoster from "./MoviePoster";

type Props = {
	genre?: string;
	// Controlled props
	movies?: Movie[];
	onLoadMore?: () => void;
	hasMore?: boolean;
	isLoading?: boolean; // Renamed to avoid conflict with internal state
	mode?: 'mixed' | 'grid';
	className?: string;
};

const InfiniteMovieGrid: React.FC<Props> = ({
	genre,
	movies: controlledMovies,
	onLoadMore,
	hasMore: controlledHasMore,
	isLoading: controlledLoading,
	mode = 'mixed',
	className = ""
}) => {
	// Internal State (for uncontrolled mode)
	const [internalMovies, setInternalMovies] = useState<Movie[]>([]);
	const [page, setPage] = useState(1);
	const [internalLoading, setInternalLoading] = useState(false);
	const [internalHasMore, setInternalHasMore] = useState(true);

	const loaderRef = useRef<HTMLDivElement>(null);
	const initialLoadDone = useRef(false);

	// Derived state
	const isControlled = !!controlledMovies;
	const movies = controlledMovies || internalMovies;
	const loading = isControlled ? controlledLoading : internalLoading;
	const hasMore = isControlled ? controlledHasMore : internalHasMore;

	// Internal Fetch Logic
	const fetchInternalMovies = useCallback(async () => {
		if (internalLoading || !internalHasMore || !genre) return;
		setInternalLoading(true);

		try {
			// Fetch 2 pages at once for better grid filling
			const [batch1, batch2] = await Promise.all([
				getTMDBMoviesByGenreName(genre, page),
				getTMDBMoviesByGenreName(genre, page + 1)
			]);

			const newMovies = [...batch1, ...batch2];

			if (newMovies.length === 0) {
				setInternalHasMore(false);
			} else {
				setInternalMovies(prev => {
					const existingIds = new Set(prev.map(m => m.id));
					const uniqueNew = newMovies.filter(m => !existingIds.has(m.id));
					return [...prev, ...uniqueNew];
				});
				setPage(p => p + 2);
			}
		} catch (error) {
			console.error("Failed to fetch movies", error);
		} finally {
			setInternalLoading(false);
		}
	}, [genre, page, internalLoading, internalHasMore]);

	// Initial load for internal mode
	useEffect(() => {
		if (!isControlled && !initialLoadDone.current && genre) {
			initialLoadDone.current = true;
			fetchInternalMovies();
		}
	}, [isControlled, genre, fetchInternalMovies]);

	// Load More Trigger
	const handleLoadMore = useCallback(() => {
		if (isControlled) {
			onLoadMore?.();
		} else {
			fetchInternalMovies();
		}
	}, [isControlled, onLoadMore, fetchInternalMovies]);

	// Infinite Scroll Observer
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasMore && !loading) {
					handleLoadMore();
				}
			},
			{ rootMargin: "500px" }
		);

		if (loaderRef.current) {
			observer.observe(loaderRef.current);
		}

		return () => observer.disconnect();
	}, [handleLoadMore, hasMore, loading]);

	// Slicing logic
	let carouselItems: Movie[] = [];
	let largeGridItems: Movie[] = [];
	let infiniteGridItems: Movie[] = [];

	if (mode === 'mixed') {
		carouselItems = movies.slice(0, 10);
		largeGridItems = movies.slice(10, 30);
		infiniteGridItems = movies.slice(30);
	} else {
		infiniteGridItems = movies;
	}

	return (
		<div className={`w-full ${className}`}>
			<div className="w-full max-w-full">

				{/* Section 1: Hero Carousel (Mixed Mode Only) */}
				{mode === 'mixed' && carouselItems.length > 0 && (
					<div className="w-full animate-fade-in relative z-20">
						<HorizontalMovieCard movies={carouselItems} />
					</div>
				)}

				{/* Section 2: Large Grid (Mixed Mode Only) */}
				{mode === 'mixed' && largeGridItems.length > 0 && (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
						{largeGridItems.map(movie => (
							<InteractiveMovieBox key={movie.id} movie={movie} className="aspect-[2/3]" />
						))}
					</div>
				)}

				{/* Section 3: Infinite Grid */}
				{infiniteGridItems.length > 0 && (
					<div className={
						mode === 'mixed'
							? "grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8"
							: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-0" // Tight grid for explore
					}>
						{infiniteGridItems.map(movie => (
							mode === 'mixed' ? (
								<MovieBox key={movie.id} movie={movie} className="aspect-[2/3]" />
							) : (
								<div key={movie.id} className="aspect-[2/3] relative group">
									<MoviePoster movie={movie} className="w-full h-full object-cover rounded-none" />
								</div>
							)
						))}
					</div>
				)}

				{/* Loader / Sentinel */}
				<div ref={loaderRef} className="w-full py-10 flex justify-center text-white/30 text-sm">
					{loading ? (
						<div className="animate-pulse">Loading more...</div>
					) : hasMore ? (
						<div className="h-10"></div>
					) : (
						<div className="opacity-50">End of list</div>
					)}
				</div>
			</div>

			{/* Scrollbar Styling */}
			<style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #000; 
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #333; 
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #555; 
                }
            `}</style>
		</div>
	);
};

export default InfiniteMovieGrid;
