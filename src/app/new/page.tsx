"use client";
import React from "react";
import PageTemplate from "../../Components/PageTemplate";
import { getTMDBMoviesByNew } from "../../API/TMDB";

export default function New() {
	return (
		<PageTemplate
			title="New Releases"
			fetchStrategy={(page) => getTMDBMoviesByNew(page)}
		/>
	);
}
