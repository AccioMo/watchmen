import Link from 'next/link';
import Button from '../Components/Button';

export default function NotFound() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent animated-bg flex items-center justify-center px-4">
			<div className="text-center max-w-md">
				<div className="mb-8">
					<h1 className="text-9xl font-bold text-white/20 mb-4">404</h1>
					<h2 className="text-3xl font-bold text-white mb-4">Page Not Found</h2>
					<p className="text-white/70 mb-8">
						Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
					</p>
				</div>

				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<Link href="/">
						<Button variant="primary" size="lg">
							Go Home
						</Button>
					</Link>
					<Link href="/explore">
						<Button variant="secondary" size="lg">
							Explore Movies
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}
