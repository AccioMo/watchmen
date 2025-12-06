export default function Loading() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent animated-bg flex items-center justify-center">
			<div className="text-center">
				<div className="relative w-24 h-24 mx-auto mb-8">
					<div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
					<div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin"></div>
				</div>
				<h2 className="text-2xl font-bold text-white mb-2">Loading...</h2>
				<p className="text-white/60">Please wait while we fetch your content</p>
			</div>
		</div>
	);
}
