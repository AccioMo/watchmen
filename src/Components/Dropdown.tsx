import React, { useState, useRef, useEffect } from "react";

interface Option {
    label: string;
    value: string;
}

interface DropdownProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    label?: string;
    className?: string; // Allow custom styling for the container
}

const Dropdown: React.FC<DropdownProps> = ({ options, value, onChange, label, className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {label && (
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest mr-3">
                    {label}
                </span>
            )}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-sm font-medium text-white hover:text-white/80 transition-colors focus:outline-none"
            >
                {selectedOption?.label || "Select..."}
                <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-black/90 border border-white/10 backdrop-blur-xl rounded-lg shadow-2xl z-50 overflow-hidden py-1">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => handleSelect(option.value)}
                            className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors hover:bg-white/10
                                ${option.value === value ? "text-white bg-white/5" : "text-white/60"}
                            `}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dropdown;
