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
	// Fractional offset between first and second snap (0..1). e.g. 0.5 = half an element
	startOffset?: number;
};

interface SlideProps {
	movie: Movie;
}

export const VerticalSlide: React.FC<SlideProps> = React.memo(({ movie }) => {
	const router = useRouter();
	const [imageErrored, setImageErrored] = useState(false);
	const imageUrl = movie.poster_path ? getImageURL(movie.poster_path, 'mid') : '';
	
	const handleClick = useCallback(() => {
		router.push(`/movie/${movie.id}`);
	}, [router, movie.id]);
	
	const placeholder = (
		<div className="h-full w-full flex items-center justify-center bg-gradient-to-tr from-neutral-800 via-neutral-700 to-neutral-900 rounded-xl text-white">
			<div className="flex flex-col items-center gap-3 p-6 text-center">
				{/* Center SVG — subtle animated play/film icon */}
				<svg className="w-16 h-16 text-white/90 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
					<rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
					<path d="M7 21v-4"></path>
					<path d="M17 21v-4"></path>
					<polygon points="10 8 16 12 10 16 10 8"></polygon>
				</svg>
				<div className="max-w-xs">
					<h4 className="font-semibold text-white">{movie.title || 'No preview available'}</h4>
					<p className="text-xs text-white/70 line-clamp-3 mt-1">{movie.overview || 'Could not load movies right now — try again later.'}</p>
				</div>
			</div>
		</div>
	);

	return (
		<div className="relative rounded-xl transition-all duration-300 h-full w-full group shadow-xl cursor-pointer" onClick={handleClick}>
			{/* Hover overlay content */}
			<div className="select-none h-full w-full border-none bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-0 group-hover:opacity-100 top-0 left-0 absolute z-10 transition-all duration-300">
				<div className="flex items-end p-4 h-full w-full">
					<div className="w-full text-white">
						<h3 className="text-lg font-bold mb-2 text-white drop-shadow-lg line-clamp-2">{movie.title}</h3>
						<p className="text-xs text-white/90 leading-relaxed line-clamp-3">{movie.overview}</p>
						<div className="mt-3 flex items-center gap-2">
							<span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">★ {movie.vote_average.toFixed(1)}</span>
							<span className="text-xs text-white/70">{movie.release_date ? new Date(movie.release_date).getFullYear() : ''}</span>
						</div>
					</div>
				</div>
			</div>
			{!imageUrl || imageErrored ? (
				placeholder
			) : (
				<img className="object-cover h-full w-full" src={imageUrl} alt={movie.title} loading="lazy" onError={() => setImageErrored(true)} />
			)}
			<div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none"></div>
		</div>
	);
});

VerticalSlide.displayName = 'VerticalSlide';

const VerticalEmblaCarousel: React.FC<PropType> = React.memo((props) => {
	const { options, genre, startOffset = 0 } = props;
	const updatedSlide = useRef(false);
	const [slides, setSlides] = useState<Movie[]>([]);
	const [pageNum, setPageNum] = useState(1);
	const [emblaRef, emblaApi] = useEmblaCarousel({
		...options,
		axis: 'y',
		dragFree: true,
		// Use loop: false and implement a safe wrap (jump) to simulate infinite scrolling
		loop: false,
		skipSnaps: false,
		containScroll: 'trimSnaps'
	}, [WheelGestures()]);
	const isJumping = useRef(false);
	const tweenFactor = useRef(0);
	const initialOffsetApplied = useRef(false);

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
						} else {
							// Provide harmless placeholder slides when the API fails or returns empty
							const placeholders: Movie[] = Array.from({ length: 6 }).map((_, i) => ({
								id: -(i + 1),
								title: `No movies — ${genre}`,
								overview: `Unable to load ${genre} movies right now. This is a placeholder.`,
								backdrop_path: "",
								poster_path: "",
								release_date: "",
								vote_average: 0,
								vote_count: 0,
								genre_ids: [],
								adult: false,
								original_language: "en",
								original_title: "",
								popularity: 0,
								video: false,
							} as Movie));
							setSlides(placeholders);
							setPageNum(2);
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
						if (nextSlides && nextSlides.length > 0) {
							setSlides(nextSlides);
							setPageNum(2);
						} else {
							// Provide harmless placeholder slides when the API fails or returns empty
							const placeholders: Movie[] = Array.from({ length: 6 }).map((_, i) => ({
								id: -(i + 1),
								title: `No movies — ${genre}`,
								overview: `Unable to load ${genre} movies right now. This is a placeholder.`,
								backdrop_path: "",
								poster_path: "",
								release_date: "",
								vote_average: 0,
								vote_count: 0,
								genre_ids: [],
								adult: false,
								original_language: "en",
								original_title: "",
								popularity: 0,
								video: false,
							} as Movie));
							setSlides(placeholders);
							setPageNum(2);
						}
					})
				.catch((error) => console.error("Error fetching initial movies:", error));
		}
		
		// Set up embla events
		setTweenFactor(emblaApi);
		tweenOpacity(emblaApi);

		// Wrap/jump handler to simulate infinite loop without visual artifacts.
		const handleWrap = (emblaApi: EmblaCarouselType) => {
			if (isJumping.current) return;
			const scrollProgress = emblaApi.scrollProgress();
			const engine = emblaApi.internalEngine();
			const currentIndex = engine.index.get();
			const snaps = emblaApi.scrollSnapList();
			if (!snaps) return;
			const lastIndex = snaps.length - 1;

			// If user overscrolls past the start, jump to the last snap instantly.
			if (scrollProgress <= -0.12 && currentIndex === 0) {
				isJumping.current = true;
				emblaApi.scrollTo(lastIndex, true);
				setTimeout(() => (isJumping.current = false), 50);
				return;
			}

			// If user overscrolls past the end, jump to the first snap instantly.
			if (scrollProgress >= 1.12 && currentIndex === lastIndex) {
				isJumping.current = true;
				emblaApi.scrollTo(0, true);
				setTimeout(() => (isJumping.current = false), 50);
				return;
			}
		};
		
		const scrollHandler = () => {
			tweenOpacity(emblaApi, "scroll");
			handleWrap(emblaApi);
		};

		emblaApi
			.on("slidesInView", logSlidesInView)
			.on("reInit", setTweenFactor)
			.on("reInit", tweenOpacity)
			.on("scroll", scrollHandler)
			.on("slideFocus", tweenOpacity);

		return () => {
			// Remove all listeners we attached.
			emblaApi.off("slidesInView", logSlidesInView);
			emblaApi.off("reInit", setTweenFactor);
			emblaApi.off("reInit", tweenOpacity as any);
			emblaApi.off("scroll", scrollHandler);
			emblaApi.off("slideFocus", tweenOpacity as any);
		};
	}, [emblaApi, setTweenFactor, tweenOpacity, logSlidesInView, genre, pageNum, slides.length]);

	// Apply a safe one-time integer snap start so alternating carousels are
	// visually staggered while preserving Embla's internal state. If the
	// caller passes a truthy `startOffset` we'll jump to the 2nd slide (index
	// 1) once slides are loaded.
	useEffect(() => {
		if (!emblaApi) return;
		if (!startOffset || startOffset === 0) return;
		if (initialOffsetApplied.current) return;
		if (!slides || slides.length === 0) return;

		// Defer briefly to ensure Embla is initialized and layout is stable.
		const t = setTimeout(() => {
			try {
				// Smoothly scroll to the second slide (index 1) so the stagger is
				// animated instead of an instant jump. Passing `false` as the
				// second argument enables the animated scroll.
				emblaApi.scrollTo(1, false);
				initialOffsetApplied.current = true;
			} catch (err) {
				console.warn('Failed to apply startIndex via scrollTo:', err);
			}
		}, 40);

		return () => clearTimeout(t);
	}, [emblaApi, slides.length, startOffset]);

	// Ensure Embla re-initializes when slides are appended/removed so snap lists stay correct.
	useEffect(() => {
		if (!emblaApi) return;
		emblaApi.reInit();
	}, [slides.length, emblaApi]);

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
