import { useEffect, useState } from "react";
import NavBar from "../app/Components/NavBar";
import { getImageURL, getTMDBMovies, Movie } from "../API/TMDB";
import { RatingIMDB } from "../app/Components/Ratings";
import { useRouter } from "next/navigation";

function ForMe() {
	const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
	const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	
	useEffect(() => {
		if (loading || (recommendedMovies.length > 0 && topRatedMovies.length > 0)) return;
		
		setLoading(true);
		const fetchMovies = async () => {
			try {
				const [recommendedResults, topRatedResults] = await Promise.all([
					Promise.all([1, 2, 3, 4].map(i => getTMDBMovies("popular", i))),
					Promise.all([1, 2, 3].map(i => getTMDBMovies("top_rated", i)))
				]);
				
				setRecommendedMovies(recommendedResults.flat());
				setTopRatedMovies(topRatedResults.flat());
			} catch (error) {
				console.error("Error fetching movies for you:", error);
			} finally {
				setLoading(false);
			}
		};
		
		fetchMovies();
	}, [loading, recommendedMovies.length, topRatedMovies.length]);
	
	const featuredMovie = recommendedMovies[0];
	
	const MovieCard = ({ movie, featured = false }: { movie: Movie, featured?: boolean }) => (
		<div 
			className={`group relative cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
				featured ? 'h-80 md:h-96 lg:h-[400px]' : 'h-64 md:h-72 lg:h-80'
			}`}
			onClick={() => router.push(`/movie/${movie.id}`)}
		>
			<img
				src={getImageURL(movie.backdrop_path, featured ? 'max' : 'mid')}
				alt={movie.title}
				className="w-full h-full object-cover"
			/>
			<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
				<div className="absolute bottom-4 left-4 right-4">
					<h3 className="text-white font-bold text-lg mb-2 line-clamp-2">{movie.title}</h3>
					<div className="flex items-center justify-between">
						<RatingIMDB>{(movie.vote_average * 1).toFixed(1)}</RatingIMDB>
						<button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm hover:from-purple-600 hover:to-pink-600 transition-all">
							▶ Watch
						</button>
					</div>
					{featured && (
						<p className="text-white/80 text-sm mt-2 line-clamp-2">{movie.overview}</p>
					)}
				</div>
			</div>
			{featured && (
				<div className="absolute top-4 left-4">
					<span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
						Recommended
					</span>
				</div>
			)}
		</div>
	);
	
	return (
		<div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent animated-bg">
			<NavBar fixed={true} />
			<div className="pt-32 px-4 md:px-8">
				{/* Personalized Hero */}
				{featuredMovie && (
					<div className="mb-12">
						<div className="relative w-full h-[60vh] min-h-96 glass-card overflow-hidden rounded-3xl">
							<img
								src={getImageURL(featuredMovie.backdrop_path, "max")}
								alt="Featured Movie"
								className="w-full h-full object-cover"
							/>
							<div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent">
								<div className="absolute bottom-8 left-8 max-w-2xl">
									<div className="glass-card glass-border p-6 rounded-2xl">
										<div className="flex items-center gap-4 mb-4">
											<span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold">FOR YOU</span>
											<RatingIMDB>{(featuredMovie.vote_average * 1).toFixed(1)}</RatingIMDB>
										</div>
										<h1 className="text-4xl font-bold text-white mb-4">
											{featuredMovie.original_title}
										</h1>
										<p className="text-white/90 text-lg leading-relaxed line-clamp-3 mb-6">
											{featuredMovie.overview}
										</p>
										<button 
											className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-8 rounded-xl transform hover:scale-105 transition-all duration-300 shadow-lg"
											onClick={() => router.push(`/movie/${featuredMovie.id}`)}
										>
											▶ Watch Now
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Curated Recommendations */}
				<div className="mb-12">
					<h2 className="text-3xl font-bold text-white mb-6 px-2">Curated for You</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{recommendedMovies.slice(1, 7).filter(movie => movie && movie.backdrop_path).map((movie, index) => (
							<MovieCard key={index} movie={movie} featured={true} />
						))}
					</div>
				</div>

				{/* Top Rated Picks */}
				<div className="mb-12">
					<h2 className="text-3xl font-bold text-white mb-6 px-2">Top Rated Picks</h2>
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
						{topRatedMovies.slice(0, 15).filter(movie => movie && movie.backdrop_path).map((movie, index) => (
							<MovieCard key={index} movie={movie} />
						))}
					</div>
				</div>

				{/* Popular Choices */}
				<div className="mb-12">
					<h2 className="text-3xl font-bold text-white mb-6 px-2">Popular Choices</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{recommendedMovies.slice(7, 15).filter(movie => movie && movie.backdrop_path).map((movie, index) => (
							<div key={index} className="group relative cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl h-48 md:h-64">
								<img
									src={getImageURL(movie.backdrop_path, 'mid')}
									alt={movie.title}
									className="w-full h-full object-cover"
									onClick={() => router.push(`/movie/${movie.id}`)}
								/>
								<div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
									<div className="absolute bottom-4 left-4 right-4">
										<h3 className="text-white font-bold text-xl mb-2">{movie.title}</h3>
										<div className="flex items-center justify-between">
											<RatingIMDB>{(movie.vote_average * 1).toFixed(1)}</RatingIMDB>
											<button 
												className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm hover:bg-white/30 transition-all"
												onClick={() => router.push(`/movie/${movie.id}`)}
											>
												▶ Watch
											</button>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* More for You */}
				<div className="mb-12">
					<h2 className="text-3xl font-bold text-white mb-6 px-2">More for You</h2>
					<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
						{recommendedMovies.slice(15, 39).filter(movie => movie && movie.backdrop_path).map((movie, index) => (
							<MovieCard key={index} movie={movie} />
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

export default ForMe;