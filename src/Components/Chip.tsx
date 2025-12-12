import React from "react";

interface ChipProps {
    label: string;
    isSelected: boolean;
    onClick: () => void;
    colorClass?: string;
}

const Chip: React.FC<ChipProps> = ({ label, isSelected, onClick, colorClass = "bg-blue-500" }) => {
    return (
        <button
            onClick={onClick}
            className={`
                px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider text-left transition-all duration-200 border
                ${isSelected
                    ? `${colorClass} border-transparent text-white shadow-md transform scale-100`
                    : "bg-transparent border-white/10 text-white/40 hover:border-white/30 hover:text-white/80"
                }
            `}
        >
            {label}
        </button>
    );
};

export default Chip;
