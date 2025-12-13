"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getImageURL, Movie, searchMovie } from "../API/TMDB";
import Image from "next/image";

interface SearchProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function Search({ isOpen, onClose }: SearchProps) {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<Movie[]>([]);
	const [loading, setLoading] = useState(false);
	const [recentSearches, setRecentSearches] = useState<string[]>([]);
	const [isVisible, setIsVisible] = useState(false);
	const searchRef = useRef<HTMLInputElement>(null);
	const router = useRouter();

	useEffect(() => {
		if (isOpen) {
			setIsVisible(true);
			if (searchRef.current) {
				searchRef.current.focus();
			}
		} else {
			const timer = setTimeout(() => setIsVisible(false), 300);
			return () => clearTimeout(timer);
		}
	}, [isOpen]);

	// Handle keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				onClose();
			}
			if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
				e.preventDefault();
				if (!isOpen) {
					// Open search modal - handled by parent but good to have logic
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
				const movies = await searchMovie(query);
				setResults(movies.slice(0, 8));
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

	if (!isVisible && !isOpen) return null;

	return (
		<div className={`fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
				onClick={onClose}
			></div>

			{/* Search Container */}
			<div className={`w-full max-w-3xl relative z-10 transform transition-all duration-300 ${isOpen ? 'translate-y-0 scale-100' : '-translate-y-4 scale-95'}`}>
				<div className="bg-[#0f0f0f]/90 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">

					{/* Search Input Header */}
					<div className="relative border-b border-white/5 p-4 flex items-center gap-4">
						<svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
						<input
							ref={searchRef}
							type="text"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search movies, genres, people..."
							className="flex-1 bg-transparent text-xl text-white placeholder-white/30 focus:outline-none h-12"
						/>
						{loading && (
							<div className="animate-spin w-5 h-5 border-2 border-white/20 border-t-white rounded-full"></div>
						)}
						<div className="hidden md:flex items-center gap-1 text-xs text-white/30 border border-white/10 px-2 py-1 rounded">
							<span>ESC</span>
							<span>to close</span>
						</div>
					</div>

					{/* Results Area */}
					<div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">

						{/* Recent Searches */}
						{query.trim().length === 0 && recentSearches.length > 0 && (
							<div className="p-4">
								<div className="flex items-center justify-between mb-4">
									<h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Recent</h3>
									<button
										onClick={clearRecentSearches}
										className="text-xs text-white/40 hover:text-white transition-colors"
									>
										Clear All
									</button>
								</div>
								<div className="flex flex-wrap gap-2">
									{recentSearches.map((search, index) => (
										<button
											key={index}
											onClick={() => handleRecentSearchClick(search)}
											className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/80 px-4 py-2 rounded-full text-sm transition-all border border-white/5"
										>
											<svg className="w-3 h-3 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
											{search}
										</button>
									))}
								</div>
							</div>
						)}

						{/* Movie Results */}
						{query.trim().length >= 2 && (
							<div className="space-y-1 p-2">
								{results.length === 0 && !loading ? (
									<div className="text-center py-12 text-white/30">
										<p>No movies found using "{query}"</p>
									</div>
								) : (
									results.map((movie: Movie, index) => {
										const posterUrl = movie.poster_path ? getImageURL(movie.poster_path, 'tiny') : null;

										return (
											<div
												key={movie.id}
												onClick={() => handleMovieClick(movie)}
												className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-all duration-200"
												style={{
													animation: `fadeIn 0.3s ease-out forwards ${index * 0.05}s`,
													opacity: 0
												}}
											>
												<div className="relative w-12 h-16 flex-shrink-0 rounded-md overflow-hidden bg-white/5 shadow-lg group-hover:scale-105 transition-transform duration-300">
													{posterUrl ? (
														<Image
															src={posterUrl}
															alt={movie.title}
															fill
															className="object-cover"
															sizes="48px"
														/>
													) : (
														<div className="w-full h-full flex items-center justify-center text-white/20">
															<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
															</svg>
														</div>
													)}
												</div>

												<div className="flex-1 min-w-0">
													<div className="flex justify-between items-start">
														<h4 className="text-white/90 font-medium group-hover:text-white transition-colors truncate pr-4">
															{movie.title}
														</h4>
														{movie.vote_average > 0 && (
															<span className="flex items-center gap-1 text-xs text-[#deb522] bg-[#deb522]/10 px-1.5 py-0.5 rounded font-medium">
																★ {movie.vote_average.toFixed(1)}
															</span>
														)}
													</div>
													<div className="flex items-center gap-2 mt-1 text-xs text-white/40">
														<span>{movie.release_date ? movie.release_date.split('-')[0] : 'TBA'}</span>
														<span>•</span>
														<span className="line-clamp-1">{movie.overview || 'No description available'}</span>
													</div>
												</div>

												<div className="text-white/20 group-hover:text-white/60 transition-colors">
													<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
													</svg>
												</div>
											</div>
										);
									})
								)}
							</div>
						)}
					</div>

					{/* Footer */}
					{results.length > 0 && (
						<div className="bg-white/5 p-3 text-center border-t border-white/5">
							<span className="text-xs text-white/30">
								Press <span className="font-mono text-white/50">Enter</span> to see all results
							</span>
						</div>
					)}
				</div>
			</div>

			<style jsx global>{`
				@keyframes fadeIn {
					from { opacity: 0; transform: translateY(5px); }
					to { opacity: 1; transform: translateY(0); }
				}
				.custom-scrollbar::-webkit-scrollbar {
					width: 6px;
				}
				.custom-scrollbar::-webkit-scrollbar-track {
					background: transparent;
				}
				.custom-scrollbar::-webkit-scrollbar-thumb {
					background: rgba(255, 255, 255, 0.1);
					border-radius: 10px;
				}
				.custom-scrollbar::-webkit-scrollbar-thumb:hover {
					background: rgba(255, 255, 255, 0.2);
				}
			`}</style>
		</div>
	);
}
