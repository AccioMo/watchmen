import React, { useCallback, useEffect, useState, useRef } from "react";

interface SliderProps {
    min: number;
    max: number;
    step?: number;
    value: [number, number];
    onChange: (value: [number, number]) => void;
    formatLabel?: (value: number) => string;
}

const Slider: React.FC<SliderProps> = ({
    min,
    max,
    step = 1,
    value,
    onChange,
    formatLabel = (v) => v.toString(),
}) => {
    const [minVal, setMinVal] = useState(value[0]);
    const [maxVal, setMaxVal] = useState(value[1]);
    const minValRef = useRef(value[0]);
    const maxValRef = useRef(value[1]);
    const range = useRef<HTMLDivElement>(null);

    // Convert to percentage
    const getPercent = useCallback(
        (value: number) => Math.round(((value - min) / (max - min)) * 100),
        [min, max]
    );

    // Set width of the range to decrease from the left side
    useEffect(() => {
        const minPercent = getPercent(minVal);
        const maxPercent = getPercent(maxValRef.current);

        if (range.current) {
            range.current.style.left = `${minPercent}%`;
            range.current.style.width = `${maxPercent - minPercent}%`;
        }
    }, [minVal, getPercent]);

    // Set width of the range to decrease from the right side
    useEffect(() => {
        const minPercent = getPercent(minValRef.current);
        const maxPercent = getPercent(maxVal);

        if (range.current) {
            range.current.style.width = `${maxPercent - minPercent}%`;
        }
    }, [maxVal, getPercent]);

    useEffect(() => {
        setMinVal(value[0]);
        setMaxVal(value[1]);
        minValRef.current = value[0];
        maxValRef.current = value[1];
    }, [value]);

    return (
        <div className="relative w-full h-8 mb-8">
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={minVal}
                onChange={(event) => {
                    const value = Math.min(Number(event.target.value), maxVal - (step || 1));
                    setMinVal(value);
                    minValRef.current = value;
                    onChange([value, maxVal]);
                }}
                className="thumb thumb--left z-[3] absolute top-1/2 -translate-y-1/2 left-0 h-0 w-full outline-none pointer-events-none appearance-none"
                style={{ zIndex: minVal > max - 100 ? "5" : "3" }}
            />
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={maxVal}
                onChange={(event) => {
                    const value = Math.max(Number(event.target.value), minVal + (step || 1));
                    setMaxVal(value);
                    maxValRef.current = value;
                    onChange([minVal, value]);
                }}
                className="thumb thumb--right z-[4] absolute top-1/2 -translate-y-1/2 left-0 h-0 w-full outline-none pointer-events-none appearance-none"
            />

            <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-1 z-[1]">
                <div className="absolute top-0 left-0 right-0 h-full rounded-full bg-white/20" />
                <div
                    ref={range}
                    className="absolute top-0 h-full rounded-full bg-white"
                />
            </div>

            <style jsx>{`
                input[type=range] {
                    -webkit-appearance: none;
                    appearance: none;
                }
                
                /* Webkit / Chrome */
                .thumb::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    background-color: #000;
                    border: 2px solid #fff;
                    border-radius: 50%;
                    cursor: pointer;
                    height: 12px;
                    width: 12px;
                    margin-top: 0px; 
                    pointer-events: auto;
                    box-shadow: 0 0 0 0 rgba(255,255,255,0);
                    transition: box-shadow 0.2s ease, transform 0.2s ease;
                }

                /* Moz / Firefox */
                .thumb::-moz-range-thumb {
                    -webkit-appearance: none;
                    background-color: #000;
                    border: 2px solid #fff;
                    border-radius: 50%;
                    cursor: pointer;
                    height: 12px;
                    width: 12px;
                    pointer-events: auto;
                    transition: box-shadow 0.2s ease, transform 0.2s ease;
                }
            `}</style>

            {/* Labels */}
            <div className="absolute -bottom-6 left-0 text-[10px] font-medium tracking-wider text-white/50 uppercase">{formatLabel(min)}</div>
            <div className="absolute -bottom-6 right-0 text-[10px] font-medium tracking-wider text-white/50 uppercase">{formatLabel(max)}</div>

            {/* Current Value Tooltip */}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-1">
                <span className="text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded border border-white/5">
                    {formatLabel(minVal)} — {formatLabel(maxVal)}
                </span>
            </div>
        </div>
    );
};

export default Slider;
