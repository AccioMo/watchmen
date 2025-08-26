"use client";

import Footer from "./Components/Footer";
import VerticalEmblaCarousel from "./Components/Carousel/VerticalEmblaCarousel";
import { EmblaOptionsType } from "embla-carousel";

const OPTIONS: EmblaOptionsType = { loop: true, dragFree: true };

function Home() {
	return (
		<div className="w-screen h-screen bg-gradient-to-br from-primary via-secondary to-accent animated-bg relative overflow-hidden">
			{/* Reduced Vignette Effect */}
			<div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 pointer-events-none z-10"></div>
			<div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none z-10"></div>
			<div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/50 pointer-events-none z-10"></div>
			
			{/* Main Content */}
			<div className="flex justify-between relative h-full gap-3 md:gap-4 lg:gap-6 overflow-hidden rounded-xl">
				<div className="flex-1 h-full min-w-0">
					<VerticalEmblaCarousel 
						options={OPTIONS} 
						genre={"Action"} 
					/>
				</div>
				
				{/* Column 3 - Now Playing Movies */}
				<div className="flex-1 h-full min-w-0">
					<VerticalEmblaCarousel 
						options={OPTIONS} 
						genre={"Fantasy"}
						startOffset={0.5}
					/>
				</div>

				<div className="flex-1 h-full min-w-0">
					<VerticalEmblaCarousel 
						options={OPTIONS} 
						genre={"Animation"} 
					/>
				</div>
				
				{/* Column 4 - Upcoming Movies */}
				<div className="flex-1 h-full min-w-0">
					<VerticalEmblaCarousel 
						options={OPTIONS} 
						genre={"Horror"}
						startOffset={0.5}
					/>
				</div>

				{/* Column 4 - Upcoming Movies */}
				<div className="flex-1 h-full min-w-0">
					<VerticalEmblaCarousel 
						options={OPTIONS} 
						genre={"Comedy"}
					/>
				</div>
			</div>
			
			{/* Footer with enhanced styling */}
			<Footer>
				<div className="flex justify-center gap-2 items-center h-16 text-white/80 text-sm relative z-20 bg-black/20 backdrop-blur-sm">
					<p>&copy; 2025 no rights reserved • Made with ❤️ for movie lovers</p>
				</div>
			</Footer>
		</div>
	);
}

export default Home;