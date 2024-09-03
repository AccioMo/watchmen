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
import { getTMDBMovies, getImageURL, JSONValue } from "../../API/TMDB";

import "../../styles/base.css";
import "../../styles/sandbox.css";
import "../../styles/embla.css";
import { createRoot } from "react-dom/client";

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
	const imageUrl = getImageURL(movie.backdrop_path, 1280);
	return (
		<img className="embla__slide__img" src={imageUrl} alt={movie.title} />
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
				getTMDBMovies(path, pageNum)
					.then((nextSlides) => {
						const nextSlidesLength = nextSlides.length;
						updatedSlide.current = true;
						console.log("nextSlides: ", nextSlides);
						setSlides([
							...nextSlides.slice(0, nextSlidesLength / 2),
							...slides.slice(
								nextSlidesLength / 2,
								nextSlidesLength
							),
						]);
						setPageNum(pageNum + 1);
					})
					.catch((error) => {
						console.error(error);
					});
			}
			updatedSlide.current = false;
		},
		[pageNum, slides]
	);

	useEffect(() => {
		if (!emblaApi) return;
		if (!slides || slides.length === 0) {
			console.log("Fetching movies");
			getTMDBMovies(path, pageNum)
				.then((nextSlides) => {
					setSlides(nextSlides);
					setPageNum(pageNum + 1);
				})
				.catch((error) => {
					console.error(error);
				});
		}
		emblaApi.on("slidesInView", logSlidesInView);
		setTweenFactor(emblaApi);
		tweenOpacity(emblaApi);
		emblaApi
			.on("reInit", setTweenFactor)
			.on("reInit", tweenOpacity)
			.on("scroll", tweenOpacity)
			.on("slideFocus", tweenOpacity);
		return () => emblaApi.off("slidesInView", logSlidesInView) as any;
	}, [emblaApi, tweenOpacity, logSlidesInView]);

	return (
		<div className="embla">
			<PrevButton
				onClick={onPrevButtonClick}
				disabled={prevBtnDisabled}
			/>
			<div className="embla__viewport" ref={emblaRef}>
				<div className="embla__container">
					{slides.map((movie: any, index: number) => (
						<Slide movie={movie} index={index} />
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
