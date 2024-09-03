import React from 'react'

interface RatingsProps {
	children: React.ReactNode;
}

export const RatingIMDB: React.FC<RatingsProps> = ({ children }) => {
  return (
	<div className="flex rounded-lg px-2 py-1 bg-imdb shadow-md glass-border">
		<h2 className="font-bold mr-1">IMDB:</h2>
		{children}
	</div>
  )
}

export const RatingRoTo: React.FC<RatingsProps> = ({ children }) => {
  return (
	<div className="flex rounded-lg px-2 py-1 bg-roto shadow-md glass-border">
		<h2 className="font-bold mr-1">Rotten Tomatoes:</h2>
		{children}
	</div>
  )
}
