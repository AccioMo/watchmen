'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getMovieById, getMovieCredits } from '@/API/TMDB';
import ActorCard from '@/app/Components/ActorCard';

export default function WatchPage() {
	const params = useParams();
	const tmdbId = params?.id as string;

	const [movieInfo, setMovieInfo] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [cast, setCast] = useState<any[]>([]);

	// Fetch TMDB movie info
	useEffect(() => {
		const fetchMovie = async () => {
			if (!tmdbId) {
				setError('Movie ID not provided');
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				const [tmdbMovie, creditsData] = await Promise.all([
					getMovieById(tmdbId),
					getMovieCredits(tmdbId)
				]);

				if (!tmdbMovie) {
					setError('Movie not found on TMDB');
					setLoading(false);
					return;
				}

				setMovieInfo(tmdbMovie);
				setCast(creditsData.cast?.slice(0, 15) || []);
				setLoading(false);
			} catch (err) {
				const message = err instanceof Error ? err.message : 'Failed to load movie';
				setError(message);
				setLoading(false);
			}
		};

		fetchMovie();
	}, [tmdbId]);

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent animated-bg flex items-center justify-center">
				<div className="text-center">
					<div className="relative w-16 h-16 mx-auto mb-4">
						<div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
						<div className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
					</div>
					<p className="text-white text-lg">Loading movie...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent animated-bg">
			{/* Reduced Vignette Effect */}
			<div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 pointer-events-none z-10"></div>
			<div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none z-10"></div>

			{/* Main Content */}
			<div className="relative z-20 container mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12 lg:py-16">


				{/* Movie Title */}
				{movieInfo && (
					<div className="mb-6 sm:mb-8">
						<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3">
							{movieInfo.title}
						</h1>
						{movieInfo.overview && (
							<p className="text-sm sm:text-base md:text-lg text-white/70 max-w-3xl line-clamp-3 sm:line-clamp-4 md:line-clamp-none">
								{movieInfo.overview}
							</p>
						)}
					</div>
				)}

				{/* Video Player Container */}
				<div className="mb-6 sm:mb-8 relative max-w-7xl mx-auto aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
					<iframe
						src={`https://vidsrc.xyz/embed/movie/${tmdbId}`}
						className="w-full h-full border-0"
						allowFullScreen
						referrerPolicy="origin"
						title="Movie Player"
					/>
				</div>

				{/* CAST SECTION */}
				{cast.length > 0 && (
					<section className="mt-12 sm:mt-16 mb-20 animate-fade-in-up">
						<div className="flex items-center justify-between mb-8">
							<h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
								<span className="w-1 h-8 bg-purple-500 rounded-full"></span>
								Top Cast
							</h2>
						</div>

						<div className="flex overflow-x-auto gap-6 pb-8 snap-x custom-scrollbar">
							{cast.map((actor: any) => (
								<ActorCard
									key={actor.id}
									id={actor.id}
									name={actor.name}
									character={actor.character}
									profilePath={actor.profile_path}
								/>
							))}
						</div>
					</section>
				)}
			</div>
		</div>
	);
}
