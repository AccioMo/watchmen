import React from "react";
import { EmblaOptionsType } from "embla-carousel";
import {
	PrevButton,
	NextButton,
	usePrevNextButtons,
} from "./EmblaCarouselArrowButtons";
import useEmblaCarousel from "embla-carousel-react";
// import AutoScroll from "embla-carousel-auto-scroll";
import { Slide } from "./EmblaCarousel";
import { Movie } from "../../../API/TMDB";
import { SlidesPlaceholder } from "../SlidesPlaceholder";

type PropType = {
	slides: Movie[];
	direction: "forward" | "backward";
	options?: EmblaOptionsType;
};

const TwoEmblaCarousel: React.FC<PropType> = (props) => {
	const { slides, options } = props;
	const [emblaRef, emblaApi] = useEmblaCarousel(options);
	// TODO: Add AutoScroll back when embla-carousel-auto-scroll is installed
	// const [emblaRef, emblaApi] = useEmblaCarousel(options, [
	// 	AutoScroll({ playOnInit: slides?.length > 0, direction: direction, speed: 0.75 }),
	// ]);

	const {
		prevBtnDisabled,
		nextBtnDisabled,
		onPrevButtonClick,
		onNextButtonClick,
	} = usePrevNextButtons(emblaApi);

	// const autoScroll = emblaApi?.plugins()?.autoScroll;

	return (
		<section className="embla">
			<div className="embla__viewport" ref={emblaRef}>
				{slides && slides.length > 0 ? (
					<div className="embla__container">
						{slides.map((movie, index) => (
							<div
								key={index}
								className="embla__slide z-10"
								// onMouseEnter={autoScroll?.stop}
								// onMouseLeave={() => autoScroll?.play(0)}
							>
								<Slide movie={movie} />
							</div>
						))}
					</div>
				) : (
					<SlidesPlaceholder />
				)}
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
		</section>
	);
};

export default TwoEmblaCarousel;
