"use client";

import { useState, useEffect, useCallback } from "react";
import Slider from "../../Components/Slider";
import Chip from "../../Components/Chip";
import Dropdown from "../../Components/Dropdown";
import InfiniteMovieGrid from "../../Components/InfiniteMovieGrid";
import { discoverMovies, Movie } from "../../API/TMDB";
import genresData from "../../../genres.json";

// Map Genre IDs to Colors
const getGenreColor = (id: number) => {
	const colors: { [key: number]: string } = {
		28: "bg-blue-600", // Action
		12: "bg-green-600", // Adventure
		16: "bg-yellow-600", // Animation
		35: "bg-pink-600", // Comedy
		80: "bg-red-700", // Crime
		99: "bg-gray-600", // Documentary
		18: "bg-purple-600", // Drama
		10751: "bg-orange-500", // Family
		14: "bg-indigo-600", // Fantasy
		36: "bg-amber-800", // History
		27: "bg-red-900", // Horror
		10402: "bg-rose-500", // Music
		9648: "bg-slate-700", // Mystery
		10749: "bg-pink-500", // Romance
		878: "bg-cyan-600", // Sci-Fi
		10770: "bg-emerald-700", // TV Movie
		53: "bg-stone-600", // Thriller
		10752: "bg-lime-800", // War
		37: "bg-orange-800", // Western
	};
	return colors[id] || "bg-white/10";
};

export default function ExplorePage() {
	const [movies, setMovies] = useState<Movie[]>([]);
	const [loading, setLoading] = useState(false);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);

	// Filters
	const [yearRange, setYearRange] = useState<[number, number]>([1990, 2024]);
	const [ratingRange, setRatingRange] = useState<[number, number]>([5, 10]);
	const [minVotes, setMinVotes] = useState<[number, number]>([4000, 5000]);
	const [sortBy, setSortBy] = useState("revenue.desc");

	const [selectedGenres, setSelectedGenres] = useState<number[]>([]);

	const fetchMovies = useCallback(async (pageNum: number, isNewFilter: boolean = false) => {
		setLoading(true);
		try {
			const results = await discoverMovies({
				primary_release_year: undefined,
				"primary_release_date.gte": `${yearRange[0]}-01-01`,
				"primary_release_date.lte": `${yearRange[1]}-12-31`,
				"vote_average.gte": ratingRange[0],
				"vote_average.lte": ratingRange[1],
				"vote_count.gte": minVotes[0],
				with_genres: selectedGenres.join(","),
				sort_by: sortBy,
				page: pageNum
			});

			if (results.length === 0) {
				setHasMore(false);
				if (isNewFilter) setMovies([]);
			} else {
				setMovies(prev => isNewFilter ? results : [...prev, ...results]);
				setPage(pageNum);
			}
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	}, [yearRange, ratingRange, minVotes, selectedGenres, sortBy]);

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			// Reset logic
			setMovies([]);
			setPage(1);
			setHasMore(true);
			fetchMovies(1, true);
		}, 500);
		return () => clearTimeout(timeoutId);
	}, [fetchMovies]);

	const loadMore = () => {
		if (!loading && hasMore) {
			fetchMovies(page + 1, false);
		}
	};

	const toggleGenre = (id: number) => {
		setSelectedGenres(prev =>
			prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
		);
	};

	// Sort Options
	const sortOptions = [
		{ label: "Most Popular", value: "popularity.desc" },
		{ label: "Least Popular", value: "popularity.asc" },
		{ label: "Blockbusters", value: "revenue.desc" },
		{ label: "Newest", value: "primary_release_date.desc" },
		{ label: "Oldest", value: "primary_release_date.asc" },
		{ label: "Critical Acclaim", value: "vote_average.desc" },
	];

	return (
		<div className="h-screen bg-black text-white font-sans selection:bg-white/20 overflow-hidden flex flex-col">

			{/* Main Content Area - Fixed Height (Screen - Navbar) */}
			<div className="flex-1 flex pt-20 overflow-hidden">

				{/* Fixed Discovery Section (Sidebar) */}
				<aside className="w-[320px] md:w-[400px] flex-shrink-0 bg-black/50 border-r border-white/5 px-8 overflow-y-auto no-scrollbar z-20">
					<header className="mb-5">
						<h1 className="text-2xl font-bold mb-1 tracking-tighter">beep boop</h1>
					</header>

					<div className="space-y-10">
						{/* Sort Dropdown moved here for "Control Panel" feel, or could be kept on right. 
                             User asked for "Explore discovery section remains fixed". 
                             Putting Sort here makes sense for a centralized control area. */}
						<div className="pb-8 border-b border-white/5">
							<Dropdown
								label="Sort By"
								options={sortOptions}
								value={sortBy}
								onChange={setSortBy}
								className="w-full flex justify-between"
							/>
						</div>

						{/* Sliders Section */}
						<div className="space-y-8">
							<div>
								<h3 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-6">Release Year</h3>
								<Slider
									min={1970}
									max={2025}
									value={yearRange}
									onChange={setYearRange}
								/>
							</div>

							<div>
								<h3 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-6">Rating</h3>
								<Slider
									min={0}
									max={10}
									step={0.1}
									value={ratingRange}
									onChange={setRatingRange}
									formatLabel={(v) => v.toFixed(1)}
								/>
							</div>

							<div>
								<h3 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-6">Vote Count</h3>
								<Slider
									min={0}
									max={5000}
									step={50}
									value={minVotes}
									onChange={setMinVotes}
									formatLabel={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toString()}
								/>
							</div>
						</div>

						{/* Genres Grid */}
						<div>
							<h3 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">Genres</h3>
							<div className="flex flex-wrap gap-2">
								{genresData.genres.map((genre) => (
									<Chip
										key={genre.id}
										label={genre.name}
										isSelected={selectedGenres.includes(genre.id)}
										onClick={() => toggleGenre(genre.id)}
										colorClass={getGenreColor(genre.id)}
									/>
								))}
							</div>
						</div>
					</div>
				</aside>

				{/* Scrollable Movie Grid Area */}
				<main className="flex-1 overflow-y-auto bg-black scroll-smooth custom-scrollbar">
					<InfiniteMovieGrid
						movies={movies}
						mode="grid"
						hasMore={hasMore}
						isLoading={loading}
						onLoadMore={loadMore}
					/>

					{movies.length === 0 && !loading && (
						<div className="h-[50vh] flex flex-col items-center justify-center text-center">
							<p className="text-white/30 mb-4">No movies found matching your filters.</p>
							<button
								onClick={() => {
									setYearRange([1990, 2024]);
									setRatingRange([0, 10]);
									setMinVotes([0, 500]);
									setSelectedGenres([]);
								}}
								className="text-xs font-bold text-white uppercase tracking-wider hover:underline"
							>
								Reset Filters
							</button>
						</div>
					)}
				</main>
			</div>
		</div>
	);
}
