"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Search from './Search';

const NavBar: React.FC<{ fixed: boolean }> = ({ fixed }) => {
	const router = useRouter();
	const [isSearchOpen, setIsSearchOpen] = useState(false);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
				e.preventDefault();
				setIsSearchOpen(true);
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, []);

	return (
		<>
			<div className={`${fixed ? 'fixed top-0 w-full ' : ''}h-[132px] py-4 px-8 z-50`}>
				<div className="flex h-full w-full justify-between items-center px-4 py-4">
					<div className="flex glass-card glass-border w-[130px]">
						<div 
							className="flex justify-center items-center cursor-pointer opacity-50 hover:opacity-100 transition-opacity duration-200"
							onClick={() => router.push("/")}
						>
							<img src="/you.svg" alt="Home" width={36} />
							<div className="px-2">Home</div>
						</div>
					</div>
					<div className="flex glass-card glass-border">
						<ul className="flex justify-center items-center gap-4 px-8">
							<li className="text-white px-12 cursor-pointer opacity-50 hover:opacity-100 transition-opacity duration-200" onClick={() => router.push("/for-me")}>For Me</li>
							<li className="text-white px-12 cursor-pointer opacity-50 hover:opacity-100 transition-opacity duration-200" onClick={() => router.push("/popular")}>Popular</li>
							<li className="text-white px-12 cursor-pointer opacity-50 hover:opacity-100 transition-opacity duration-200" onClick={() => router.push("/new")}>New</li>
						</ul>
					</div>
					<div className="flex glass-card glass-border w-[130px] group">
						<div 
							className="flex justify-center items-center cursor-pointer opacity-50 hover:opacity-100 transition-opacity duration-200 relative"
							onClick={() => setIsSearchOpen(true)}
						>
							<img src="/find.svg" alt="Search" width={24} />
							<div className="px-2">Search</div>
							<div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
								Ctrl+K
							</div>
						</div>
					</div>
				</div>
			</div>
			
			<Search 
				isOpen={isSearchOpen} 
				onClose={() => setIsSearchOpen(false)} 
			/>
		</>
	);
}

export default NavBar;
