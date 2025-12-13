'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from "../../../Components/Button";

interface Review {
	id: string;
	author: string;
	content: string;
	created_at: string;
	url: string;
	author_details: {
		rating: number;
		avatar_path: string | null;
	};
}

export default function ReviewPage() {
	const params = useParams();
	const router = useRouter();
	const [review, setReview] = useState<Review | null>(null);
	const [loading, setLoading] = useState(true);

	const id = params?.id as string;

	useEffect(() => {
		const fetchReview = async () => {
			// TMDB API doesn't have a direct endpoint for a single review by ID, 
			// so we typically have to pass the movie ID and find the review in the list.
			// However, since the user asked for a "page to read the full review", we can assume
			// we might pass the movie ID as a query param or structured differently.
			// FOR SIMPLICITY given current architecture: We will assume we are passed the MOVIE ID 
			// and we will show ALL reviews or a specific one if possible. 
			// BUT, the URL structure is `review/[id]`. This `id` is usually the Review ID in TMDB.
			// Let's try to fetch via the generic review endpoint if available or handle it.

			// Actually, TMDB *does* have a /review/{review_id} endpoint.
			// Let's implement that specific fetch here directly or update API.
			// Since I didn't add `getReviewById` in API, I'll add a direct fetch here for now using the key.

			if (!id) return;

			try {
				const response = await fetch(
					`https://api.themoviedb.org/3/review/${id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
				);

				if (response.ok) {
					const data = await response.json();
					setReview(data);
				}
			} catch (error) {
				console.error("Failed to fetch review", error);
			} finally {
				setLoading(false);
			}
		};

		fetchReview();
	}, [id]);

	if (loading) {
		return (
			<div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
				<div className="animate-spin w-12 h-12 border-4 border-white/10 border-t-white rounded-full"></div>
			</div>
		);
	}

	if (!review) {
		return (
			<div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center text-white">
				<div className="text-center">
					<h1>Review not found</h1>
					<Button onClick={() => router.back()}>Go Back</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#0d0d0d] text-white pt-24 px-6 md:px-12">
			<div className="max-w-4xl mx-auto">
				<Button
					variant="ghost"
					onClick={() => router.back()}
					className="mb-8 pl-0 hover:pl-5 transition-all"
					icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>}
				>
					Back to Movie
				</Button>

				<div className="bg-white/5 p-8 md:p-12 rounded-3xl border border-white/5">
					<div className="flex items-center gap-4 mb-8">
						<div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
							{review.author[0].toUpperCase()}
						</div>
						<div>
							<h1 className="text-2xl md:text-3xl font-bold">Review by {review.author}</h1>
							<div className="flex items-center gap-3 mt-2 text-white/50 text-sm">
								<span>{new Date(review.created_at).toLocaleDateString()}</span>
								{review.author_details.rating && (
									<span className="flex items-center gap-1 text-[#deb522] bg-[#deb522]/10 px-2 py-0.5 rounded text-xs font-bold border border-[#deb522]/20">
										★ {review.author_details.rating}
									</span>
								)}
							</div>
						</div>
					</div>

					<div className="prose prose-invert prose-lg max-w-none text-white/80 leading-relaxed whitespace-pre-wrap">
						{review.content}
					</div>

					<div className="mt-12 pt-8 border-t border-white/10">
						<a
							href={review.url}
							target="_blank"
							rel="noopener noreferrer"
							className="text-purple-400 hover:text-purple-300 transition-colors text-sm"
						>
							View original review on TMDB →
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}
