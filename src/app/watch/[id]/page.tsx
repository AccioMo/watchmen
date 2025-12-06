'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { searchConsumetMovie, getConsumetMovieServers, getConsumetStreamingLinks, StreamingServer } from '@/API/Consumet';
import { getMovieById } from '@/API/TMDB';
import VideoPlayer from '@/app/Components/VideoPlayer';
import ServerSelector from '@/app/Components/ServerSelector';
import Button from '@/app/Components/Button';
import { getImageURL } from '@/API/TMDB';

interface StreamingSource {
	url: string;
	quality?: string;
	isM3U8: boolean;
}

export default function WatchPage() {
	const params = useParams();
	const router = useRouter();
	const tmdbId = params?.id as string;

	const [movieInfo, setMovieInfo] = useState<any>(null);
	const [consumetId, setConsumetId] = useState<string | null>(null);
	const [isAvailable, setIsAvailable] = useState<boolean>(false);
	const [servers, setServers] = useState<StreamingServer[]>([]);
	const [selectedServer, setSelectedServer] = useState<StreamingServer | null>(null);
	const [streamSource, setStreamSource] = useState<StreamingSource | null>(null);
	const [loading, setLoading] = useState(true);
	const [fetchingLinks, setFetchingLinks] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [episodeId] = useState<string>("1");

	// Fetch TMDB movie info and search on Consumet
	useEffect(() => {
		const fetchMovieAndSearch = async () => {
			if (!tmdbId) {
				setError('Movie ID not provided');
				setLoading(false);
				return;
			}

			try {
				console.log('🎯 Starting to load movie:', tmdbId);
				setLoading(true);

				// Get movie info from TMDB
				const tmdbMovie = await getMovieById(tmdbId);
				if (!tmdbMovie) {
					setError('Movie not found on TMDB');
					setLoading(false);
					return;
				}

				console.log('📽️ TMDB movie loaded:', tmdbMovie.title);
				setMovieInfo(tmdbMovie);

				// Search for the movie on Consumet
				const searchResults = await searchConsumetMovie(tmdbMovie.title);
				if (!searchResults || searchResults.length === 0) {
					console.warn('⚠️ Movie not found on Consumet');
					setIsAvailable(false);
					setLoading(false);
					return;
				}

				// Found on Consumet
				const firstResult = searchResults[0];
				console.log('✅ Found on Consumet:', firstResult.title);
				setConsumetId(firstResult.id);
				setIsAvailable(true);

				// Get available servers for the movie
				const availableServers = await getConsumetMovieServers(firstResult.id);
				
				if (!availableServers || availableServers.length === 0) {
					setError('No streaming servers available');
					setLoading(false);
					return;
				}

				console.log('🖥️ Servers available:', availableServers.length);
				setServers(availableServers);
				// Set initial server selection
				setSelectedServer(availableServers[0]);
				setLoading(false);
			} catch (err) {
				const message = err instanceof Error ? err.message : 'Failed to load movie';
				console.error('❌ Movie load error:', message);
				setError(message);
				setLoading(false);
			}
		};

		fetchMovieAndSearch();
	}, [tmdbId]);

	// Fetch streaming links when server is selected
	useEffect(() => {
		// Only fetch if we have all required data and it's not the initial load
		if (!selectedServer || !consumetId || !isAvailable) {
			return;
		}

		const fetchLinks = async () => {
			try {
				setFetchingLinks(true);
				// Don't clear streamSource here - it breaks the UI

				// Get streaming links for the selected server
				const links = await getConsumetStreamingLinks(consumetId, selectedServer.name, episodeId);
				
				if (!links || !links.sources || links.sources.length === 0) {
					setError('Failed to get streaming links from this server. Try another one.');
					setFetchingLinks(false);
					return;
				}

				// Use the first available source
				const source = links.sources[0];
				console.log('🎬 Streaming source loaded:', {
					url: source.url,
					quality: source.quality,
					isM3U8: source.isM3U8
				});
				
				setStreamSource({
					url: source.url,
					quality: source.quality,
					isM3U8: source.isM3U8 || false,
				});
				setError(null); // Clear error when stream loads successfully
				setFetchingLinks(false);
			} catch (err) {
				const message = err instanceof Error ? err.message : 'Failed to fetch streaming links';
				console.error('❌ Stream fetch error:', message);
				setError(message);
				setFetchingLinks(false);
			}
		};

		fetchLinks();
	}, [selectedServer?.name, consumetId, isAvailable, episodeId]);

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent animated-bg flex items-center justify-center">
				<div className="text-center">
					<div className="relative w-16 h-16 mx-auto mb-4">
						<div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
						<div className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
					</div>
					<p className="text-white text-lg">Loading movie...</p>
					<p className="text-white/60 text-sm mt-2">This may take a moment</p>
				</div>
			</div>
		);
	}

	// Debug logging before render
	console.log('👁️ Watch page render state:', {
		isAvailable,
		hasStreamSource: !!streamSource,
		streamUrl: streamSource?.url?.substring(0, 30),
		fetchingLinks,
		hasMovieInfo: !!movieInfo,
		loading
	});

	return (
		<div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent animated-bg">
			{/* Reduced Vignette Effect */}
			<div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 pointer-events-none z-10"></div>
			<div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none z-10"></div>

			{/* Main Content */}
			<div className="relative z-20 container mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12 lg:py-16">
				{/* Back Button */}
				<div className="mb-6 sm:mb-8">
					<Button
						onClick={() => router.back()}
						variant="ghost"
						icon={
							<svg
								className="w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M15 19l-7-7 7-7"
								/>
							</svg>
						}
						iconPosition="left"
					>
						Back to Movie
					</Button>
				</div>

				{/* Movie Title */}
				{movieInfo && (
					<div className="mb-6 sm:mb-8">
						<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3">
							{movieInfo.title}
						</h1>
						{movieInfo.overview && (
							<p className="text-sm sm:text-base md:text-lg text-white/70 max-w-3xl line-clamp-3 sm:line-clamp-4 md:line-clamp-none">
								{movieInfo.overview}
							</p>
						)}
					</div>
				)}

				{/* Video Player with Availability Notice */}
				<div className="mb-6 sm:mb-8 relative max-w-7xl mx-auto">
					{/* Availability Notice */}
					{!isAvailable && (
						<div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-xl">
							<div className="text-center px-6 py-8">
								<svg
									className="w-16 h-16 text-amber-500 mx-auto mb-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
									/>
								</svg>
								<h2 className="text-2xl font-bold text-white mb-2">
									Not Currently Available
								</h2>
								<p className="text-white/70 max-w-md mx-auto">
									This movie is not currently available on our streaming partners. 
									Please check back later or try another title.
								</p>
							</div>
						</div>
					)}

					{/* Video Player Container - Always render if available */}
					{isAvailable && (
						<div className="relative">
							{/* Show player only when streamSource exists */}
							{streamSource ? (
								<VideoPlayer
									src={streamSource.url}
									title={movieInfo?.title || 'Movie Player'}
									poster={movieInfo?.poster_path ? getImageURL(movieInfo.poster_path, 'max') : ''}
									isM3U8={streamSource.isM3U8}
									onError={(err: string) => setError(err)}
								/>
							) : (
								<div className="w-full aspect-video bg-black rounded-xl flex items-center justify-center">
									<div className="text-center">
										<svg
											className="w-16 h-16 text-white/30 mx-auto mb-4 animate-pulse"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={1.5}
												d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
											/>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={1.5}
												d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
										<p className="text-white/60">
											{fetchingLinks ? 'Loading stream...' : 'Select a server'}
										</p>
									</div>
								</div>
							)}
						</div>
					)}
				</div>

				{/* Server Selection - Only show if available */}
				{isAvailable && (
					<>
						<ServerSelector
							servers={servers}
							selectedServer={selectedServer}
							onSelectServer={setSelectedServer}
							isLoading={fetchingLinks}
						/>

						{/* Error Message */}
						{error && streamSource && (
							<div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg bg-red-900/30 border border-red-700/50 text-red-200 flex items-start gap-2 sm:gap-3">
								<svg
									className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
										clipRule="evenodd"
									/>
								</svg>
								<div className="flex-1 min-w-0">
									<p className="font-semibold text-sm sm:text-base">Stream Error</p>
									<p className="text-xs sm:text-sm text-red-300 break-words">{error}</p>
									<p className="text-xs text-red-400 mt-2">
										Try selecting a different server.
									</p>
								</div>
							</div>
						)}

						{/* Info Box */}
						<div className="mt-6 sm:mt-8 p-4 sm:p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
							<h3 className="text-white font-semibold mb-3 text-sm sm:text-base flex items-center gap-2">
								<svg
									className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0z"
										clipRule="evenodd"
									/>
								</svg>
								<span>Pro Tips</span>
							</h3>
							<ul className="space-y-1.5 sm:space-y-2 text-white/70 text-xs sm:text-sm">
								<li>✓ If a stream doesn't work, try another server</li>
								<li>✓ Some servers may take longer to load</li>
								<li>✓ Use full-screen mode for the best experience</li>
								<li>✓ Check your internet connection if videos won't play</li>
							</ul>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
