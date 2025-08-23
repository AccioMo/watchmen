import ReactPlayer from "react-player";
import { useEffect, useState } from "react";
import { consumetAPI } from "../API/Consumet";

const Watch = () => {
	const [streamUrl, setStreamUrl] = useState<string>("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchStreamUrl = async () => {
			try {
				const response = await consumetAPI.get('movies/flixhq/watch', { 
					params: { 
						episodeId: "10766", 
						mediaId: "tv/watch-rick-and-morty-39480", 
						server: "upcloud" 
					} 
				});
				setStreamUrl(response.data.sources?.[0]?.url || "");
			} catch (err) {
				console.error("Error fetching stream URL:", err);
				setError("Failed to load video stream");
			} finally {
				setLoading(false);
			}
		};

		fetchStreamUrl();
	}, []);

	if (loading) {
		return <div className="flex items-center justify-center h-64">Loading...</div>;
	}

	if (error) {
		return <div className="flex items-center justify-center h-64 text-red-500">Error: {error}</div>;
	}

	return (
		<div>
			<div className="">
				{streamUrl && (
					<ReactPlayer url={streamUrl} controls={true} width="100%" height="100%" />
				)}
			</div>
		</div>
	);
};

export default Watch;
