
"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { getTMDBMoviesByGenreName, Movie } from "../../API/TMDB";
import { MovieBox } from "./MovieBox";
import InteractiveMovieBox from "./InteractiveMovieBox";
import HorizontalMovieCard from "./HorizontalMovieCard";

type Props = {
	genre: string;
};

const InfiniteMovieGrid: React.FC<Props> = ({ genre }) => {
	const [movies, setMovies] = useState<Movie[]>([]);
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const loaderRef = useRef<HTMLDivElement>(null);
	const initialLoadDone = useRef(false);

	const fetchMovies = useCallback(async () => {
		if (loading || !hasMore) return;
		setLoading(true);

		try {
			// Fetch 2 pages at once for better grid filling
			const [batch1, batch2] = await Promise.all([
				getTMDBMoviesByGenreName(genre, page),
				getTMDBMoviesByGenreName(genre, page + 1)
			]);

			const newMovies = [...batch1, ...batch2];

			if (newMovies.length === 0) {
				setHasMore(false);
			} else {
				setMovies(prev => {
					// Filter duplicates just in case
					const existingIds = new Set(prev.map(m => m.id));
					const uniqueNew = newMovies.filter(m => !existingIds.has(m.id));
					return [...prev, ...uniqueNew];
				});
				setPage(p => p + 2);
			}
		} catch (error) {
			console.error("Failed to fetch movies", error);
		} finally {
			setLoading(false);
		}
	}, [genre, page, loading, hasMore]);

	// Initial load
	useEffect(() => {
		if (!initialLoadDone.current) {
			initialLoadDone.current = true;
			fetchMovies();
		}
	}, [fetchMovies]);

	// Infinite Scroll Observer
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasMore) {
					fetchMovies();
				}
			},
			{ rootMargin: "500px" }
		);

		if (loaderRef.current) {
			observer.observe(loaderRef.current);
		}

		return () => observer.disconnect();
	}, [fetchMovies, hasMore]);

	// Slicing logic for the specific grid pattern
	// Ensuring divisible by 5 (for large screens) and 4 (for medium)
	const carouselItems = movies.slice(0, 10);
	const largeGridItems = movies.slice(10, 30); // 20 items -> 4 rows @ 5 cols
	const infiniteGridItems = movies.slice(30);

	return (
		<div className="w-full pb-20">
			<div className="w-full max-w-full">

				{/* Section 1: Hero Carousel (10 Items) */}
				{carouselItems.length > 0 && (
					<div className="w-full animate-fade-in relative z-20">
						<HorizontalMovieCard movies={carouselItems} />
					</div>
				)}

				{/* Section 2: Large Grid (4 Rows of 4 Items) - Double Size */}
				{largeGridItems.length > 0 && (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
						{largeGridItems.map(movie => (
							<InteractiveMovieBox key={movie.id} movie={movie} className="aspect-[2/3]" />
						))}
					</div>
				)}

				{/* Section 3: Infinite Grid (8 Items per row) - Regular Size */}
				{infiniteGridItems.length > 0 && (
					<div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
						{infiniteGridItems.map(movie => (
							<MovieBox key={movie.id} movie={movie} className="aspect-[2/3]" />
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
						<div>End of list</div>
					)}
				</div>
			</div>

			{/* Extended custom styles for 16-col grid if needed later */}
			<style jsx global>{`
                /* Custom scrollbar hiding if needed */
            `}</style>
		</div>
	);
};

export default InfiniteMovieGrid;
