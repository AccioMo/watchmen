"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getImageURL } from "../API/TMDB";

type ActorCardProps = {
	id: number;
	name: string;
	character?: string;
	profilePath: string | null;
};

const ActorCard: React.FC<ActorCardProps> = ({ id, name, character, profilePath }) => {
	const router = useRouter();

	return (
		<div
			className="min-w-[140px] md:min-w-[160px] snap-start group cursor-pointer"
			onClick={() => router.push(`/person/${id}`)}
		>
			<div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden mb-3 bg-white/5">
				{profilePath ? (
					<Image
						src={getImageURL(profilePath, 'mid')}
						alt={name}
						fill
						className="object-cover transition-all duration-300 grayscale group-hover:grayscale-0"
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center text-white/20 text-4xl">?</div>
				)}
			</div>
			<h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors truncate">{name}</h3>
			{character && <p className="text-sm text-white/50 truncate">{character}</p>}
		</div>
	);
};

export default ActorCard;
