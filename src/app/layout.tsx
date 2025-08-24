import type { Metadata } from 'next'
import NavBar from "@/Components/NavBar";
 
import '../index.css'

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
			<body>
				<div id="root">
					<NavBar fixed={true} />
					{children}
				</div>
			</body>
		</html>
	);
}
