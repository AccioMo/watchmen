"use client";

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Search from './Search';

const NavBar: React.FC<{ fixed: boolean }> = ({ fixed }) => {
	const router = useRouter();
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [tags, setTags] = useState([]);

	const genreTags = [
		{ label: 'Fun', href: '/top', color: '#26532B' },
		{ label: 'Chill', href: '/popular', color: '#5ABCB9' },
		{ label: 'Action', href: '/action', color: '#8D0801' },
	// 	{ label: 'Romance', href: '/romance', color: '#CA6680' },
	// 	{ label: 'New', href: '/new', color: '#BCB6FF' },
	];
	const sortTags = [
		{ label: 'Popular', href: '/top', color: '#26532B' },
		{ label: 'New', href: '/popular', color: '#5ABCB9' },
		{ label: 'Top', href: '/action', color: '#8D0801' },
	// 	{ label: 'Romance', href: '/romance', color: '#CA6680' },
	// 	{ label: 'New', href: '/new', color: '#BCB6FF' },
	];

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
			<div className={`${fixed ? 'fixed top-0 h-12 md:h-20 lg:h-24 w-full ' : ''} z-50`}>
				<div className="flex h-full w-full select-none justify-evenly items-center px-4 md:px-8 py-0 md:py-6">
					{/* <div className="backdrop-blur-md rounded-full shadow-md rounded-full">
						<div
							className="flex justify-between items-center h-full cursor-pointer opacity-50 hover:opacity-100 transition-opacity duration-200"
							onClick={() => router.push("/")}
						>
							<img src="/you.svg" alt="Home" className="w-6 h-6 md:w-9 md:h-9" />
							<div className="px-4 text-sm hidden sm:block">username</div>
						</div>
					</div> */}
					{/* <div className="h-full text-center"> */}
					<div className="flex gap-4 h-full">
						<ul className="flex h-full justify-around items-center gap-2 md:gap-4">
							{genreTags.map((item, idx) => (
								<li
									key={item.href}
									className={`backdrop-blur-md rounded-full shadow-md flex h-full z-10 text-white/60 text-sm md:text-base px-2 md:px-8 cursor-pointer transition-all duration-200`}
									onClick={() => {
										if (!tags.includes(item.label)) {
											setTags([...tags, item.label]);
										} else {
											setTags(prev => 
												prev.includes(item.label)
													? prev.filter(tag => tag !== item.label)
													: [...prev, item.label]
												);
										}
										console.log(tags)
									}}
									style={{
										border: tags.includes(item.label) 
											? '2px solid ' + '#ffffff60'
											: '2px solid #ffffff08',
										backgroundColor: tags.includes(item.label)
										? '#fafafa14'
										: '#1b1b1b04',
										color: tags.includes(item.label)
										? '#ffffff84'
										: '#ffffff44',
										}}>
									<a className={`my-auto text-sm md:text-base`}>
										{item.label}
									</a>
								</li>
							))}
						</ul>
						<div className="backdrop-blur-md rounded-full shadow-md h-full border-2 border-white/50 group">
							<div className="flex h-full px-4 min-w-96 items-center cursor-pointer opacity-50 hover:opacity-100 transition-opacity duration-200 relative"
									onClick={() => setIsSearchOpen(true)}>
								<img src="/find.svg" alt="Search" className="w-5 h-5 md:w-6 md:h-6" />
								<div className="px-4 text-sm hidden sm:block">Search...</div>
								<div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
									Ctrl+K
								</div>
							</div>
						</div>
						<ul className="flex h-full justify-around items-center gap-2 md:gap-4">
							{sortTags.map((item, idx) => (
								<li
									key={item.href}
									className={`backdrop-blur-md rounded-full shadow-md flex h-full z-10 text-white/60 text-sm md:text-base px-2 md:px-8 cursor-pointer transition-all duration-200`}
									onClick={() => {
										if (!tags.includes(item.label)) {
											setTags([...tags, item.label]);
										} else {
											setTags(prev => 
												prev.includes(item.label)
													? prev.filter(tag => tag !== item.label)
													: [...prev, item.label]
												);
										}
										console.log(tags)
									}}
									style={{
										border: tags.includes(item.label) 
											? '2px solid ' + '#ffffff60'
											: '2px solid #ffffff08',
										backgroundColor: tags.includes(item.label)
										? '#fafafa14'
										: '#1b1b1b04',
										color: tags.includes(item.label)
										? '#ffffff84'
										: '#ffffff44',
										}}>
									<a className={`my-auto text-sm md:text-base`}>
										{item.label}
									</a>
								</li>
							))}
						</ul>
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
