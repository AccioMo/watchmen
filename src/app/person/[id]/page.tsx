'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPersonDetails, getPersonCombinedCredits, getImageURL } from "../../../API/TMDB";
import Button from "../../../Components/Button";
import InteractiveMovieBox from "../../../Components/InteractiveMovieBox";
import Image from "next/image";

// Define simpler interfaces for components if not exported
interface Person {
	id: number;
	name: string;
	biography: string;
	birthday: string;
	place_of_birth: string;
	profile_path: string;
	known_for_department: string;
}

interface Credit {
	id: number;
	title?: string;
	name?: string; // For TV shows
	poster_path: string;
	media_type: string;
	vote_average: number;
	release_date?: string;
	first_air_date?: string; // For TV shows
	overview: string;
	character?: string;
	job?: string;
	order?: number; // for sorting cast
	vote_count: number; // needed for InteractiveMovieBox
}

export default function PersonPage() {
	const params = useParams();
	const router = useRouter();
	const [person, setPerson] = useState<Person | null>(null);
	const [credits, setCredits] = useState<Credit[]>([]);
	const [loading, setLoading] = useState(true);

	const id = params?.id as string;

	useEffect(() => {
		const fetchData = async () => {
			if (!id) return;
			setLoading(true);
			try {
				const [detailsData, creditsData] = await Promise.all([
					getPersonDetails(id),
					getPersonCombinedCredits(id)
				]);

				setPerson(detailsData);
				document.title = `${detailsData.name} - N4tflix`;

				// Process credits: deduplicate and sort by popularity/date
				// We'll focus on CAST for acting, or CREW if they are a director
				const relevantCredits = detailsData.known_for_department === 'Acting'
					? creditsData.cast
					: creditsData.crew;

				// Filter for items with posters and title (movies mostly)
				const seen = new Set();
				const filtered = relevantCredits
					.filter((c: any) => {
						if (seen.has(c.id)) return false;
						seen.add(c.id);
						return true;
					})
					.filter((c: any) => (c.poster_path && (c.title || c.name)))
					.sort((a: any, b: any) => (b.vote_count || 0) - (a.vote_count || 0)) // Sort by popularity approx
					.slice(0, 20); // Top 20

				// Add 'title' if missing (for TV shows using 'name') to match InteractiveMovieBox expectation partially
				// Note: InteractiveMovieBox expects 'Movie' type. We need to adapt `Credit` to `Movie`.
				const adaptedCredits = filtered.map((c: any) => ({
					...c,
					title: c.title || c.name,
					release_date: c.release_date || c.first_air_date,
					original_title: c.original_title || c.original_name
				}));

				setCredits(adaptedCredits);

			} catch (error) {
				console.error("Failed to fetch person data", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [id]);

	if (loading) {
		return (
			<div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
				<div className="animate-spin w-12 h-12 border-4 border-white/10 border-t-white rounded-full"></div>
			</div>
		);
	}

	if (!person) {
		return (
			<div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center text-white">
				<div className="text-center">
					<h1>Person not found</h1>
					<Button onClick={() => router.back()}>Go Back</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#0d0d0d] text-white pt-24 pb-20">
			<div className="container mx-auto px-6 md:px-12">
				<Button
					variant="ghost"
					onClick={() => router.back()}
					className="mb-8 pl-0 hover:pl-5 transition-all"
					icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>}
				>
					Back
				</Button>

				<div className="flex flex-col md:flex-row gap-12 mb-20 animate-fade-in-up">
					{/* Profile Image */}
					<div className="flex-shrink-0 w-full md:w-80">
						<div className="aspect-[2/3] relative rounded-2xl overflow-hidden shadow-2xl bg-white/5">
							{person.profile_path ? (
								<Image
									src={getImageURL(person.profile_path, 'mid')}
									alt={person.name}
									fill
									className="object-cover"
								/>
							) : (
								<div className="w-full h-full flex items-center justify-center text-white/20 text-6xl">?</div>
							)}
						</div>
					</div>

					{/* Bio */}
					<div className="flex-1 space-y-6">
						<h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/50">
							{person.name}
						</h1>

						<div className="flex flex-wrap gap-4 text-sm text-white/60">
							{person.birthday && (
								<span className="bg-white/10 px-3 py-1 rounded-full border border-white/5">
									Born: {new Date(person.birthday).toLocaleDateString()}
								</span>
							)}
							{person.place_of_birth && (
								<span className="bg-white/10 px-3 py-1 rounded-full border border-white/5">
									{person.place_of_birth}
								</span>
							)}
							<span className="bg-white/10 px-3 py-1 rounded-full border border-white/5">
								{person.known_for_department}
							</span>
						</div>

						<div className="prose prose-invert prose-lg max-w-none text-white/80 leading-relaxed font-light">
							{person.biography || "No biography available."}
						</div>
					</div>
				</div>

				{/* Credits Grid */}
				<h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
					<span className="w-1 h-8 bg-purple-500 rounded-full"></span>
					Known For
				</h2>
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
					{credits.map((credit: any) => (
						<InteractiveMovieBox
							key={credit.id}
							movie={credit}
							className="w-full aspect-[2/3] rounded-xl"
						/>
					))}
				</div>
			</div>

			<style jsx global>{`
				@keyframes fadeInUp {
					from { opacity: 0; transform: translateY(20px); }
					to { opacity: 1; transform: translateY(0); }
				}
				.animate-fade-in-up {
					animation: fadeInUp 0.8s ease-out forwards;
				}
			`}</style>
		</div>
	);
}
