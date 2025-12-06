import type { Metadata } from 'next'
import NavBar from "@/Components/NavBar";

import '../index.css'

import { Outfit } from 'next/font/google'

const outfit = Outfit({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: 'accioFX',
	description: 'Watch movies for free with friends',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={outfit.className}>
				<div id="root">
					<NavBar fixed={true} />
					{children}
				</div>
			</body>
		</html>
	);
}
