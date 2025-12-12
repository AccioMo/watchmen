import type { Metadata } from 'next'
import NavBar from "../Components/NavBar";

import Footer from "../Components/Footer";
import { WatchlistProvider } from "../context/WatchlistContext";

import '../index.css'

import { Outfit } from 'next/font/google'

const outfit = Outfit({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: 'N4tflix',
	description: 'Watch movies for free with friends',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className="no-scrollbar">
			<body className={outfit.className}>
				<WatchlistProvider>
					<div id="root">
						<NavBar fixed={true} />
						{children}
						<Footer />
					</div>
				</WatchlistProvider>
			</body>
		</html>
	);
}
