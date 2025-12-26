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


	// Mobile Filters Toggle
	const [showMobileFilters, setShowMobileFilters] = useState(false);

	return (
		<div className="h-screen bg-black text-white font-sans selection:bg-white/20 overflow-hidden flex flex-col">

			{/* Main Content Area - Fixed Height (Screen - Navbar) */}
			<div className="flex-1 flex pt-20 overflow-hidden relative">

				{/* Mobile Filter Toggle Button */}
				<button
					onClick={() => setShowMobileFilters(true)}
					className="md:hidden absolute bottom-6 right-6 z-50 bg-white text-black font-bold py-3 px-6 rounded-full shadow-lg flex items-center gap-2"
				>
					<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
						<path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
					</svg>
					Filters
				</button>

				{/* Sidebar (Discovery Section) 
                    - Mobile: Fixed full screen, hidden unless toggled
                    - Desktop: Static sidebar
                */}
				<aside className={`
                    fixed inset-0 z-40 bg-black md:bg-black/50 md:static md:w-[400px] md:flex-shrink-0 border-r border-white/5 px-8 pt-20 md:pt-0 overflow-y-auto no-scrollbar transition-transform duration-300
                    ${showMobileFilters ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}>
					<div className="flex justify-between items-center mb-5 md:mt-0">
						<header>
							<h1 className="text-2xl font-bold tracking-tighter">beep boop</h1>
						</header>
						{/* Close Button (Mobile Only) */}
						<button
							onClick={() => setShowMobileFilters(false)}
							className="md:hidden text-white/60 hover:text-white"
						>
							<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>

					<div className="space-y-10 pb-20 md:pb-0">
						{/* Sort Dropdown  */}
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

						{/* Apply Button (Mobile Only convenience) */}
						<button
							onClick={() => setShowMobileFilters(false)}
							className="md:hidden w-full bg-white text-black font-bold py-3 rounded-xl mt-8"
						>
							Apply Filters
						</button>
					</div>
				</aside>

				{/* Scrollable Movie Grid Area */}
				<main className="flex-1 overflow-y-auto bg-black scroll-smooth custom-scrollbar w-full">
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
