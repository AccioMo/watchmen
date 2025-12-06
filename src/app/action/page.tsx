
"use client";

import PageTemplate from "../Components/PageTemplate";

export default function ActionPage() {
	const genres = ["Action", "Adventure", "Science Fiction", "Thriller", "Crime"];
	return <PageTemplate genres={genres} />;
}
