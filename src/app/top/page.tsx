"use client";
import React from "react";
import PageTemplate from "../../Components/PageTemplate";
import { getTMDBMoviesBy } from "../../API/TMDB";

export default function TopRated() {
    return (
        <PageTemplate
            title="Top Rated"
            fetchStrategy={(page) => getTMDBMoviesBy("top_rated", page)}
        />
    );
}
