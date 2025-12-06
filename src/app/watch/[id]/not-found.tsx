import Link from 'next/link';
import Button from '@/app/Components/Button';

export default function WatchNotFound() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent animated-bg flex items-center justify-center px-4">
			<div className="text-center max-w-md">
				<svg
					className="w-24 h-24 text-white/20 mx-auto mb-6"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={1.5}
						d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
					/>
				</svg>
				<h2 className="text-3xl font-bold text-white mb-4">Movie Not Found</h2>
				<p className="text-white/70 mb-8">
					We couldn't find the movie you're looking for. It may have been removed or the ID is incorrect.
				</p>
				
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<Link href="/">
						<Button variant="primary">
							Browse Movies
						</Button>
					</Link>
					<Link href="/explore">
						<Button variant="secondary">
							Explore
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}
