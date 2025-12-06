"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { getImageURL, getTMDBMoviesBy, Movie } from "../../API/TMDB";
import MoviePoster from "../Components/MoviePoster";
import Button from "../Components/Button";

function Explore() {
	// Hero carousel
	const [heroSlides, setHeroSlides] = useState<Movie[]>([]);
	const [currentHero, setCurrentHero] = useState(0);
	const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
	const autoTimerRef = useRef<number | null>(null);

	// Background crossfade state
	const [bgAUrl, setBgAUrl] = useState<string | null>(null);
	const [bgBUrl, setBgBUrl] = useState<string | null>(null);
	const [activeBg, setActiveBg] = useState<'A' | 'B'>('A');
	const [nextBg, setNextBg] = useState<'A' | 'B' | null>(null);
	const activeBgRef = useRef<'A' | 'B'>('A');

	// Grid data
	const [movies, setMovies] = useState<Movie[]>([]);
	const [loading, setLoading] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const pageRef = useRef(1);

	// Columns control for grid (2-6)
	const [columns, setColumns] = useState<number>(4);
	useEffect(() => {
		try {
			const saved = window.localStorage.getItem('explore_columns');
			if (saved) setColumns(Number(saved));
		} catch (e) {
			// ignore
		}
	}, []);
	useEffect(() => {
		try { window.localStorage.setItem('explore_columns', String(columns)); } catch (e) {}
	}, [columns]);

	// Fetch hero slides (popular)
	useEffect(() => {
		const fetchHero = async () => {
			try {
				const popular = await getTMDBMoviesBy("popular", 1);
				setHeroSlides(popular.slice(0, 10));
			} catch (e) {
				console.error("Error fetching hero slides:", e);
			}
		};
		fetchHero();
	}, []);

	// Initialize background when hero slides arrive
	useEffect(() => {
		if (heroSlides.length > 0) {
			const url = getImageURL(heroSlides[0]?.backdrop_path, 'mid');
			setBgAUrl(url);
			setActiveBg('A');
			activeBgRef.current = 'A';
			setBgBUrl(null);
			setNextBg(null);
		}
	}, [heroSlides]);

	// Fetch movies for infinite scroll
	const fetchMovies = useCallback(async (pageNum: number) => {
		if (loading) return;
		
		setLoading(true);
		try {
			const newMovies = await getTMDBMoviesBy("top_rated", pageNum);
			if (newMovies.length === 0) {
				setHasMore(false);
			} else {
				setMovies(prev => pageNum === 1 ? newMovies : [...prev, ...newMovies]);
			}
		} catch (error) {
			console.error("Error fetching movies:", error);
		} finally {
			setLoading(false);
		}
	}, [loading]);

	// Initial load
	useEffect(() => {
		fetchMovies(1);
	}, []);

	// Infinite scroll handler
	useEffect(() => {
		const handleScroll = () => {
			if (
				window.innerHeight + document.documentElement.scrollTop
				>= document.documentElement.offsetHeight - 1000 &&
				hasMore &&
				!loading
			) {
				pageRef.current += 1;
				fetchMovies(pageRef.current);
			}
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, [hasMore, loading, fetchMovies]);

	// Hero carousel: update current index and autoplay
	useEffect(() => {
		if (!emblaApi) return;
		const onSelect = () => setCurrentHero(emblaApi.selectedScrollSnap());
		onSelect();
		emblaApi.on('select', onSelect);
		return () => {
			emblaApi.off('select', onSelect);
		};
	}, [emblaApi]);

	useEffect(() => {
		if (!emblaApi) return;
		if (autoTimerRef.current) window.clearInterval(autoTimerRef.current);
		autoTimerRef.current = window.setInterval(() => {
			const snapCount = emblaApi.scrollSnapList().length;
			const next = (emblaApi.selectedScrollSnap() + 1) % snapCount;
			emblaApi.scrollTo(next);
		}, 4000);
		return () => {
			if (autoTimerRef.current) window.clearInterval(autoTimerRef.current);
		};
	}, [emblaApi, heroSlides.length]);

	// When hero slide changes, preload next bg and then crossfade on load
	useEffect(() => {
		if (heroSlides.length === 0) return;
		const nextUrl = getImageURL(heroSlides[currentHero]?.backdrop_path, 'mid');
		const target: 'A' | 'B' = activeBgRef.current === 'A' ? 'B' : 'A';
		if (target === 'A') setBgAUrl(nextUrl); else setBgBUrl(nextUrl);
		setNextBg(target);
	}, [currentHero, heroSlides]);

	useEffect(() => { activeBgRef.current = activeBg; }, [activeBg]);

	return (
		<div className="min-h-screen bg-black">
			{/* First Section - Hero Carousel */}
			{heroSlides.length > 0 && (
				<div className="relative h-screen w-full overflow-hidden">
					{/* Synced blurred background from current slide with crossfade */}
					<div className="absolute inset-0">
						{bgAUrl && (
							<img
								src={bgAUrl}
								alt="background A"
								className={`absolute inset-0 w-full h-full object-cover scale-125 blur-sm transition-opacity duration-700`}
								style={{ opacity: activeBg === 'A' ? 1 : 0 }}
								onLoad={() => {
									if (nextBg === 'A') {
										setActiveBg('A');
										activeBgRef.current = 'A';
										setNextBg(null);
									}
								}}
							/>
						)}
						{bgBUrl && (
							<img
								src={bgBUrl}
								alt="background B"
								className={`absolute inset-0 w-full h-full object-cover scale-125 blur-sm transition-opacity duration-700`}
								style={{ opacity: activeBg === 'B' ? 1 : 0 }}
								onLoad={() => {
									if (nextBg === 'B') {
										setActiveBg('B');
										activeBgRef.current = 'B';
										setNextBg(null);
									}
								}}
							/>
						)}
					</div>
					<div className="absolute inset-0 bg-black/50" />
					<div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent to-black" />

					{/* Carousel content */}
						<div className="relative z-10 h-full px-4 py-6 md:py-12">
							{/* Constrain content width for different displays */}
							<div className="mx-auto w-full max-w-xl sm:max-w-2xl md:max-w-4xl lg:max-w-6xl h-full embla">
							<div className="h-full overflow-hidden" ref={emblaRef}>
								<div className="flex h-full">
									{heroSlides.map((m) => (
										<div key={m.id} className="flex-[0_0_100%] h-full">
												<div className="h-full flex items-center justify-center">
													<div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-8 px-2 md:px-4 text-center md:text-left">
													{/* Poster */}
													{m.poster_path && (
														<img
															src={getImageURL(m.poster_path, 'mid')}
															alt={m.title}
															className="w-56 md:w-72 h-auto rounded-lg shadow-2xl transform transition-transform duration-300 hover:scale-105 mx-auto md:mx-0"
														/>
													)}
													{/* Info */}
													<div className="flex-1 text-white max-w-2xl mx-auto md:mx-0">
														{/* Translucent info card to lift content off the background */}
														<div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-white/10 shadow-lg">
														<h1 className="text-4xl md:text-6xl font-bold mb-4">{m.title}</h1>
														<div className="flex items-center gap-4 mb-6">
															<span className="bg-yellow-500 text-black text-sm font-bold px-3 py-1 rounded">★ {m.vote_average?.toFixed ? m.vote_average.toFixed(1) : m.vote_average}</span>
															<span className="text-gray-300">{m.release_date ? new Date(m.release_date).getFullYear() : ''}</span>
														</div>
														<p className="text-lg md:text-xl leading-relaxed text-gray-200 mb-8 line-clamp-6 md:line-clamp-none">{m.overview}</p>
														<div className="flex items-center gap-4">
															<Button 
																variant="primary" 
																size="lg"
																onClick={() => (window.location.href = `/movie/${m.id}`)}
																icon={
																	<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
																		<path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
																	</svg>
																}
																iconPosition="left"
															>
																Watch
															</Button>
															<Button variant="secondary">Add to List</Button>
														</div>
														</div>
													</div>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Second Section - Infinite Scroll Grid */}
			<div className="bg-black min-h-screen py-12">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between mb-6">
						<div>
							<h2 className="text-3xl font-bold text-white">Discover Movies</h2>
							<p className="text-sm text-gray-400 mt-1">Curated picks and top rated titles — keep scrolling for more.</p>
						</div>
							{/* Simple filter chips for visual interest (non-functional) and a columns slider */}
							<div className="hidden sm:flex items-center gap-4">
								<div className="flex items-center gap-2">
									<span className="text-xs bg-white/6 text-white px-3 py-1 rounded-full">All</span>
									<span className="text-xs bg-white/6 text-white px-3 py-1 rounded-full">Top Rated</span>
									<span className="text-xs bg-white/6 text-white px-3 py-1 rounded-full">Popular</span>
									<span className="text-xs bg-white/6 text-white px-3 py-1 rounded-full">Now Playing</span>
								</div>
								<div className="flex items-center gap-3">
									<label htmlFor="cols" className="text-xs text-gray-300">Columns</label>
									<input
										type="range"
										id="cols"
										min={2}
										max={12}
										value={columns}
										onChange={(e) => setColumns(Number((e.target as HTMLInputElement).value))}
										className="w-36 accent-yellow-400"
									/>
									<span className="text-sm text-gray-200 w-6 text-right">{columns}</span>
								</div>
							</div>
					</div>
					
					{/* Movie Grid */}
					<div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
						{movies.map((movie) => (
							<div key={movie.id} className="aspect-[2/3]">
								<div className="h-full w-full rounded-lg overflow-hidden transform transition hover:shadow-2xl hover:scale-[1.02] bg-gradient-to-b from-white/2 to-white/1 border border-white/5">
									<MoviePoster 
										movie={movie} 
										className="h-full w-full"
										imageQualityKey="min"
									/>
								</div>
							</div>
						))}
					</div>
					
					{/* Loading Indicator */}
					{loading && (
						<div className="flex justify-center items-center py-8">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
						</div>
					)}
					
					{/* End Message */}
					{!hasMore && movies.length > 0 && (
						<div className="text-center py-8">
							<p className="text-gray-400 text-lg">No more movies to load</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default Explore;