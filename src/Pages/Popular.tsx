import { useEffect, useState } from "react";
import NavBar from "../app/Components/NavBar";
import { LinearBlur } from "../app/Components/LinearBlur";
import { getImageURL, getTMDBMovies, JSONValue } from "../API/TMDB";
import { RatingIMDB, RatingRoTo } from "../app/Components/Ratings";
import EmblaCarousel from "../app/Components/Carousel/EmblaCarousel";
import TwoEmblaCarousel from "../app/Components/Carousel/TwoEmblaCarousel";

function Popular() {
	const [popularMovies, setPopularMovies] = useState<JSONValue[]>([]);
	useEffect(() => {
		for (let i = 1; i < 4; i++) {
			getTMDBMovies("popular", i)
			.then((response) => {
				setPopularMovies([...popularMovies, ...response]);
			})
			.catch((error) => {
				console.error(error);
			});
		};
	}, []);
	console.log("Popular Movies: ", popularMovies.length);
	return (
		<div>
			<NavBar fixed={true} />
			<div className="bg-primary">
				<div className="hiddem h-screen py-2 px-3">
					{popularMovies && popularMovies[1] && (
						<div
							className="relative w-full h-full glass-card overflow-hidden 
							before:'' before:absolute before:top-0 before:left-0 before:w-full before:h-24 before:bg-gradient-to-b before:from-black before:to-transparent before:opacity-40"
						>
							<picture className="opacity-95 -z-10">
								<source
									srcSet={getImageURL(
										popularMovies[1].backdrop_path,
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
													popularMovies[1]
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
											{popularMovies[1].overview}
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
							<TwoEmblaCarousel slides={[...popularMovies.slice(0, 15)]} direction="forward" options={{ loop: true, dragFree: true }} />
						</div>
						<div className="mb-8">
							<TwoEmblaCarousel slides={[...popularMovies.slice(15, 30)]} direction="backward" options={{ loop: true, dragFree: true }} />
						</div>
						<div className="mb-8">
							<TwoEmblaCarousel slides={[...popularMovies.slice(30, 45)]} direction="forward" options={{ loop: true, dragFree: true }} />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Popular;
