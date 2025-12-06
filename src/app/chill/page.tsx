
"use client";

import PageTemplate from "../Components/PageTemplate";

export default function ChillPage() {
	const genres = ["Drama", "Documentary", "Music", "History", "Family"];
	return <PageTemplate genres={genres} />;
}
