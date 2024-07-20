import NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";
import { tmdbAPI } from "../Auth/TMDB";
import { consumetAPI } from "../Auth/Consumet";
import EmblaCarousel from "../Components/Carousel/EmblaCarousel";
import { EmblaOptionsType } from "embla-carousel";
import { useEffect } from "react";

const OPTIONS: EmblaOptionsType = { loop: true };
const SLIDE_COUNT = 5;
const SLIDES = Array.from(Array(SLIDE_COUNT).keys());

function Home() {
	useEffect(() => {
		document.title = "Home";
		const response = tmdbAPI.get(`https://image.tmdb.org/t/p/w1280/${}`);
	});
	return (
		<div className="w-screen h-screen bg-gradient-to-tr from-slate-950 to-violet-950">
			<div className="flex flex-col h-full overflow-hidden">
				<NavBar />
				<EmblaCarousel slides={SLIDES} options={OPTIONS} />
				<Footer>
					<div className="flex justify-center items-center h-16 text-white opacity-50 text-sm">
						<p>&copy; 2024 All rights reserved</p>
					</div>
				</Footer>
			</div>
		</div>
	);
}

export default Home;
