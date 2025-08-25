"use client";

import { useEffect, useState } from "react";
import { getImageURL, getTMDBMoviesBy, Movie } from "@/API/TMDB";
import { RatingIMDB, RatingRoTo } from "@/app/Components/Ratings";
import TwoEmblaCarousel from "@/app/Components/Carousel/TwoEmblaCarousel";

function TopRated() {
	const [topMovies, setTopRatedMovies] = useState<Movie[]>([]);
	const [loading, setLoading] = useState(false);
	
	useEffect(() => {
		if (loading || topMovies.length > 0) return;
		
		setLoading(true);
		const fetchMovies = async () => {
			try {
				const promises: Promise<Movie[]>[] = [];
				for (let i = 1; i < 4; i++) {
					promises.push(getTMDBMoviesBy("top_rated", i));
				}
				const results = await Promise.all(promises);
				const allMovies = results.flat();
				setTopRatedMovies(allMovies);
			} catch (error) {
				console.error("Error fetching top movies:", error);
			} finally {
				setLoading(false);
			}
		};
		
		fetchMovies();
	}, [loading, topMovies.length]);
	
	console.log("TopRated Movies: ", topMovies.length);
	return (
		<div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent animated-bg">
			<div className="bg-gradient-to-b from-transparent to-black/20">
				<div className="hiddem h-screen py-2 px-3">
					{topMovies && topMovies[1] && (
						<div
							className="relative w-full h-full glass-card overflow-hidden 
							before:'' before:absolute before:top-0 before:left-0 before:w-full before:h-24 before:bg-gradient-to-b before:from-black before:to-transparent before:opacity-40"
						>
							<picture className="opacity-95 -z-10">
								<source
									srcSet={getImageURL(
										topMovies[1].backdrop_path,
										"max"
									)}
									sizes="100vh"
									media="(min-width: 1024px)"
								/>
								<img
									src="https://via.placeholder.com/640x360"
									sizes="100vh"
									alt="Placeholder"
									style={{
										position: "absolute",
										top: "50%",
										left: "50%",
										height: "100%",
										width: "100%",
										transform: "translate(-50%, -50%)",
										objectFit: "cover",
										objectPosition: "center",
									}}
								/>
							</picture>
							<div className="absolute bottom-4 left-4 h-56 w-[45%]">
								<div className="glass-card glass-border">
									<div className="flex flex-col w-full h-full px-2">
										<div className="flex justify-between pt-3 px-1">
											<h2 className="font-bold text-xl">
												{
													topMovies[1]
														.original_title
												}
											</h2>
											<RatingIMDB>
												8.9
											</RatingIMDB>
											<RatingRoTo>
												90%
											</RatingRoTo>
										</div>
										<p className="flex flex-grow items-center">
											{topMovies[1].overview}
										</p>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
				<div className="py-4">
					<div>
						<div className="mb-8">
							<TwoEmblaCarousel slides={[...topMovies.slice(0, 15)]} direction="forward" options={{ loop: true, dragFree: true }} />
						</div>
						<div className="mb-8">
							<TwoEmblaCarousel slides={[...topMovies.slice(15, 30)]} direction="backward" options={{ loop: true, dragFree: true }} />
						</div>
						<div className="mb-8">
							<TwoEmblaCarousel slides={[...topMovies.slice(30, 45)]} direction="forward" options={{ loop: true, dragFree: true }} />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default TopRated;
