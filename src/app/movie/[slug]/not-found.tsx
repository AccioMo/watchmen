import Link from 'next/link';
import Button from '@/app/Components/Button';

export default function MovieNotFound() {
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
						d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
					/>
				</svg>
				<h2 className="text-3xl font-bold text-white mb-4">Movie Not Found</h2>
				<p className="text-white/70 mb-8">
					We couldn't find the movie you're looking for. It may not be in our database yet.
				</p>
				
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<Link href="/">
						<Button variant="primary">
							Browse Popular
						</Button>
					</Link>
					<Link href="/explore">
						<Button variant="secondary">
							Search Movies
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}
