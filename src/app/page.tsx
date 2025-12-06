
"use client";

import PageTemplate from "./Components/PageTemplate";

export default function Home() {
	// Genres for Home Page (Mix)
	const genres = ["Action", "Fantasy", "Animation", "Horror", "Comedy"];

	return <PageTemplate genres={genres} />;
}
