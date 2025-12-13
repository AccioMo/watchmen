
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { getImageURL, Movie } from "../API/TMDB";
import LazyImage from "./LazyImage";

type Props = {
	movie: Movie;
	className?: string;
};

const InteractiveMovieBox: React.FC<Props> = ({ movie, className = "" }) => {
	const router = useRouter();
	const posterUrl = movie.poster_path ? getImageURL(movie.poster_path, 'mid') : null;

	if (!posterUrl) return null;

	return (
		<div
			onClick={() => router.push(`/movie/${movie.id}`)}
			className={`relative group cursor-pointer overflow-hidden ${className}`}
		>
			{/* Poster Image */}
			<div className="relative w-full h-full">
				<LazyImage
					src={posterUrl}
					placeholderSrc={getImageURL(movie.poster_path, 'tiny')}
					alt={movie.title}
					fill
					className="object-cover"
					sizes="(min-width: 1024px) 20vw, (min-width: 768px) 33vw, 50vw"
				/>
			</div>

			{/* Dark Overlay - Intensifies on Hover */}
			<div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-90 group-hover:via-black/60 transition-all duration-500"></div>

			{/* Content - Slides Up on Hover */}
			<div className="absolute inset-x-0 bottom-0 p-4">
				<h3 className="text-white font-bold text-lg leading-tight mb-2 drop-shadow-md">
					{movie.title}
				</h3>

				{/* Hidden Description - Reveals on Hover */}
				<div className="max-h-0 opacity-0 group-hover:max-h-24 group-hover:opacity-100 overflow-hidden transition-all duration-500 hover:duration-100 ease-out">
					<p className="text-xs text-white/70 line-clamp-3 mb-2 pt-2">
						{movie.overview}
					</p>
					<div className="flex items-center justify-between text-xs text-white/50">
						<span>{movie.release_date ? movie.release_date.split('-')[0] : ''}</span>
						<span className="text-yellow-500">★ {movie.vote_average?.toFixed(1)}</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default InteractiveMovieBox;
