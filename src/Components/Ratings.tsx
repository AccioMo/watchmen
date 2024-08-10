import React from 'react'

interface RatingsProps {
	children: React.ReactNode;
}

export const RatingIMDB: React.FC<RatingsProps> = ({ children }) => {
  return (
	<div className="rounded-lg px-2 py-1 bg-imdb glass-border">
		{children}
	</div>
  )
}

export const RatingRoTo: React.FC<RatingsProps> = ({ children }) => {
  return (
	<div className="rounded-lg px-2 py-1 bg-roto glass-border">
		{children}
	</div>
  )
}
