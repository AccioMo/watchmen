import iconYou from '../../../public/you.svg';
import iconFind from '../../../public/find.svg';
import React from 'react';
import { useRouter } from 'next/navigation';

const NavBar: React.FC<{ fixed: boolean }> = ({ fixed }) => {
	const router = useRouter();
	return (
		<div className={`${fixed ? 'fixed top-0 w-full ' : ''}h-[132px] py-4 px-8 z-50`}>
			<div className="flex h-full w-full justify-between items-center px-4 py-4">
				<div className="flex glass-card glass-border w-[130px]">
					<div className="flex justify-center items-center cursor-pointer opacity-50 hover:opacity-100 transition-opacity duration-200">
						<img src={iconYou.src} alt="You" width={36} />
						<div className="px-2">You</div>
					</div>
				</div>
				<div className="flex glass-card glass-border">
					<ul className="flex justify-center items-center gap-4 px-8">
						<li className="text-white px-12 cursor-pointer opacity-50 hover:opacity-100 transition-opacity duration-200" onClick={() => router.push("/for-me")}>For Me</li>
						<li className="text-white px-12 cursor-pointer opacity-50 hover:opacity-100 transition-opacity duration-200" onClick={() => router.push("/popular")}>Popular</li>
						<li className="text-white px-12 cursor-pointer opacity-50 hover:opacity-100 transition-opacity duration-200" onClick={() => router.push("/new")}>New</li>
					</ul>
				</div>
				<div className="flex glass-card glass-border w-[130px]">
					<div className="flex justify-center items-center cursor-pointer opacity-50 hover:opacity-100 transition-opacity duration-200">
						<img src={iconFind.src} alt="Find" width={24} />
						<div className="px-2">Find</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default NavBar;
