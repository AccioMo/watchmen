"use client";

import Footer from "@/Components/Footer";
import EmblaCarousel from "@/Components/Carousel/EmblaCarousel";
import { EmblaOptionsType } from "embla-carousel";

const OPTIONS: EmblaOptionsType = { loop: true, dragFree: true };

function Home() {
	return (
		<div className="w-screen h-screen bg-gradient-to-br from-primary via-secondary to-accent animated-bg">
			<div className="flex relative screen flex-col h-full">
				<EmblaCarousel options={OPTIONS} path={"top_rated"} />
				<Footer>
					<div className="flex justify-center gap-2 items-center h-16 text-white/70 text-sm">
						<p>&copy; 2025 no rights reserved</p>
					</div>
				</Footer>
			</div>
		</div>
	);
}

export default Home;