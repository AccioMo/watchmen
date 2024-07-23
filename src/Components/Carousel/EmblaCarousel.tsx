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
import { getPopularMovies } from "../../API/TMDB";

import "../../styles/base.css";
import "../../styles/sandbox.css";
import "../../styles/embla.css";

type JSONValue =
	| string
	| number
	| boolean
	| { [x: string]: JSONValue }
	| Array<JSONValue>;

const TWEEN_FACTOR_BASE = 0.84;

const numberWithinRange = (number: number, min: number, max: number): number =>
	Math.min(Math.max(number, min), max);

type PropType = {
	slides: number[];
	options?: EmblaOptionsType;
};

const EmblaCarousel: React.FC<PropType> = (props) => {
	const { options } = props;
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
		(emblaApi: EmblaCarouselType, eventName: EmblaEventType) => {
			console.log(emblaApi.scrollProgress());
			console.log(pageNum);
			if (emblaApi.scrollProgress() >= 0.9) {
				setPageNum(pageNum + 1);
				getPopularMovies(pageNum)
					.then((new_slides) => {
						setSlides([...slides, ...new_slides]);
						console.log(slides);
					})
					.catch((error) => {
						console.error(error);
					});
			}
		},
		[pageNum]
	);

	useEffect(() => {
		if (!emblaApi) return;
		if (!slides || slides.length === 0) {
			console.log("Fetching movies");
			getPopularMovies(1)
				.then((new_slides) => {
					setSlides(new_slides);
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
		return () => emblaApi.off("slidesInView", logSlidesInView);
	}, [emblaApi, tweenOpacity, logSlidesInView]);

	return (
		<div className="embla">
			<div className="embla__viewport" ref={emblaRef}>
				<div className="embla__container">
					{slides.map((movie: any, index: number) => {
						const imageUrl = `https://image.tmdb.org/t/p/w1280/${movie.backdrop_path}`;
						return (
							<div className="embla__slide" key={index}>
								<img
									className="embla__slide__img"
									src={imageUrl}
									alt={movie.title}
								/>
							</div>
						);
					})}
				</div>
			</div>

			<div className="embla__controls">
				<div className="embla__buttons">
					<PrevButton
						onClick={onPrevButtonClick}
						disabled={prevBtnDisabled}
					/>
					<NextButton
						onClick={onNextButtonClick}
						disabled={nextBtnDisabled}
					/>
				</div>
			</div>
		</div>
	);
};

export default EmblaCarousel;
