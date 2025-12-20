"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Movie, TVShow } from "../API/TMDB";
import { WatchlistItem } from "./WatchlistTypes";

interface WatchlistContextType {
    watchlist: WatchlistItem[];
    addToWatchlist: (item: Movie | TVShow, type: "movie" | "tv") => void;
    removeFromWatchlist: (id: number, type: "movie" | "tv") => void;
    isInWatchlist: (id: number, type: "movie" | "tv") => boolean;
    moveMovie: (index: number, direction: "up" | "down") => void;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export const WatchlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("watchlist");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Migration: if items don't have media_type, assume they are movies
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const migrated = parsed.map((item: any) => {
                    if (!item.media_type) {
                        return { ...item, media_type: "movie" };
                    }
                    return item;
                });
                setWatchlist(migrated);
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

    const addToWatchlist = (item: Movie | TVShow, type: "movie" | "tv") => {
        setWatchlist((prev) => {
            if (prev.some((m) => m.id === item.id && m.media_type === type)) return prev;
            return [...prev, { ...item, media_type: type } as WatchlistItem];
        });
    };

    const removeFromWatchlist = (id: number, type: "movie" | "tv") => {
        setWatchlist((prev) => prev.filter((m) => !(m.id === id && m.media_type === type)));
    };

    const isInWatchlist = (id: number, type: "movie" | "tv") => {
        return watchlist.some((m) => m.id === id && m.media_type === type);
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
