"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getImageURL, Movie } from "@/API/TMDB";

interface SearchProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function Search({ isOpen, onClose }: SearchProps) {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<Movie[]>([]);
	const [loading, setLoading] = useState(false);
	const [recentSearches, setRecentSearches] = useState<string[]>([]);
	const searchRef = useRef<HTMLInputElement>(null);
	const router = useRouter();

	useEffect(() => {
		if (isOpen && searchRef.current) {
			searchRef.current.focus();
		}
		
		// Handle keyboard shortcuts
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				onClose();
			}
			if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
				e.preventDefault();
				if (!isOpen) {
					// Open search modal
					setQuery("");
					setResults([]);
				}
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [isOpen, onClose]);

	useEffect(() => {
		// Load recent searches from localStorage
		const saved = localStorage.getItem("recentSearches");
		if (saved) {
			setRecentSearches(JSON.parse(saved));
		}
	}, []);

	useEffect(() => {
		const searchMovies = async () => {
			if (query.trim().length < 2) {
				setResults([]);
				return;
			}

			setLoading(true);
			try {
				// Search using the TMDB search endpoint
				const response = await fetch(
					`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&page=1`,
					{
						headers: {
							Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN}`,
							"Content-Type": "application/json",
						},
					}
				);
				
				if (response.ok) {
					const data = await response.json();
					setResults(data.results.slice(0, 8)); // Limit to 8 results
				}
			} catch (error) {
				console.error("Search error:", error);
			} finally {
				setLoading(false);
			}
		};

		const debounceTimer = setTimeout(searchMovies, 300);
		return () => clearTimeout(debounceTimer);
	}, [query]);

	const handleMovieClick = (movie: Movie) => {
		// Add to recent searches
		const newRecentSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
		setRecentSearches(newRecentSearches);
		localStorage.setItem("recentSearches", JSON.stringify(newRecentSearches));
		
		onClose();
		router.push(`/movie/${movie.id}`);
	};

	const handleRecentSearchClick = (searchTerm: string) => {
		setQuery(searchTerm);
	};

	const clearRecentSearches = () => {
		setRecentSearches([]);
		localStorage.removeItem("recentSearches");
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
			<div className="flex items-start justify-center min-h-screen pt-20 px-4">
				<div className="w-full max-w-2xl glass-card glass-border rounded-3xl p-6 max-h-[80vh] overflow-hidden">
					{/* Search Header */}
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-2xl font-bold text-white">Search Movies</h2>
						<button
							onClick={onClose}
							className="text-white/70 hover:text-white text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-all"
						>
							✕
						</button>
					</div>

					{/* Search Input */}
					<div className="relative mb-6">
						<input
							ref={searchRef}
							type="text"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search for movies... (Ctrl+K to open)"
							className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-400 focus:bg-white/15 transition-all"
							onKeyDown={(e) => {
								if (e.key === 'Escape') {
									onClose();
								}
							}}
						/>
						<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
							{loading ? (
								<div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div>
							) : (
								<svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
								</svg>
							)}
						</div>
					</div>

					{/* Search Results */}
					<div className="overflow-y-auto max-h-96">
						{query.trim().length === 0 && recentSearches.length > 0 && (
							<div className="mb-6">
								<div className="flex items-center justify-between mb-3">
									<h3 className="text-lg font-semibold text-white/90">Recent Searches</h3>
									<button
										onClick={clearRecentSearches}
										className="text-sm text-white/60 hover:text-white/80 transition-all"
									>
										Clear
									</button>
								</div>
								<div className="flex flex-wrap gap-2">
									{recentSearches.map((search, index) => (
										<button
											key={index}
											onClick={() => handleRecentSearchClick(search)}
											className="bg-white/10 hover:bg-white/20 text-white/80 px-3 py-1 rounded-lg text-sm transition-all"
										>
											{search}
										</button>
									))}
								</div>
							</div>
						)}

						{query.trim().length >= 2 && (
							<div>
								<h3 className="text-lg font-semibold text-white/90 mb-3">
									Search Results {results.length > 0 && `(${results.length})`}
								</h3>
								{results.length === 0 && !loading ? (
									<p className="text-white/60 text-center py-8">No movies found</p>
								) : (
									<div className="space-y-3">
										{results.map((movie: Movie, index) => (
											<div
												key={index}
												onClick={() => handleMovieClick(movie)}
												className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/10 cursor-pointer transition-all group"
											>
												<div className="flex-shrink-0 w-16 h-24 rounded-lg overflow-hidden bg-white/10">
													{movie.poster_path ? (
														<img
															src={getImageURL(movie.poster_path, 'small')}
															alt={movie.title}
															className="w-full h-full object-cover"
														/>
													) : (
														<div className="w-full h-full flex items-center justify-center text-white/40">
															📽️
														</div>
													)}
												</div>
												<div className="flex-1 min-w-0">
													<h4 className="text-white font-semibold group-hover:text-purple-300 transition-all truncate">
														{movie.title}
													</h4>
													<p className="text-white/60 text-sm mb-1">
														{new Date(movie.release_date).getFullYear() || 'N/A'}
													</p>
													<p className="text-white/50 text-sm line-clamp-2">
														{movie.overview || 'No description available'}
													</p>
												</div>
												<div className="flex-shrink-0">
													<div className="flex items-center gap-1">
														<span className="text-yellow-400">⭐</span>
														<span className="text-white/70 text-sm">
															{movie.vote_average?.toFixed(1) || 'N/A'}
														</span>
													</div>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
