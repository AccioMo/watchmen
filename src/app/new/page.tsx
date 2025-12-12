"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { getTMDBMoviesByNew, Movie } from "../../API/TMDB";
import MoviePoster from "../../Components/MoviePoster";

export default function New() {
	const [movies, setNewMovies] = useState<Movie[]>([]);
	const [loading, setLoading] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const pageRef = useRef(1);

	useEffect(() => {
		document.title = "New Releases";
		fetchMovies(1);
	}, []);

	const fetchMovies = async (pageNum: number) => {
		if (loading) return;
		setLoading(true);
		try {
			const newMovies = await getTMDBMoviesByNew(pageNum);
			if (newMovies.length === 0) {
				setHasMore(false);
			} else {
				setNewMovies((prev) => (pageNum === 1 ? newMovies : [...prev, ...newMovies]));
			}
		} catch (error) {
			console.error("Error fetching new movies:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleScroll = useCallback(() => {
		if (
			window.innerHeight + document.documentElement.scrollTop >=
			document.documentElement.offsetHeight - 800 &&
			hasMore &&
			!loading
		) {
			pageRef.current += 1;
			fetchMovies(pageRef.current);
		}
	}, [hasMore, loading]);

	useEffect(() => {
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, [handleScroll]);

	return (
		<div className="min-h-screen bg-[#0f0f0f] pt-24 pb-12 px-4 md:px-8">
			<div className="max-w-7xl mx-auto">
				<header className="mb-8">
					<h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">New Releases</h1>
					<p className="text-white/60 text-lg">Fresh from the box office</p>
				</header>

				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
					{movies.map((movie, index) => (
						<div
							key={`${movie.id}-${index}`}
							className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-white/5 cursor-pointer transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-white/10 hover:z-10"
							onClick={() => (window.location.href = `/movie/${movie.id}`)}
						>
							<MoviePoster
								movie={movie}
								className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-80"
								imageQualityKey="mid"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
								<h3 className="text-white font-bold text-sm md:text-base line-clamp-2">{movie.title}</h3>
								<p className="text-white/60 text-xs mt-1">{(movie.release_date || "").substring(0, 4)}</p>
							</div>
						</div>
					))}
				</div>

				{loading && (
					<div className="py-20 flex justify-center">
						<div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
					</div>
				)}
			</div>
		</div>
	);
}
