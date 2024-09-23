import React from "react";
import { LinearBlur } from "./LinearBlur";

export const MovieBox = () => {
	return (
		<div className="h-64 w-48">
			<div className="fixed top-0 left-0 w-full h-28">
				<LinearBlur side="top" className="linearBlur h-full" />
			</div>
		</div>
	);
};
