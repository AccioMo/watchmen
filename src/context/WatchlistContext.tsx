"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Movie } from "../API/TMDB";

interface WatchlistContextType {
    watchlist: Movie[];
    addToWatchlist: (movie: Movie) => void;
    removeFromWatchlist: (movieId: number) => void;
    isInWatchlist: (movieId: number) => boolean;
    moveMovie: (index: number, direction: "up" | "down") => void;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export const WatchlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [watchlist, setWatchlist] = useState<Movie[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("watchlist");
        if (stored) {
            try {
                setWatchlist(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse watchlist from local storage", e);
            }
        }
        setIsInitialized(true);
    }, []);

    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem("watchlist", JSON.stringify(watchlist));
        }
    }, [watchlist, isInitialized]);

    const addToWatchlist = (movie: Movie) => {
        setWatchlist((prev) => {
            if (prev.some((m) => m.id === movie.id)) return prev;
            return [...prev, movie];
        });
    };

    const removeFromWatchlist = (movieId: number) => {
        setWatchlist((prev) => prev.filter((m) => m.id !== movieId));
    };

    const isInWatchlist = (movieId: number) => {
        return watchlist.some((m) => m.id === movieId);
    };

    const moveMovie = (index: number, direction: "up" | "down") => {
        setWatchlist((prev) => {
            const newList = [...prev];
            if (direction === "up") {
                if (index === 0) return prev;
                [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
            } else {
                if (index === newList.length - 1) return prev;
                [newList[index + 1], newList[index]] = [newList[index], newList[index + 1]];
            }
            return newList;
        });
    };

    return (
        <WatchlistContext.Provider value={{ watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist, moveMovie }}>
            {children}
        </WatchlistContext.Provider>
    );
};

export const useWatchlist = () => {
    const context = useContext(WatchlistContext);
    if (context === undefined) {
        throw new Error("useWatchlist must be used within a WatchlistProvider");
    }
    return context;
};
