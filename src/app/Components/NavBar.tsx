"use client";

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Search from './Search';

const NavBar: React.FC<{ fixed: boolean }> = ({ fixed }) => {
	const router = useRouter();
	const pathname = usePathname();
	const [isSearchOpen, setIsSearchOpen] = useState(false);

	// refs for measuring nav items and container
	const containerRef = useRef<HTMLUListElement | null>(null);
	const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
	const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number; opacity: number }>({ left: 0, width: 0, opacity: 0 });

	// items for rendering/measuring
	const navItems = [
		{ label: 'Top Rated', href: '/top' },
		{ label: 'Popular', href: '/popular' },
		{ label: 'New', href: '/new' },
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

	// measure active nav item and position the sliding indicator
	useLayoutEffect(() => {
		const updateIndicator = () => {
			// determine active index by pathname
			const activeIndex = navItems.findIndex((it) => it.href === pathname);
			const container = containerRef.current;

			if (!container || activeIndex === -1) {
				setIndicatorStyle({ left: 0, width: 0, opacity: 0 });
				return;
			}

			const activeEl = itemRefs.current[activeIndex];
			if (!activeEl) {
				setIndicatorStyle({ left: 0, width: 0, opacity: 0 });
				return;
			}

			const containerRect = container.getBoundingClientRect();
			const elRect = activeEl.getBoundingClientRect();

			const left = elRect.left - containerRect.left;
			const width = elRect.width;

			setIndicatorStyle({ left, width, opacity: 1 });
		};

		updateIndicator();
		window.addEventListener('resize', updateIndicator);
		return () => window.removeEventListener('resize', updateIndicator);
	}, [pathname]);

	return (
		<>
			<div className={`${fixed ? 'fixed top-0 h-12 md:h-20 w-full ' : ''} z-50`}>
				<div className="flex h-full w-full justify-between items-center px-4 md:px-8 py-0 md:py-4">
					<div className="glass-card glass-border rounded-full">
						<div 
							className="flex justify-between items-center h-full cursor-pointer opacity-50 hover:opacity-100 transition-opacity duration-200"
							onClick={() => router.push("/")}
						>
							<img src="/you.svg" alt="Home" className="w-6 h-6 md:w-9 md:h-9" />
							<div className="px-4 text-sm hidden sm:block">Home</div>
						</div>
					</div>
					<div className="hidden md:flex glass-card glass-border rounded-full">
						{/* wrap the list in a relative container so the sliding indicator can be absolutely positioned */}
						<div className="flex relative">
							<ul ref={containerRef} className="flex justify-around items-center gap-2 md:gap-4">
								{/* sliding indicator (pill/border) - styled via inline measured left/width */}
								<div
									style={{
										width: indicatorStyle.width,
										transform: `translateX(${indicatorStyle.left}px)`,
										opacity: indicatorStyle.opacity,
									} as React.CSSProperties}
									className={`absolute top-0 left-0 h-full rounded-full transition-all duration-300 ease-out bg-white/5 border border-white/10 pointer-events-none`}
								/>

								{/** Nav items as an array so we can measure by index **/}
								{navItems.map((item, idx) => (
									<li
										key={item.href}
										ref={(el) => { itemRefs.current[idx] = el; return; }}
										className={`relative z-10 text-white text-sm md:text-base px-2 md:px-8 cursor-pointer opacity-50 hover:opacity-100 transition-opacity duration-200`}
										onClick={() => router.push(item.href)}
									>
										{item.label}
									</li>
								))}
							</ul>
						</div>
					</div>
					<div className="glass-card glass-border rounded-full group">
						<div 
							className="flex h-full px-4 justify-center items-center cursor-pointer opacity-50 hover:opacity-100 transition-opacity duration-200 relative"
							onClick={() => setIsSearchOpen(true)}
						>
							<img src="/find.svg" alt="Search" className="w-5 h-5 md:w-6 md:h-6" />
							<div className="px-2 text-sm hidden sm:block">Search</div>
							<div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
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
