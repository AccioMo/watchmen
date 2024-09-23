import ReactPlayer from "react-player";
import { consumetAPI } from "../API/Consumet";

const Watch = () => {
	const streamUrl = consumetAPI.get('movies/flixhq/watch', { params: { episodeId: "10766", mediaId: "tv/watch-rick-and-morty-39480", server: "upcloud" } });
	return (
		<div>
			<div className="">
				<ReactPlayer url={streamUrl} controls={true} width="100%" height="100%" />
			</div>
		</div>
	);
};

export default Watch;
