'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getImageURL, Movie } from "@/API/TMDB";
import { RatingIMDB } from "@/app/Components/Ratings";

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

export default function MoviePage() {
	const params = useParams();
	const router = useRouter();
	const [movie, setMovie] = useState<MovieDetails | null>(null);
	const [cast, setCast] = useState<CastMember[]>([]);
	const [crew, setCrew] = useState<CrewMember[]>([]);
	const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const slug = params?.slug as string;

	const getMovieDetails = async (movieId: string) => {
		try {
			const response = await fetch(
				`https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
			);
			if (!response.ok) throw new Error('Movie not found');
			return await response.json();
		} catch (error) {
			throw new Error('Failed to fetch movie details');
		}
	};

	const getMovieCredits = async (movieId: string) => {
		try {
			const response = await fetch(
				`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
			);
			if (!response.ok) throw new Error('Credits not found');
			return await response.json();
		} catch (error) {
			throw new Error('Failed to fetch movie credits');
		}
	};

	const getSimilarMovies = async (movieId: string) => {
		try {
			const response = await fetch(
				`https://api.themoviedb.org/3/movie/${movieId}/similar?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
			);
			if (!response.ok) throw new Error('Similar movies not found');
			const data = await response.json();
			return data.results || [];
		} catch (error) {
			console.error('Failed to fetch similar movies:', error);
			return [];
		}
	};

	const searchMovieByName = async (movieName: string) => {
		try {
			const response = await fetch(
				`https://api.themoviedb.org/3/search/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&query=${encodeURIComponent(movieName.replace(/-/g, ' '))}`
			);
			if (!response.ok) throw new Error('Movie not found');
			const data = await response.json();
			return data.results?.[0] || null;
		} catch (error) {
			throw new Error('Failed to search for movie');
		}
	};

	useEffect(() => {
		const fetchMovieData = async () => {
			setLoading(true);
			setError(null);

			try {
				let movieData: MovieDetails;

				// Check if slug is a number (movie ID) or a string (movie name)
				if (/^\d+$/.test(slug)) {
					// It's a movie ID
					movieData = await getMovieDetails(slug);
				} else {
					// It's a movie name, search for it first
					const searchResult = await searchMovieByName(slug);
					if (!searchResult) {
						throw new Error('Movie not found');
					}
					movieData = await getMovieDetails(searchResult.id.toString());
				}

				setMovie(movieData);

				// Fetch additional data
				const [creditsData, similarData] = await Promise.all([
					getMovieCredits(movieData.id.toString()),
					getSimilarMovies(movieData.id.toString())
				]);

				setCast(creditsData.cast?.slice(0, 10) || []);
				setCrew(creditsData.crew?.filter((member: CrewMember) => 
					['Director', 'Producer', 'Executive Producer', 'Writer', 'Screenplay'].includes(member.job)
				).slice(0, 8) || []);
				setSimilarMovies(similarData.slice(0, 6));

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
			<div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent animated-bg">
				<div className="pt-32 flex items-center justify-center min-h-[60vh]">
					<div className="p-8 rounded-2xl">
						<div className="animate-pulse flex space-x-4">
							<div className="rounded-full bg-gray-300 h-10 w-10"></div>
							<div className="flex-1 space-y-2 py-1">
								<div className="h-4 bg-gray-300 rounded w-3/4"></div>
								<div className="h-4 bg-gray-300 rounded w-1/2"></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error || !movie) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent animated-bg">
				<div className="pt-32 flex items-center justify-center min-h-[60vh]">
					<div className="p-8 rounded-2xl text-center">
						<h1 className="text-2xl font-bold text-white mb-4">Movie Not Found</h1>
						<p className="text-white/70 mb-6">{error}</p>
						<button 
							onClick={() => router.back()}
							className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold py-2 px-6 rounded-xl transition-all"
						>
							Go Back
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-primary via-primary to-primary animated-bg">
			
			{/* Hero Section */}
			<div className="relative h-screen overflow-hidden">
				<img
					src={getImageURL(movie.backdrop_path, 'max')}
					alt={movie.title}
					className="absolute inset-0 w-full h-full object-cover"
				/>
				<div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
				<div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent"></div>
				
				<div className="relative z-10 flex items-end h-full">
					<div className="container mx-auto px-4 md:px-8 pb-16">
						<div className="flex flex-col md:flex-row gap-8 max-w-6xl">
							{/* Poster */}
							<div className="flex-shrink-0">
								<img
									src={getImageURL(movie.poster_path, 'mid')}
									alt={movie.title}
									className="w-64 md:w-80 rounded-2xl shadow-2xl"
								/>
							</div>
							
							{/* Movie Info */}
							<div className="flex-1 space-y-4">
								<div className="space-y-2">
									<h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
										{movie.title}
									</h1>
									{movie.tagline && (
										<p className="text-xl text-white/80 italic">"{movie.tagline}"</p>
									)}
								</div>
								
								<div className="flex flex-wrap items-center gap-4">
									<RatingIMDB>{movie.vote_average.toFixed(1)}</RatingIMDB>
									<span className="text-white/70">({movie.vote_count.toLocaleString()} votes)</span>
									<span className="text-white/70">•</span>
									<span className="text-white/70">{new Date(movie.release_date).getFullYear()}</span>
									{movie.runtime && (
										<>
											<span className="text-white/70">•</span>
											<span className="text-white/70">{formatRuntime(movie.runtime)}</span>
										</>
									)}
								</div>
								
								<div className="flex flex-wrap gap-2">
									{movie.genres.map((genre) => (
										<span key={genre.id} className="bg-white/20 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
											{genre.name}
										</span>
									))}
								</div>
								
								<p className="text-white/90 text-lg leading-relaxed max-w-3xl">
									{movie.overview}
								</p>
								
								<div className="flex gap-4 pt-4">
									<button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold py-3 px-8 rounded-xl transform hover:scale-105 transition-all duration-300 shadow-lg">
										▶ Watch Now
									</button>
									<button className="bg-white/20 backdrop-blur-sm text-white border border-white/30 font-semibold py-3 px-8 rounded-xl hover:bg-white/30 transition-all">
										+ Add to Watchlist
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Details Section */}
			<div className="container mx-auto px-4 md:px-8 py-16 space-y-16">
				{/* Cast & Crew */}
				<div className="grid md:grid-cols-2 gap-12">
					{/* Cast */}
					{cast.length > 0 && (
						<div>
							<h2 className="text-3xl font-bold text-white mb-6">Cast</h2>
							<div className="grid grid-cols-2 gap-4">
								{cast.map((actor) => (
									<div key={actor.id} className="flex items-center space-x-3 p-3 rounded-xl">
										<img
											src={actor.profile_path ? getImageURL(actor.profile_path, 'small') : '/placeholder-person.svg'}
											alt={actor.name}
											className="w-12 h-12 rounded-full object-cover"
										/>
										<div className="flex-1 min-w-0">
											<p className="text-white font-semibold truncate">{actor.name}</p>
											<p className="text-white/70 text-sm truncate">{actor.character}</p>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Crew */}
					{crew.length > 0 && (
						<div>
							<h2 className="text-3xl font-bold text-white mb-6">Crew</h2>
							<div className="grid grid-cols-1 gap-4">
								{crew.map((member, index) => (
									<div key={`${member.id}-${index}`} className="flex items-center space-x-3 p-3 rounded-xl">
										<img
											src={member.profile_path ? getImageURL(member.profile_path, 'small') : '/placeholder-person.svg'}
											alt={member.name}
											className="w-12 h-12 rounded-full object-cover"
										/>
										<div className="flex-1">
											<p className="text-white font-semibold">{member.name}</p>
											<p className="text-white/70 text-sm">{member.job}</p>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</div>

				{/* Movie Details */}
				<div className="p-6 rounded-2xl">
					<h2 className="text-3xl font-bold text-white mb-6">Details</h2>
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
						<div>
							<h3 className="text-white font-semibold mb-2">Status</h3>
							<p className="text-white/70">{movie.status}</p>
						</div>
						<div>
							<h3 className="text-white font-semibold mb-2">Release Date</h3>
							<p className="text-white/70">{new Date(movie.release_date).toLocaleDateString()}</p>
						</div>
						{movie.budget > 0 && (
							<div>
								<h3 className="text-white font-semibold mb-2">Budget</h3>
								<p className="text-white/70">{formatCurrency(movie.budget)}</p>
							</div>
						)}
						{movie.revenue > 0 && (
							<div>
								<h3 className="text-white font-semibold mb-2">Revenue</h3>
								<p className="text-white/70">{formatCurrency(movie.revenue)}</p>
							</div>
						)}
						{movie.spoken_languages.length > 0 && (
							<div>
								<h3 className="text-white font-semibold mb-2">Languages</h3>
								<p className="text-white/70">{movie.spoken_languages.map(lang => lang.name).join(', ')}</p>
							</div>
						)}
						{movie.production_countries.length > 0 && (
							<div>
								<h3 className="text-white font-semibold mb-2">Countries</h3>
								<p className="text-white/70">{movie.production_countries.map(country => country.name).join(', ')}</p>
							</div>
						)}
					</div>
				</div>

				{/* Similar Movies */}
				{similarMovies.length > 0 && (
					<div>
						<h2 className="text-3xl font-bold text-white mb-6">Similar Movies</h2>
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
							{similarMovies.map((similarMovie: Movie, index) => (
								<div 
									key={index}
									className="group cursor-pointer rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl"
									onClick={() => router.push(`/movie/${similarMovie.id}`)}
								>
									<img
										src={getImageURL(similarMovie.poster_path, 'mid')}
										alt={similarMovie.title}
										className="w-full h-64 object-cover"
									/>
									<div className="p-3">
										<h3 className="text-white font-semibold text-sm line-clamp-2">{similarMovie.title}</h3>
										<div className="flex items-center justify-between mt-2">
											<RatingIMDB>{similarMovie.vote_average.toFixed(1)}</RatingIMDB>
											<span className="text-white/70 text-xs">{new Date(similarMovie.release_date).getFullYear()}</span>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
