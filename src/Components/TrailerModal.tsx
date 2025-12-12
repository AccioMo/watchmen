'use client';

import { useEffect, useState } from "react";

interface TrailerModalProps {
    trailerKey: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function TrailerModal({ trailerKey, isOpen, onClose }: TrailerModalProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
        } else {
            setIsVisible(false);
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/10 border border-white/10 z-10">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2 bg-black/50 text-white/70 hover:text-white rounded-full hover:bg-black/80 transition-all"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Video Player */}
                <iframe
                    src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`}
                    className="w-full h-full border-0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title="Movie Trailer"
                />
            </div>
        </div>
    );
}
