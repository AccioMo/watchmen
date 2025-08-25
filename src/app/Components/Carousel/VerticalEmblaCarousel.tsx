import React, { useCallback, useEffect, useRef, useState } from "react";
import { EmblaCarouselType, EmblaEventType, EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import WheelGestures from "embla-carousel-wheel-gestures";
import { getTMDBMoviesByGenreName, getImageURL, Movie } from "../../../API/TMDB";
import { useRouter } from "next/navigation";

import "../../styles/vertical-embla.css";

const TWEEN_FACTOR_BASE = 0.84;

const numberWithinRange = (number: number, min: number, max: number): number =>
	Math.min(Math.max(number, min), max);

type PropType = {
	genre: string;
	options?: EmblaOptionsType;
};

interface SlideProps {
	movie: Movie;
}

export const VerticalSlide: React.FC<SlideProps> = React.memo(({ movie }) => {
	const router = useRouter();
	const imageUrl = getImageURL(movie.poster_path, 'mid');
	
	const handleClick = useCallback(() => {
		router.push(`/movie/${movie.id}`);
	}, [router, movie.id]);
	
	return (
		<div className="relative rounded-xl transition-all duration-300 h-full w-full group shadow-xl cursor-pointer"
			onClick={handleClick}>
			<div className="select-none h-full w-full border-none bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-0 group-hover:opacity-100 top-0 left-0 absolute z-10 transition-all duration-300">
				<div className="flex items-end p-4 h-full w-full">
					<div className="w-full text-white">
						<h3 className="text-lg font-bold mb-2 text-white drop-shadow-lg line-clamp-2">{movie.title}</h3>
						<p className="text-xs text-white/90 leading-relaxed line-clamp-3">{movie.overview}</p>
						<div className="mt-3 flex items-center gap-2">
							<span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
								★ {movie.vote_average.toFixed(1)}
							</span>
							<span className="text-xs text-white/70">
								{new Date(movie.release_date).getFullYear()}
							</span>
						</div>
					</div>
				</div>
			</div>
			<img
				className="object-cover h-full w-full"
				src={imageUrl}
				alt={movie.title}
				loading="lazy"
			/>
			<div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none"></div>
		</div>
	);
});

VerticalSlide.displayName = 'VerticalSlide';

const VerticalEmblaCarousel: React.FC<PropType> = React.memo((props) => {
	const { options, genre } = props;
	const updatedSlide = useRef(false);
	const [slides, setSlides] = useState<Movie[]>([]);
	const [pageNum, setPageNum] = useState(1);
	const [emblaRef, emblaApi] = useEmblaCarousel({
		...options,
		axis: 'y',
		dragFree: true,
		loop: true,
		skipSnaps: false,
		containScroll: 'trimSnaps'
	}, [WheelGestures()]);
	const tweenFactor = useRef(0);

	const setTweenFactor = useCallback((emblaApi: EmblaCarouselType) => {
		tweenFactor.current =
			TWEEN_FACTOR_BASE * emblaApi.scrollSnapList().length;
	}, []);

	const tweenOpacity = useCallback(
		(emblaApi: EmblaCarouselType, eventName?: EmblaEventType) => {
			const engine = emblaApi.internalEngine();
			const scrollProgress = emblaApi.scrollProgress();
			const slidesInView = emblaApi.slidesInView();
			const isScrollEvent = eventName === "scroll";

			emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
				let diffToTarget = scrollSnap - scrollProgress;
				const slidesInSnap = engine.slideRegistry[snapIndex];

				slidesInSnap.forEach((slideIndex) => {
					if (isScrollEvent && !slidesInView.includes(slideIndex)) return;

					if (engine.options.loop) {
						engine.slideLooper.loopPoints.forEach((loopItem) => {
							const target = loopItem.target();
							if (slideIndex === loopItem.index && target !== 0) {
								const sign = Math.sign(target);
								if (sign === -1) {
									diffToTarget = scrollSnap - (1 + scrollProgress);
								}
								if (sign === 1) {
									diffToTarget = scrollSnap + (1 - scrollProgress);
								}
							}
						});
					}

					const tweenValue = 1 - Math.abs(diffToTarget * tweenFactor.current);
					const opacity = numberWithinRange(tweenValue, 0.3, 1).toString();
					const slideNode = emblaApi.slideNodes()[slideIndex];
					slideNode.style.opacity = opacity;
					slideNode.style.transform = 'scale(1)';
				});
			});
		},
		[]
	);

	const logSlidesInView = useCallback(
		(emblaApi: EmblaCarouselType) => {
			const currentIndex = emblaApi.internalEngine().index.get();
			const threshold = Math.round(slides.length * 0.8);
			
			if (currentIndex >= threshold && !updatedSlide.current && slides.length > 0) {
				updatedSlide.current = true;
				getTMDBMoviesByGenreName(genre, pageNum)
					.then((nextSlides) => {
						if (nextSlides.length > 0) {
							setSlides((prevSlides) => [...prevSlides, ...nextSlides]);
							setPageNum((prevPageNum) => prevPageNum + 1);
						}
						updatedSlide.current = false;
					})
					.catch((error) => {
						console.error("Error fetching more movies:", error);
						updatedSlide.current = false;
					});
			}
		},
		[pageNum, slides.length, genre]
	);

	useEffect(() => {
		if (!emblaApi) return;
		
		// Initialize slides if empty
		if (slides.length === 0) {
			getTMDBMoviesByGenreName(genre, pageNum)
				.then((nextSlides) => {
					setSlides(nextSlides);
					setPageNum(2);
					
					// Set different random starting positions based on path
					setTimeout(() => {
						let randomIndex;
						switch (genre) {
							case 'popular':
								randomIndex = Math.floor(Math.random() * Math.min(5, nextSlides.length));
								break;
							case 'top_rated':
								randomIndex = Math.floor(Math.random() * Math.min(8, nextSlides.length));
								break;
							case 'now_playing':
								randomIndex = Math.floor(Math.random() * Math.min(12, nextSlides.length));
								break;
							case 'upcoming':
								randomIndex = Math.floor(Math.random() * Math.min(15, nextSlides.length));
								break;
							default:
								randomIndex = Math.floor(Math.random() * nextSlides.length);
						}
						emblaApi.scrollTo(randomIndex, false);
					}, 50);
				})
				.catch((error) => console.error("Error fetching initial movies:", error));
		}
		
		// Set up embla events
		setTweenFactor(emblaApi);
		tweenOpacity(emblaApi);
		
		emblaApi
			.on("slidesInView", logSlidesInView)
			.on("reInit", setTweenFactor)
			.on("reInit", tweenOpacity)
			.on("scroll", tweenOpacity)
			.on("slideFocus", tweenOpacity);
			
		return () => {
			emblaApi.off("slidesInView", logSlidesInView);
		};
	}, [emblaApi, setTweenFactor, tweenOpacity, logSlidesInView, genre, pageNum, slides.length]);

	return (
		<div className="vertical-embla">
			<div className="vertical-embla__viewport" ref={emblaRef}>
				<div className="vertical-embla__container">
					{slides.map((movie: Movie, index: number) => (
						<div key={`${movie.id}-${index}`} className="vertical-embla__slide">
							<VerticalSlide movie={movie} />
						</div>
					))}
				</div>
			</div>
		</div>
	);
});

VerticalEmblaCarousel.displayName = 'VerticalEmblaCarousel';

export default VerticalEmblaCarousel;
