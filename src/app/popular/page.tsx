"use client";
import React from "react";
import PageTemplate from "../../Components/PageTemplate";
import { getTMDBMoviesBy } from "../../API/TMDB";

export default function Popular() {
	return (
		<PageTemplate
			title="Popular"
			fetchStrategy={(page) => getTMDBMoviesBy("popular", page)}
		/>
	);
}
