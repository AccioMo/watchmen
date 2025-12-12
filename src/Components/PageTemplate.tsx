"use client";

import React from "react";
import InfiniteMovieGrid from "./InfiniteMovieGrid";

type Props = {
	genres: string[]; // Keeping the prop for compatibility, but we might only use the first one or mix them.
	title?: string;
};

const PageTemplate: React.FC<Props> = ({ genres, title }) => {
	React.useEffect(() => {
		if (title) {
			document.title = title + " - N4tflix";
		}
	}, [title]);

	// For the infinite grid, we typically focus on one main genre or a mix.
	// If multiple genres are passed, we might pass the first one or handle it in the grid.
	// Given the previous code passed e.g. ["Action"], we will use the first one.
	const mainGenre = genres[0] || "Popular";

	return (
		<div className="min-h-screen bg-black animated-bg relative">
			{/* Gradient Overlays */}
			<div className="fixed inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none z-10"></div>

			{/* Main Content */}
			<div className="w-full pt-0">
				<InfiniteMovieGrid genre={mainGenre} />
			</div>

			{/* Footer is now inside the grid scroll or fixed? 
                If we want it at the bottom of the infinite list, it should be in the grid component or 
                we accept it might never be reached. 
                For now, let's keep it fixed or removing it effectively since infinite scroll makes footers hard.
				sounds good
            */}
		</div>
	);
};

export default PageTemplate;
