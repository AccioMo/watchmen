import React from "react";

interface RatingCardProps {
    type: 'TMDB' | 'IMDb' | 'RottenTomatoes' | 'Metacritic';
    value: string;
    link: string;
    className?: string;
}

const RatingCard: React.FC<RatingCardProps> = ({ type, value, link, className = "" }) => {
    const getStyles = () => {
        switch (type) {
            case 'TMDB':
                return {
                    bg: "bg-[#0d253f]/80",
                    border: "border-[#01b4e4]/30",
                    text: "text-[#01b4e4]",
                    icon: (
                        <div className="w-5 h-3 bg-gradient-to-r from-[#90cea1] to-[#01b4e4] rounded-sm mr-1"></div>
                    )
                };
            case 'IMDb':
                return {
                    bg: "bg-[#F5C518]/20",
                    border: "border-[#F5C518]/30",
                    text: "text-[#F5C518]",
                    icon: <span className="font-black mr-1 text-xs bg-[#F5C518] text-black px-1 rounded-sm">IMDb</span>
                };
            case 'RottenTomatoes':
                return {
                    bg: "bg-[#FA320A]/20",
                    border: "border-[#FA320A]/30",
                    text: "text-[#FA320A]",
                    icon: <span className="mr-1 text-lg leading-none">🍅</span>
                };
            case 'Metacritic':
                return {
                    bg: "bg-[#66CC33]/20",
                    border: "border-[#66CC33]/30",
                    text: "text-[#66CC33]",
                    icon: <span className="bg-[#66CC33] text-black text-[10px] w-4 h-4 flex items-center justify-center font-bold rounded-sm mr-1">M</span>
                };
            default:
                return { bg: "bg-white/10", border: "border-white/20", text: "text-white", icon: null };
        }
    };

    const styles = getStyles();

    return (
        <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border backdrop-blur-md transition-all duration-300 hover:bg-opacity-40 cursor-pointer ${styles.bg} ${styles.border} ${styles.text} ${className}`}
        >
            {styles.icon}
            <span className="font-bold text-sm tracking-wide">{value}</span>
        </a>
    );
};

export default RatingCard;
