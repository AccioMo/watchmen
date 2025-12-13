'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
	getMovieById,
	getMovieCredits,
	getSimilarMovies,
	Movie,
	MovieDetails
} from "../../../../API/TMDB";
import Button from "../../../../Components/Button";
import InteractiveMovieBox from "../../../../Components/InteractiveMovieBox";
import CastList from "../../../../Components/CastList";
import BehindTheScenes from "../../../../Components/BehindTheScenes";
import { useWatchlist } from "../../../../context/WatchlistContext";

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

export default function WatchPage() {
	const params = useParams();
	const router = useRouter();
	const id = params?.id as string;

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [movieTitle, setMovieTitle] = useState<string>("");
	const [tmdbMovie, setTmdbMovie] = useState<MovieDetails | null>(null);
	const [cast, setCast] = useState<CastMember[]>([]);
	const [crew, setCrew] = useState<CrewMember[]>([]);
	const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
	const [theatreMode, setTheatreMode] = useState(false);
	const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();

	useEffect(() => {
		const initWatch = async () => {
			if (!id) return;

			try {
				setLoading(true);

				// Handle both raw IDs and "movie/id" format if any legacy links exist
				const cleanId = id.replace('movie/', '');

				// Get TMDB Data
				const tmdbData = await getMovieById(cleanId);
				if (!tmdbData) throw new Error("Could not find movie details.");

				setTmdbMovie(tmdbData);
				setMovieTitle(tmdbData.title);
				document.title = `Watch ${tmdbData.title}`;

				// Fetch extras
				Promise.all([
					getMovieCredits(tmdbData.id),
					getSimilarMovies(tmdbData.id)
				]).then(([credits, similar]) => {
					if (credits?.cast) setCast(credits.cast.slice(0, 15));
					if (credits?.crew) {
						setCrew(credits.crew.filter((member: CrewMember) =>
							['Director', 'Producer', 'Executive Producer', 'Writer', 'Screenplay', 'Cinematography'].includes(member.job)
						).slice(0, 10));
					}
					if (similar) setSimilarMovies(similar.slice(0, 10));
				}).catch(e => console.warn("Failed to load extras:", e));

				setLoading(false);

			} catch (err: unknown) {
				console.error(err);
				const message = err instanceof Error ? err.message : "Something went wrong.";
				setError(message);
				setLoading(false);
			}
		};

		initWatch();
	}, [id]);

	if (loading) {
		return (
			<div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white space-y-6">
				<div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
				<p className="text-xl font-light tracking-wide text-white/80 animate-pulse">Loading movie...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white space-y-8 p-6">
				<div className="text-center space-y-4 max-w-lg">
					<h1 className="text-4xl font-bold text-red-500">Error</h1>
					<p className="text-white/60">{error}</p>
				</div>
				<Button onClick={() => router.back()} variant="secondary">Back</Button>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-purple-500/30 pb-20">

			<div className="container mx-auto px-4 md:px-8 pt-24 lg:pt-16">

				<div className={theatreMode ? 'max-w-7xl mx-auto mb-12 relative z-50 group transition-all duration-500' : 'max-w-5xl mx-auto mb-12 relative z-50 group transition-all duration-500'}>
					<div className={`aspect-video w-full rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 bg-black relative`}>
						<button
							onClick={() => setTheatreMode(!theatreMode)}
							className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black/80 text-white/80 hover:text-white px-4 py-2 rounded-full text-sm font-bold backdrop-blur-md border border-white/10 transition-all opacity-0 group-hover:opacity-100"
						>
							Theatre Mode
						</button>
						<iframe
							src={`https://vidsrc-embed.ru/embed/movie/${tmdbMovie?.id}`}
							className="w-full h-full border-0"
							allowFullScreen
							referrerPolicy="origin"
							title={movieTitle}
						/>
					</div>
				</div>

				{/* Theatre Mode Overlay */}
				<div className={`fixed inset-0 bg-[#050505] transition-opacity duration-700 pointer-events-none z-40 ${theatreMode ? 'opacity-95' : 'opacity-0'}`}></div>

				{/* INFO GRID */}
				<div className={`max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 transition-opacity duration-500 ${theatreMode ? 'opacity-10 pointer-events-none' : 'opacity-100'}`}>

					{/* Left Column: Details */}
					<div className="lg:col-span-3 space-y-12">
						{tmdbMovie && (
							<div className="animate-fade-in-up">
								<div className="flex items-center justify-between mb-4">
									<h1 className="text-4xl md:text-5xl font-bold text-white">{movieTitle}</h1>
									<Button
										variant={tmdbMovie && isInWatchlist(tmdbMovie.id) ? "primary" : "secondary"}
										size="sm"
										onClick={() => {
											if (tmdbMovie) {
												if (isInWatchlist(tmdbMovie.id)) {
													removeFromWatchlist(tmdbMovie.id);
												} else {
													addToWatchlist(tmdbMovie);
												}
											}
										}}
										icon={
											tmdbMovie && isInWatchlist(tmdbMovie.id) ? (
												<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
													<path d="M5 13l4 4L19 7" />
												</svg>
											) : (
												<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
												</svg>
											)
										}
									>
										{tmdbMovie && isInWatchlist(tmdbMovie.id) ? "In Watchlist" : "Add to Watchlist"}
									</Button>
								</div>
								<div className="flex flex-wrap items-center gap-4 text-sm text-white/60 mb-6">
									{tmdbMovie.release_date && (
										<span className="bg-white/10 px-3 py-1 rounded text-white/90 font-medium">
											{new Date(tmdbMovie.release_date).getFullYear()}
										</span>
									)}
									{tmdbMovie.runtime > 0 && <span>{tmdbMovie.runtime} min</span>}
									{tmdbMovie.vote_average > 0 && (
										<span className="flex items-center gap-1 text-[#deb522]">
											★ {tmdbMovie.vote_average.toFixed(1)}
										</span>
									)}
								</div>

								{tmdbMovie.genres && (
									<div className="flex flex-wrap gap-2 mb-6">
										{tmdbMovie.genres.map((g: { id: number; name: string }) => (
											<span key={g.id || g.name} className="text-sm border border-white/10 px-3 py-1 rounded-full text-white/70">
												{g.name}
											</span>
										))}
									</div>
								)}

								<p className="text-lg text-white/80 leading-relaxed font-light">
									{tmdbMovie.overview}
								</p>
							</div>
						)}

						{/* Cast Section */}
						<CastList cast={cast} />

						{/* Crew Section */}
						<div className="mt-12">
							<BehindTheScenes crew={crew} />
						</div>
					</div>
				</div>

				{/* Similar Movies Section */}
				{similarMovies.length > 0 && (
					<div className="max-w-7xl mx-auto mt-20 mb-10">
						<h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
							<span className="w-1 h-8 bg-blue-500 rounded-full"></span>
							You May Also Like
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
					</div>
				)}

			</div>

			<style jsx global>{`
				.custom-scrollbar::-webkit-scrollbar {
					height: 6px;
				}
				.custom-scrollbar::-webkit-scrollbar-track {
					background: transparent;
				}
				.custom-scrollbar::-webkit-scrollbar-thumb {
					background: rgba(255, 255, 255, 0.2);
					border-radius: 10px;
				}
				.custom-scrollbar::-webkit-scrollbar-thumb:hover {
					background: rgba(255, 255, 255, 0.4);
				}
				@keyframes fadeInUp {
					from { opacity: 0; transform: translateY(20px); }
					to { opacity: 1; transform: translateY(0); }
				}
				.animate-fade-in-up {
					animation: fadeInUp 0.8s ease-out forwards;
				}
			`}</style>
		</div>
	);
}
