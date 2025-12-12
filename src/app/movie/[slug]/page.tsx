'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
	getImageURL,
	Movie,
	getMovieById,
	getMovieCredits,
	getSimilarMovies,
	getMovieReviews,
	getMovieVideos,
	searchMovie
} from "../../../API/TMDB";
import { useWatchlist } from "../../../context/WatchlistContext";

import Button from "../../../Components/Button";
import InteractiveMovieBox from "../../../Components/InteractiveMovieBox";
import CastList from "../../../Components/CastList";
import BehindTheScenes from "../../../Components/BehindTheScenes";
import TrailerModal from "../../../Components/TrailerModal";
import Image from "next/image";

interface MovieDetails {
	id: number;
	title: string;
	original_title: string;
	overview: string;
	backdrop_path: string;
	poster_path: string;
	release_date: string;
	vote_average: number;
	vote_count: number;
	runtime: number;
	genres: Array<{ id: number; name: string }>;
	production_companies: Array<{ id: number; name: string; logo_path?: string }>;
	production_countries: Array<{ iso_3166_1: string; name: string }>;
	spoken_languages: Array<{ iso_639_1: string; name: string }>;
	budget: number;
	revenue: number;
	tagline: string;
	status: string;
}

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
				let movieData: any;

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

				const [creditsData, similarData, reviewsData, videosData] = await Promise.all([
					getMovieCredits(movieData.id),
					getSimilarMovies(movieData.id),
					getMovieReviews(movieData.id),
					getMovieVideos(movieData.id)
				]);

				setCast(creditsData.cast?.slice(0, 15) || []);
				setCrew(creditsData.crew?.filter((member: CrewMember) =>
					['Director', 'Producer', 'Executive Producer', 'Writer', 'Screenplay', 'Cinematography'].includes(member.job)
				).slice(0, 10) || []);
				setSimilarMovies(similarData.slice(0, 10));
				setReviews(reviewsData.results?.slice(0, 5) || []);

				const trailer = videosData.results?.find((v: any) => v.type === "Trailer" && v.site === "YouTube");
				setTrailerKey(trailer?.key || null);

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

	return (
		<div className="min-h-screen bg-[#0d0d0d] text-white selection:bg-purple-500/30">

			{/* HERO SECTION */}
			<div className="relative h-screen w-full overflow-hidden">
				{/* Backdrop */}
				{movie.backdrop_path && (
					<>
						<Image
							src={getImageURL(movie.backdrop_path, 'max')}
							alt={movie.title}
							fill
							className="object-cover"
							priority
						/>
						{/* Overlays */}
						<div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/40 to-transparent"></div>
						<div className="absolute inset-0 bg-gradient-to-r from-[#0d0d0d]/90 via-[#0d0d0d]/30 to-transparent"></div>
						<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#0d0d0d_120%)] opacity-80"></div>
					</>
				)}

				<div className="relative z-10 flex flex-col justify-end h-full pb-20 container mx-auto px-6 md:px-12">
					<div className="max-w-4xl space-y-6 animate-fade-in-up">
						{/* Badges */}
						<div className="flex flex-wrap items-center gap-3">
							{movie.status === 'Released' && (
								<span className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md">
									Now Streaming
								</span>
							)}
							<div className="flex items-center gap-1 bg-[#deb522]/20 text-[#deb522] border border-[#deb522]/30 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md">
								<span>★</span>
								<span>{movie.vote_average.toFixed(1)}</span>
							</div>
							<span className="text-white/60 text-sm font-medium">{formatRuntime(movie.runtime)}</span>
							<span className="text-white/40">•</span>
							<span className="text-white/60 text-sm font-medium">{new Date(movie.release_date).getFullYear()}</span>
						</div>

						{/* Title */}
						<h1 className={`${movie.title.length > 40 ? 'text-3xl md:text-5xl lg:text-6xl' : movie.title.length > 20 ? 'text-4xl md:text-6xl lg:text-7xl' : 'text-5xl md:text-7xl lg:text-8xl'} font-black tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/50 drop-shadow-2xl`}>
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
						<div className="flex flex-wrap items-center gap-4 pt-4">
							{trailerKey && (
								<Button
									onClick={() => setShowTrailer(true)}
									variant="primary"
									size="lg"
									className="shadow-[0_0_30px_-5px_theme(colors.white)] hover:shadow-[0_0_40px_-5px_theme(colors.white)] transition-shadow duration-300"
									icon={
										<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
									}
								>
									Watch Trailer
								</Button>
							)}
							<Button
								onClick={() => {
									router.push(`/movie/watch/${movie.id}`);
								}}
								variant="secondary"
								size="lg"
								icon={
									<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
										<path d="M8 5v14l11-7z" />
									</svg>
								}
							>
								Watch Now
							</Button>
							<Button
								variant={isInWatchlist(movie.id) ? "primary" : "ghost"}
								size="lg"
								onClick={() => {
									if (isInWatchlist(movie.id)) {
										removeFromWatchlist(movie.id);
									} else {
										// We need to map MovieDetails to Movie or use a subset.
										// The context expects Movie (from API/TMDB), which matches reasonably well.
										// We might need to ensure properties match or cast.
										addToWatchlist(movie as unknown as Movie);
									}
								}}
								icon={
									isInWatchlist(movie.id) ? (
										<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
											<path d="M5 13l4 4L19 7" />
										</svg>
									) : (
										<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
										</svg>
									)
								}
							>
								{isInWatchlist(movie.id) ? "In Watchlist" : "Watchlist"}
							</Button>
						</div>
					</div >
				</div >
			</div >

			{/* CONTENT CONTAINER */}
			< div className="relative z-20 bg-[#0d0d0d] pt-12" >

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
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{reviews.map((review) => (
									<div key={review.id} className="bg-white/5 hover:bg-white/10 p-6 rounded-2xl border border-white/5 transition-colors cursor-pointer" onClick={() => router.push(`/review/${review.id}`)}>
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
					similarMovies.length > 0 && (
						<section className="container mx-auto px-6 md:px-12 pb-20">
							<h2 className="text-2xl md:text-3xl font-bold text-white mb-8 flex items-center gap-3">
								<span className="w-1 h-8 bg-red-500 rounded-full"></span>
								More Like This
							</h2>
							<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
								{similarMovies.map((movie) => (
									<InteractiveMovieBox
										key={movie.id}
										movie={movie}
										className="w-full aspect-[2/3] rounded-xl"
									/>
								))}
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
