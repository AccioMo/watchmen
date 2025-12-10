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
        { label: 'Watchmen', href: '/' },
        { label: 'Funny', href: '/funny' },
        { label: 'Chill', href: '/chill' },
        { label: 'Romance', href: '/romance' },
        { label: 'Action', href: '/action' },
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
            <div className={`fixed top-0 w-full z-50 transition-all duration-300 pointer-events-none`}>
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
                                className={`text-base font-medium transition-colors duration-200 
									${link.label === 'Watchmen' ? 'text-xl font-bold tracking-tight text-white mr-2' : ''}
									${pathname === link.href ? 'text-white' : 'text-white/60 hover:text-white'}
								`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Search Icon (Minimal) */}
                    <div className="ml-auto">
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="text-white/60 hover:text-white transition-colors p-2"
                        >
                            <img src="/find.svg" alt="Search" className="w-5 h-5 opacity-80" />
                        </button>
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
