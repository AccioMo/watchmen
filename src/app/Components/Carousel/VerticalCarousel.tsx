import React, { useEffect, useRef, useState } from "react";
import { getTMDBMoviesByGenreName, Movie } from "../../../API/TMDB";
import MoviePoster from "../MoviePoster";

import "../../styles/vertical-embla.css";

// Keep API-compatible props shape. We accept any options but only use a couple.
type LocalOptions = {
	loop?: boolean;
	dragFree?: boolean;
};

type PropType = {
	genre: string;
	options?: LocalOptions; // Accepts EmblaOptionsType at call site due to structural typing
	// Fractional offset between first and second snap (0..1). e.g. 0.5 = half an element
	startOffset?: number;
};

const TWEEN_FACTOR_BASE = 0.6; // softer falloff for higher opacity overall
const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

// Vanilla vertical carousel using CSS scroll-snap + rAF-powered effects and lazy paging.
const VerticalEmblaCarousel: React.FC<PropType> = React.memo(({ genre, options, startOffset = 0 }) => {
	const viewportRef = useRef<HTMLDivElement | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const initialOffsetApplied = useRef(false);
	const loadingMore = useRef(false);
	const [slides, setSlides] = useState<Movie[]>([]);
	const [pageNum, setPageNum] = useState(1);
	const tweenFactor = useRef(TWEEN_FACTOR_BASE);
	const slideHeight = useRef<number>(0);
	const rAF = useRef<number | null>(null);

	// Calculate an opacity tween based on distance to viewport center.
	const updateTween = () => {
		const viewport = viewportRef.current;
		const container = containerRef.current;
		if (!viewport || !container) return;
		const slidesEls = Array.from(container.children) as HTMLElement[];
		if (slidesEls.length === 0) return;

		const rect = viewport.getBoundingClientRect();
		const centerY = rect.top + rect.height / 2;

		slidesEls.forEach((el) => {
			const r = el.getBoundingClientRect();
			const slideCenter = r.top + r.height / 2;
			const diff = (slideCenter - centerY) / (r.height || 1); // normalized by slide height
			const tween = 1 - Math.abs(diff) * tweenFactor.current;
			const opacity = clamp(tween, 0.6, 1); // raise minimum opacity for non-centered slides
			el.style.opacity = String(opacity);
			el.style.transform = "scale(1)";
		});
	};

	const onScroll = () => {
		// rAF throttle
		if (rAF.current) cancelAnimationFrame(rAF.current);
		rAF.current = requestAnimationFrame(() => {
			updateTween();
			maybeLoadMore();
		});
	};

	const measure = () => {
		const container = containerRef.current;
		if (!container) return;
		const first = container.firstElementChild as HTMLElement | null;
		slideHeight.current = first?.offsetHeight || slideHeight.current || 1;
	// Keep a constant factor for smoother, higher-opacity look.
	tweenFactor.current = TWEEN_FACTOR_BASE;
	};

	const maybeLoadMore = () => {
		const viewport = viewportRef.current;
		if (!viewport || loadingMore.current) return;
		const sh = slideHeight.current || 1;
		const currentIndex = Math.floor(viewport.scrollTop / sh);
		const threshold = Math.round(slides.length * 0.8);
		if (slides.length > 0 && currentIndex >= threshold) {
			loadingMore.current = true;
			getTMDBMoviesByGenreName(genre, pageNum)
				.then((next) => {
					if (next && next.length > 0) {
						setSlides((prev) => [...prev, ...next]);
						setPageNum((p) => p + 1);
					}
				})
				.catch((err) => console.error("Error fetching more movies:", err))
				.finally(() => {
					loadingMore.current = false;
					// Re-measure after DOM updates in next tick
					setTimeout(() => {
						measure();
						updateTween();
					}, 0);
				});
		}
	};

	// Initial data load
	useEffect(() => {
		let mounted = true;
		if (slides.length > 0) return;
		getTMDBMoviesByGenreName(genre, 1)
			.then((data) => {
				if (!mounted) return;
				if (data && data.length > 0) {
					setSlides(data);
					setPageNum(2);
				} else {
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
			.catch((e) => console.error("Error fetching initial movies:", e));
		return () => {
			mounted = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [genre]);

	// After slides change, measure and refresh tween
	useEffect(() => {
		measure();
		updateTween();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [slides.length]);

	// Attach scroll/resize listeners
	useEffect(() => {
		const viewport = viewportRef.current;
		if (!viewport) return;
		viewport.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", updateTween);
		// Initialize once mounted
		setTimeout(() => {
			measure();
			updateTween();
		}, 0);
		return () => {
			viewport.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", updateTween);
			if (rAF.current) cancelAnimationFrame(rAF.current);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Removed custom drag-to-scroll for mouse; free native scrolling remains.

	// Apply optional fractional start offset between first and second slide.
	useEffect(() => {
		if (!startOffset || startOffset === 0) return;
		if (initialOffsetApplied.current) return;
		const viewport = viewportRef.current;
		const sh = slideHeight.current;
		if (!viewport || !sh) return;
		const doScroll = () => {
			try {
				viewport.scrollTo({ top: sh * clamp(startOffset, 0, 1), behavior: (options?.dragFree ? "auto" : "smooth") as ScrollBehavior });
				initialOffsetApplied.current = true;
			} catch (_) {
				// no-op
			}
		};
		const t = setTimeout(doScroll, 40);
		return () => clearTimeout(t);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [startOffset, slides.length]);

	return (
		<div className="vertical-embla">
			<div className="vertical-embla__viewport" ref={viewportRef}>
				<div className="vertical-embla__container" ref={containerRef}>
					{slides.map((movie: Movie, index: number) => (
						<div key={`${movie.id}-${index}`} className="vertical-embla__slide">
							<MoviePoster movie={movie} />
						</div>
					))}
				</div>
			</div>
		</div>
	);
});

VerticalEmblaCarousel.displayName = "VerticalEmblaCarousel";
export default VerticalEmblaCarousel;
