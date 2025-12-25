"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Search from './Search';
import Link from 'next/link';


const NavBar: React.FC<{ fixed?: boolean }> = () => {
    const pathname = usePathname();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const navLinks = [
        { label: 'DEMETR', href: '/' },
        { label: 'Explore', href: '/explore' },
        { label: 'Popular', href: '/popular' },
        { label: 'New', href: '/new' },
        { label: 'Top', href: '/top' },
    ];

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 0) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
            <div className={`fixed top-0 w-full z-[100] transition-all duration-300 pointer-events-none`}>
                <div
                    className={`relative flex items-center px-6 py-3 pointer-events-auto transition-all duration-300
						${isScrolled
                            ? 'bg-black/80 backdrop-blur-md border-b border-white/10'
                            : 'bg-gradient-to-b from-black/80 to-transparent border-none border-transparent'
                        }
					`}
                >
                    {/* Navigation Links */}
                    <nav className="flex items-center gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-base text-white font-medium transition-colors duration-200 outline-none border-none hover:border-none focus:outline-none decoration-0 no-underline
									${link.label === 'DEMETR' ? 'text-xl font-sans font-extrabold tracking-[-0.01rem] text-white mr-3' : ''}
								`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right Side Actions */}
                    <div className="ml-auto flex items-center gap-4">
                        {/* Search Icon */}
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="text-white/60 hover:text-white transition-colors p-2"
                        >
                            <img src="/find.svg" alt="Search" className="w-5 h-5 opacity-80" />
                        </button>

                        {/* Watchlist Icon */}
                        <Link
                            href="/watchlist"
                            className={`text-white/60 hover:text-white transition-colors p-2 ${pathname === '/watchlist' ? 'text-white' : ''}`}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                                />
                            </svg>
                        </Link>
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
