export default function WatchLoading() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent animated-bg">
			<div className="container mx-auto px-4 md:px-8 py-8 md:py-16">
				{/* Back button skeleton */}
				<div className="mb-8 h-10 w-32 bg-white/10 rounded-lg animate-pulse"></div>

				{/* Title skeleton */}
				<div className="mb-8 space-y-3">
					<div className="h-12 w-3/4 bg-white/10 rounded-lg animate-pulse"></div>
					<div className="h-6 w-full max-w-3xl bg-white/10 rounded-lg animate-pulse"></div>
					<div className="h-6 w-2/3 bg-white/10 rounded-lg animate-pulse"></div>
				</div>

				{/* Video player skeleton */}
				<div className="mb-8 aspect-video bg-black/50 rounded-xl animate-pulse flex items-center justify-center">
					<svg
						className="w-20 h-20 text-white/20 animate-pulse"
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
				</div>

				{/* Server selector skeleton */}
				<div className="mb-8">
					<div className="h-8 w-48 bg-white/10 rounded-lg animate-pulse mb-4"></div>
					<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
						{[...Array(6)].map((_, i) => (
							<div
								key={i}
								className="h-12 bg-white/10 rounded-lg animate-pulse"
								style={{ animationDelay: `${i * 100}ms` }}
							></div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
