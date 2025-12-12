
"use client";

import PageTemplate from "../../Components/PageTemplate";

export default function FunnyPage() {
	const genres = ["Comedy", "Animation", "Family", "Adventure", "Comedy"];
	return <PageTemplate genres={genres} title="Funny" />;
}
