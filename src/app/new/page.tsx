"use client";

import { useEffect, useState } from "react";
import { getImageURL, getTMDBMoviesBy, Movie } from "@/API/TMDB";
import { RatingIMDB, RatingRoTo } from "@/app/Components/Ratings";
import TwoEmblaCarousel from "@/app/Components/Carousel/TwoEmblaCarousel";

function New() {
	const [newMovies, setNewMovies] = useState<Movie[]>([]);
	const [loading, setLoading] = useState(false);
	
	useEffect(() => {
		if (loading || newMovies.length > 0) return;
		
		setLoading(true);
		const fetchMovies = async () => {
			try {
				const promises: Promise<Movie[]>[] = [];
				for (let i = 1; i < 4; i++) {
					promises.push(getTMDBMoviesBy("now_playing", i));
				}
				const results = await Promise.all(promises);
				const allMovies = results.flat();
				setNewMovies(allMovies);
			} catch (error) {
				console.error("Error fetching new movies:", error);
			} finally {
				setLoading(false);
			}
		};
		
		fetchMovies();
	}, [loading, newMovies.length]);
	
	console.log("New Movies: ", newMovies.length);
	return (
		<div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent animated-bg">
			<div className="bg-gradient-to-b from-transparent to-black/20">
				<div className="hiddem h-screen">
					{newMovies && newMovies[1] && (
						<div
							className="relative w-full h-full overflow-hidden 
							before:'' before:absolute before:top-0 before:left-0 before:w-full before:h-24 before:bg-gradient-to-b before:from-black before:to-transparent before:opacity-40"
						>
							<picture className="opacity-95 -z-10">
								<source
									srcSet={getImageURL(
										newMovies[1].backdrop_path,
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
										transform: "translate(-50%, -50%) scale(2)",
										objectFit: "contain",
										objectPosition: "center",
										opacity: "0.5",
									}}
								/>
							</picture>
							<div className="absolute bottom-4 left-4 h-56 w-[45%]">
								<div className="rounded-2xl">
									<div className="flex flex-col w-full h-full px-2">
										<div className="flex justify-between pt-3 px-1">
											<h2 className="font-bold text-xl">
												{
													newMovies[1]
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
											{newMovies[1].overview}
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
							<TwoEmblaCarousel slides={[...newMovies.slice(0, 15)]} direction="forward" options={{ loop: true, dragFree: true }} />
						</div>
						<div className="mb-8">
							<TwoEmblaCarousel slides={[...newMovies.slice(15, 30)]} direction="backward" options={{ loop: true, dragFree: true }} />
						</div>
						<div className="mb-8">
							<TwoEmblaCarousel slides={[...newMovies.slice(30, 45)]} direction="forward" options={{ loop: true, dragFree: true }} />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default New;
