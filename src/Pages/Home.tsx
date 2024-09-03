import NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";
import { tmdbAPI, getPopularMovies } from "../API/TMDB";
import { consumetAPI } from "../API/Consumet";
import axios from "axios";
import EmblaCarousel from "../Components/Carousel/EmblaCarousel";
import { EmblaOptionsType } from "embla-carousel";
import { useEffect, useState } from "react";

const OPTIONS: EmblaOptionsType = { loop: true, dragFree: true };
const SLIDE_COUNT = 5;
const SLIDES = Array.from(Array(SLIDE_COUNT).keys());

function Home() {
	useEffect(() => {
		document.title = "Home";
	}, []);
	return (
		<div className="w-screen h-screen bg-gradient-to-tr from-slate-950 to-primary">
			<div className="flex screen flex-col h-full overflow-hidden">
				<NavBar />
				<EmblaCarousel options={OPTIONS} path={"top_rated"} />
				<Footer>
					<div className="flex justify-center gap-2 items-center h-16 text-white opacity-50 text-sm">
						<p>&copy; 2024 All rights reserved</p>
					</div>
				</Footer>
			</div>
		</div>
	);
}

export default Home;
