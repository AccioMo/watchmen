
import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getImageURL, Movie } from "../API/TMDB";
import LazyImage from "./LazyImage";

type Props = {
	movie: Movie;
	className?: string;
};

export const MovieBox: React.FC<Props> = ({ movie, className = "" }) => {
	const router = useRouter();
	const [imageErrored, setImageErrored] = useState(false);

	const imageUrl = movie.poster_path ? getImageURL(movie.poster_path, 'mid') : '';
	const tinyUrl = movie.poster_path ? getImageURL(movie.poster_path, 'tiny') : '';

	const handleClick = useCallback(() => {
		router.push(`/movie/${movie.id}`);
	}, [router, movie.id]);

	return (
		<div
			className={`relative w-full h-full bg-neutral-900 cursor-pointer group overflow-hidden ${className}`}
			onClick={handleClick}
		>
			{!imageUrl || imageErrored ? (
				<div className="h-full w-full flex items-center justify-center p-4 text-center text-xs text-white/50 aspect-[2/3]">
					{movie.title}
				</div>
			) : (
				<LazyImage
					src={imageUrl}
					placeholderSrc={tinyUrl}
					alt={movie.title}
					fill
					className="object-cover"
					sizes="(min-width: 1280px) 16vw, (min-width: 1024px) 20vw, (min-width: 640px) 30vw, 45vw"
					onError={() => setImageErrored(true)}
				/>
			)}

			{/* Hover Gradient: Black (bottom) to Transparent (top) */}
			<div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
				<div className="text-white w-full">
					<h3 className="font-bold text-sm leading-tight mb-1">{movie.title}</h3>
					<div className="flex items-center justify-between text-xs text-white/70">
						<span>{movie.release_date ? movie.release_date.split('-')[0] : ''}</span>
						<span className="text-yellow-500 font-bold">★ {movie.vote_average?.toFixed(1)}</span>
					</div>
				</div>
			</div>
		</div>
	);
};
