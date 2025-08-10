import React, { useCallback, useEffect, useRef, useState } from "react";
import {
	EmblaCarouselType,
	EmblaEventType,
	EmblaOptionsType,
} from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import {
	NextButton,
	PrevButton,
	usePrevNextButtons,
} from "./EmblaCarouselArrowButtons";
import { getTMDBMovies, getImageURL, JSONValue } from "../../../API/TMDB";

import "../../styles/base.css";
import "../../styles/sandbox.css";
import "../../styles/embla.css";
import { createRoot } from "react-dom/client";
import { useRouter } from "next/navigation";

const TWEEN_FACTOR_BASE = 0.84;

const numberWithinRange = (number: number, min: number, max: number): number =>
	Math.min(Math.max(number, min), max);

type PropType = {
	path: string;
	options?: EmblaOptionsType;
};

interface SlideProps {
	movie: any;
}

export const Slide: React.FC<SlideProps> = ({ movie }) => {
	useEffect(() => {
		console.log("Movie: ", movie.title);
	}, [movie]);
	const router = useRouter();
	const imageUrl = getImageURL(movie.backdrop_path, 'mid');
	return (
		<div className="relative rounded-2xl overflow-hidden transition-all duration-300 h-full w-full group shadow-2xl min-h-0">
			<div className="select-none cursor-pointer h-full w-full border-none bg-gradient-to-r from-black/90 via-black/60 to-transparent opacity-0 group-hover:opacity-100 top-0 left-0 absolute z-10 transition-all duration-300">
				<div className="flex items-center p-6 h-full w-2/3">
					<div className="px-4 w-full max-h-[75%] overflow-hidden text-white">
						<h2 className="text-2xl font-bold mb-3 text-white drop-shadow-lg">{movie.title}</h2>
						<p className="text-sm py-2 text-white/90 leading-relaxed line-clamp-3">{movie.overview}</p>
						<div className="mt-4">
							<button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold py-2 px-5 rounded-xl transform hover:scale-105 transition-all duration-300 shadow-lg text-sm" 
								onClick={() => router.push(`/${movie.title.replaceAll(' ', '-').replaceAll(':', '').toLowerCase()}`)} >
								<span className="flex items-center gap-2">
									▶ Watch Now
								</span>
							</button>
						</div>
					</div>
				</div>
			</div>
			<img
				className="object-cover h-full w-full"
				src={imageUrl}
				alt={movie.title}
			/>
			<div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
		</div>
	);
};

const EmblaCarousel: React.FC<PropType> = (props) => {
	const { options, path } = props;
	const updatedSlide = useRef(false);
	const [slides, setSlides] = useState<JSONValue[]>([]);
	const [pageNum, setPageNum] = useState(1);
	const [emblaRef, emblaApi] = useEmblaCarousel(options);
	const tweenFactor = useRef(0);

	const {
		prevBtnDisabled,
		nextBtnDisabled,
		onPrevButtonClick,
		onNextButtonClick,
	} = usePrevNextButtons(emblaApi);

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
					if (isScrollEvent && !slidesInView.includes(slideIndex))
						return;

					if (engine.options.loop) {
						engine.slideLooper.loopPoints.forEach((loopItem) => {
							const target = loopItem.target();

							if (slideIndex === loopItem.index && target !== 0) {
								const sign = Math.sign(target);

								if (sign === -1) {
									diffToTarget =
										scrollSnap - (1 + scrollProgress);
								}
								if (sign === 1) {
									diffToTarget =
										scrollSnap + (1 - scrollProgress);
								}
							}
						});
					}

					const tweenValue =
						1 - Math.abs(diffToTarget * tweenFactor.current);
					const opacity = numberWithinRange(
						tweenValue,
						0,
						1
					).toString();
					emblaApi.slideNodes()[slideIndex].style.opacity = opacity;
				});
			});
		},
		[]
	);

	const logSlidesInView = useCallback(
		(emblaApi: EmblaCarouselType) => {
			const engine = emblaApi.internalEngine();
			console.log("pageNum: ", pageNum);
			console.log("Slides in view:", engine.slidesInView.get());
			console.log(
				"Slides length:",
				Math.round((slides.length - 1) * 0.75)
			);
			console.log("Current Slide:", engine.index.get());
			if (
				engine.index.get() === Math.round((slides.length - 1) * 0.75) &&
				updatedSlide.current === false
			) {
				updatedSlide.current = true;
				getTMDBMovies(path, pageNum)
					.then((nextSlides) => {
						const nextSlidesLength = nextSlides.length;
						console.log("nextSlides: ", nextSlides);
						setSlides((prevSlides) => [
							...nextSlides.slice(0, nextSlidesLength / 2),
							...prevSlides.slice(
								nextSlidesLength / 2,
								nextSlidesLength
							),
						]);
						setPageNum((prevPageNum) => prevPageNum + 1);
						updatedSlide.current = false;
					})
					.catch((error) => {
						console.error("Error fetching more movies:", error);
						updatedSlide.current = false;
					});
			}
		},
		[pageNum, slides.length, path]
	);

	useEffect(() => {
		if (!emblaApi) return;
		
		const initializeSlides = async () => {
			if (!slides || slides.length === 0) {
				console.log("Fetching movies");
				try {
					const nextSlides = await getTMDBMovies(path, pageNum);
					setSlides(nextSlides);
					setPageNum((prevPageNum) => prevPageNum + 1);
				} catch (error) {
					console.error("Error fetching initial movies:", error);
				}
			}
		};
		
		initializeSlides();
		
		emblaApi.on("slidesInView", logSlidesInView);
		setTweenFactor(emblaApi);
		tweenOpacity(emblaApi);
		emblaApi
			.on("reInit", setTweenFactor)
			.on("reInit", tweenOpacity)
			.on("scroll", tweenOpacity)
			.on("slideFocus", tweenOpacity);
		return () => emblaApi.off("slidesInView", logSlidesInView) as any;
	}, [emblaApi, setTweenFactor, tweenOpacity, logSlidesInView, path, pageNum, slides.length]);

	return (
		<div className="embla">
			<PrevButton
				onClick={onPrevButtonClick}
				disabled={prevBtnDisabled}
			/>
			<div className="embla__viewport" ref={emblaRef}>
				<div className="embla__container">
					{slides.map((movie: any, index: number) => (
						<div key={index} className="embla__slide">
							<Slide movie={movie} />
						</div>
					))}
				</div>
			</div>
			<NextButton
				onClick={onNextButtonClick}
				disabled={nextBtnDisabled}
			/>
		</div>
	);
};

export default EmblaCarousel;
