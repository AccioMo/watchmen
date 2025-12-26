'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
	getImageURL,
	Movie,
	MovieDetails,
	getMovieById,
	getMovieCredits,
	getSimilarMovies,
	getMovieReviews,
	getMovieVideos,
	searchMovie,
} from "../../../API/TMDB";
import { getOMDBRatings, OMDBRatings } from "../../../API/OMDBActions";
import { getTasteDiveRecommendations } from "../../../API/TasteDive";
import { useWatchlist } from "../../../context/WatchlistContext";

import Button from "../../../Components/Button";
import InteractiveMovieBox from "../../../Components/InteractiveMovieBox";
import CastList from "../../../Components/CastList";
import BehindTheScenes from "../../../Components/BehindTheScenes";
import TrailerModal from "../../../Components/TrailerModal";
import Image from "next/image";
import RatingCard from "../../../Components/RatingCard";



interface CastMember {
	id: number;
	name: string;
	character: string;
	profile_path: string;
	order: number;
}

interface CrewMember {
	id: number;
	name: string;
	job: string;
	department: string;
	profile_path: string;
}

interface Review {
	id: string;
	author: string;
	content: string;
	created_at: string;
	author_details: {
		rating: number;
		avatar_path: string | null;
	};
}


export default function MoviePage() {
	const params = useParams();
	const router = useRouter();
	const [movie, setMovie] = useState<MovieDetails | null>(null);
	const [cast, setCast] = useState<CastMember[]>([]);
	const [crew, setCrew] = useState<CrewMember[]>([]);
	const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
	const [reviews, setReviews] = useState<Review[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [trailerKey, setTrailerKey] = useState<string | null>(null);
	const [showTrailer, setShowTrailer] = useState(false);
	const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();

	const [recSource, setRecSource] = useState<'TMDB' | 'TasteDive'>('TMDB');
	const [tasteDiveMovies, setTasteDiveMovies] = useState<Movie[]>([]);
	const [isLoadingTasteDive, setIsLoadingTasteDive] = useState(false);
	const [externalRatings, setExternalRatings] = useState<OMDBRatings | null>(null);



	const slug = params?.slug as string;

	useEffect(() => {
		if (movie) {
			document.title = `${movie.title}`;
		}
	}, [movie]);

	useEffect(() => {
		const fetchMovieData = async () => {
			if (!slug) return;
			setLoading(true);
			setError(null);

			try {
				let movieData: MovieDetails | null = null;

				if (/^\d+$/.test(slug)) {
					movieData = await getMovieById(slug);
				} else {
					const results = await searchMovie(slug.replace(/-/g, ' '));
					if (!results || results.length === 0) {
						throw new Error('Movie not found');
					}
					movieData = await getMovieById(results[0].id);
				}

				if (!movieData) throw new Error('Movie not found');
				setMovie(movieData);

				const [creditsData, similarData, reviewsData, videosData, omdbData] = await Promise.all([
					getMovieCredits(movieData.id),
					getSimilarMovies(movieData.id),
					getMovieReviews(movieData.id),
					getMovieVideos(movieData.id),
					movieData.imdb_id ? getOMDBRatings(movieData.imdb_id) : Promise.resolve(null)
				]);

				setCast(creditsData.cast?.slice(0, 15) || []);
				setCrew(creditsData.crew?.filter((member: CrewMember) =>
					['Director', 'Producer', 'Executive Producer', 'Writer', 'Screenplay', 'Cinematography'].includes(member.job)
				).slice(0, 10) || []);
				setSimilarMovies(similarData.slice(0, 10));
				setReviews(reviewsData.results?.slice(0, 5) || []);

				const trailer = videosData.results?.find((v: { type: string; site: string; key: string }) => v.type === "Trailer" && v.site === "YouTube");
				setTrailerKey(trailer?.key || null);

				setExternalRatings(omdbData);

			} catch (err) {
				setError(err instanceof Error ? err.message : 'An error occurred');
			} finally {
				setLoading(false);
			}
		};

		if (slug) {
			fetchMovieData();
		}
	}, [slug]);

	// Effect to handle TasteDive fetching when source changes or movie changes
	useEffect(() => {
		if (recSource === 'TasteDive' && movie && tasteDiveMovies.length === 0 && !isLoadingTasteDive) {
			const fetchTasteDive = async () => {
				setIsLoadingTasteDive(true);
				const results = await getTasteDiveRecommendations(movie.title);
				setTasteDiveMovies(results);
				setIsLoadingTasteDive(false);
			};
			fetchTasteDive();
		}
	}, [recSource, movie, isLoadingTasteDive, tasteDiveMovies.length]);

	const formatRuntime = (minutes: number) => {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return `${hours}h ${mins}m`;
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(amount);
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
				<div className="animate-spin w-12 h-12 border-4 border-white/10 border-t-white rounded-full"></div>
			</div>
		);
	}

	if (error || !movie) {
		return (
			<div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-3xl font-bold text-white mb-4">Movie Not Found</h1>
					<Button onClick={() => router.back()} variant="primary">Go Back</Button>
				</div>
			</div>
		);
	}

	const backdropUrl = movie.backdrop_path ? getImageURL(movie.backdrop_path, 'max') : '';
	const posterUrl = movie.poster_path ? getImageURL(movie.poster_path, 'mid') : '';

	return (
		<div className="min-h-screen bg-[#0d0d0d] text-white selection:bg-purple-500/30">

			{/* HERO SECTION */}
			<div className="relative h-screen w-full overflow-hidden">
				{/* Background Image - Mobile (Poster) */}
				{posterUrl && (
					<div className="absolute inset-0 block md:hidden">
						<Image
							src={posterUrl}
							alt={movie.title}
							fill
							className="object-cover opacity-50 pointer-events-none"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-black/50 to-transparent"></div>
					</div>
				)}

				{/* Background Image - Desktop (Backdrop) */}
				{backdropUrl && (
					<div className="absolute inset-0 hidden md:block">
						<Image
							src={backdropUrl}
							alt={movie.title}
							fill
							className="object-cover opacity-60 pointer-events-none"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-black/40 to-transparent"></div>
						<div className="absolute inset-0 bg-gradient-to-r from-[#0d0d0d] via-transparent to-transparent"></div>
					</div>
				)}

				<div className="relative z-10 flex flex-col justify-end h-full pb-20 container mx-auto px-6 md:px-12">
					<div className="max-w-4xl space-y-6 animate-fade-in-up">
						{/* Badges */}
						<div className="flex flex-wrap items-center gap-3">

							<RatingCard
								type="TMDB"
								value={`${(movie.vote_average * 10).toFixed(0)}%`}
								link={`https://www.themoviedb.org/movie/${movie.id}`}
							/>

							{externalRatings?.imdb && (
								<RatingCard
									type="IMDb"
									value={externalRatings.imdb}
									link={`https://www.imdb.com/title/${movie.imdb_id}`}
								/>
							)}
							{externalRatings?.rottenTomatoes && (
								<RatingCard
									type="RottenTomatoes"
									value={externalRatings.rottenTomatoes}
									link={`https://www.rottentomatoes.com/search?search=${encodeURIComponent(movie.title)}`}
								/>
							)}
							{externalRatings?.metacritic && (
								<RatingCard
									type="Metacritic"
									value={externalRatings.metacritic}
									link={`https://www.metacritic.com/search/${encodeURIComponent(movie.title)}`}
								/>
							)}

							<span className="text-white/60 text-sm font-medium ml-2">{formatRuntime(movie.runtime)}</span>
							<span className="text-white/40">•</span>
							<span className="text-white/60 text-sm font-medium">{new Date(movie.release_date).getFullYear()}</span>
						</div>

						{/* Title */}
						<h1 className={`${movie.title.length > 40 ? 'text-2xl md:text-5xl lg:text-6xl' : movie.title.length > 20 ? 'text-3xl md:text-6xl lg:text-7xl' : 'text-4xl md:text-7xl lg:text-8xl'} font-black tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/50 drop-shadow-2xl`}>
							{movie.title}
						</h1>

						{/* Tagline */}
						{movie.tagline && (
							<p className="text-xl md:text-2xl text-white/70 italic font-light border-l-4 border-purple-500 pl-4 py-1">
								"{movie.tagline}"
							</p>
						)}

						{/* Overview */}
						<p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl line-clamp-3 md:line-clamp-none">
							{movie.overview}
						</p>

						{/* Actions */}
						{/* Actions */}
						<div className="flex flex-col md:flex-row items-center gap-4 pt-4 w-full md:w-auto">
							{/* Primary Action (Top on Mobile) */}
							<Button
								onClick={() => {
									router.push(`/movie/watch/${movie.id}`);
								}}
								variant="primary"
								size="lg"
								className="w-full md:w-auto justify-center"
								icon={
									<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
										<path d="M8 5v14l11-7z" />
									</svg>
								}
							>
								Watch Now
							</Button>

							{/* Secondary Actions (Row on Mobile) */}
							<div className="flex w-full md:w-auto gap-4">
								{trailerKey && (
									<Button
										onClick={() => setShowTrailer(true)}
										variant="secondary"
										size="lg"
										className="flex-grow md:flex-none justify-center transition-all duration-300"
										icon={
											<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
										}
									>
										Trailer
									</Button>
								)}
								<Button
									variant={isInWatchlist(movie.id, 'movie') ? "primary" : "ghost"}
									size="lg"
									className="flex-none !w-16 !h-16 md:!w-auto md:!h-auto border !px-0 md:!px-8 border-white/10"
									onClick={() => {
										if (isInWatchlist(movie.id, 'movie')) {
											removeFromWatchlist(movie.id, 'movie');
										} else {
											addToWatchlist(movie as unknown as Movie, 'movie');
										}
									}}
									icon={
										isInWatchlist(movie.id, 'movie') ? (
											<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
											</svg>
										) : (
											<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
											</svg>
										)
									}
								>
									<div className="hidden md:block">{isInWatchlist(movie.id, 'movie') ? 'In Watchlist' : 'Add to Watchlist'}</div>
								</Button>
							</div>
						</div>
					</div >
				</div >
			</div >

			{/* CONTENT CONTAINER */}
			<div className="relative z-20 bg-[#0d0d0d] pt-12">

				{/* CAST SECTION */}
				<section className="container mx-auto px-6 md:px-12">
					<CastList cast={cast} />
				</section>

				<div className="h-px bg-white/10 w-full mb-20 container mx-auto"></div>

				{/* DETAILS & CREW GRID */}
				<section className="container mx-auto px-6 md:px-12 mb-20">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
						{/* Left: Crew */}
						<BehindTheScenes crew={crew} />

						{/* Right: Info */}
						<div className="bg-white/5 p-8 rounded-3xl border border-white/5 h-fit backdrop-blur-sm">
							<h3 className="text-xl font-bold text-white mb-6">Movie Info</h3>
							<div className="space-y-6">
								<div>
									<span className="block text-sm text-white/40 mb-1">Production Companies</span>
									<div className="flex flex-wrap gap-2">
										{movie.production_companies.map(c => (
											<span key={c.id} className="text-white/90 font-medium">{c.name}</span>
										))}
									</div>
								</div>

								<div className="grid grid-cols-2 gap-6">
									<div>
										<span className="block text-sm text-white/40 mb-1">Budget</span>
										<span className="text-white/90 font-medium">{formatCurrency(movie.budget)}</span>
									</div>
									<div>
										<span className="block text-sm text-white/40 mb-1">Revenue</span>
										<span className="text-green-400 font-medium">{formatCurrency(movie.revenue)}</span>
									</div>
								</div>

								<div>
									<span className="block text-sm text-white/40 mb-1">Genres</span>
									<div className="flex flex-wrap gap-2">
										{movie.genres.map(g => (
											<span key={g.id} className="bg-white/10 text-white/80 px-3 py-1 rounded-lg text-sm border border-white/5">
												{g.name}
											</span>
										))}
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				<div className="h-px bg-white/10 w-full mb-20 container mx-auto"></div>

				{/* REVIEWS SECTION */}
				{
					reviews.length > 0 && (
						<section className="container mx-auto px-6 md:px-12 mb-20">
							<h2 className="text-2xl md:text-3xl font-bold text-white mb-8 flex items-center gap-3">
								<span className="w-1 h-8 bg-yellow-500 rounded-full"></span>
								User Reviews
							</h2>
							<div className="flex md:grid md:grid-cols-2 gap-6 overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x no-scrollbar">
								{reviews.map((review) => (
									<div key={review.id} className="min-w-[85vw] md:min-w-0 snap-center bg-white/5 hover:bg-white/10 p-6 rounded-2xl border border-white/5 transition-colors cursor-pointer" onClick={() => router.push(`/review/${review.id}`)}>
										<div className="flex items-center justify-between mb-4">
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold text-white">
													{review.author[0].toUpperCase()}
												</div>
												<span className="font-semibold text-white">{review.author}</span>
											</div>
											{review.author_details.rating && (
												<div className="flex items-center gap-1 text-[#deb522] bg-[#deb522]/10 px-2 py-1 rounded-lg text-sm font-bold">
													<span>★</span>
													<span>{review.author_details.rating}</span>
												</div>
											)}
										</div>
										<p className="text-white/70 line-clamp-4 leading-relaxed text-sm">
											{review.content.replace(/\*\*/g, '')}
										</p>
										<span className="inline-block mt-4 text-purple-400 hover:text-purple-300 text-sm font-medium">
											Read full review →
										</span>
									</div>
								))}
							</div>
						</section>
					)
				}

				{/* SIMILAR MOVIES SECTION */}
				{
					(similarMovies.length > 0 || recSource === 'TasteDive') && (
						<section className="container mx-auto px-6 md:px-12 pb-20">
							<div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
								<h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
									<span className="w-1 h-8 bg-red-500 rounded-full"></span>
									More Like This
								</h2>

								{/* Source Selector */}
								<div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10 w-fit">
									<button
										onClick={() => setRecSource('TMDB')}
										className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${recSource === 'TMDB'
											? 'bg-white/10 text-white shadow-sm'
											: 'text-white/60 hover:text-white hover:bg-white/5'
											}`}
									>
										TMDB
									</button>
									<button
										onClick={() => setRecSource('TasteDive')}
										className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${recSource === 'TasteDive'
											? 'bg-white/10 text-white shadow-sm'
											: 'text-white/60 hover:text-white hover:bg-white/5'
											}`}
									>
										TasteDive
									</button>
								</div>
							</div>

							<div className="flex md:grid md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 overflow-x-auto md:overflow-visible pb-8 md:pb-0 snap-x no-scrollbar">
								{recSource === 'TMDB' ? (
									similarMovies.map((movie) => (
										<div key={movie.id} className="min-w-[40vw] sm:min-w-[30vw] md:min-w-0 snap-center">
											<InteractiveMovieBox
												movie={movie}
												className="w-full aspect-[2/3] rounded-xl"
											/>
										</div>
									))
								) : isLoadingTasteDive ? (
									// Loading skeletons for TasteDive
									[...Array(5)].map((_, i) => (
										<div key={i} className="min-w-[40vw] sm:min-w-[30vw] md:min-w-0 snap-center">
											<div className="w-full aspect-[2/3] bg-white/5 rounded-xl animate-pulse"></div>
										</div>
									))
								) : tasteDiveMovies.length > 0 ? (
									tasteDiveMovies.map((movie) => (
										<div key={movie.id} className="min-w-[40vw] sm:min-w-[30vw] md:min-w-0 snap-center">
											<InteractiveMovieBox
												movie={movie}
												className="w-full aspect-[2/3] rounded-xl"
											/>
										</div>
									))
								) : (
									<div className="col-span-full py-10 text-center text-white/40 w-full">
										No recommendations found from TasteDive.
									</div>
								)}
							</div>
						</section>
					)
				}
			</div >

			{trailerKey && (
				<TrailerModal
					trailerKey={trailerKey}
					isOpen={showTrailer}
					onClose={() => setShowTrailer(false)}
				/>
			)}

		</div >
	);
}
