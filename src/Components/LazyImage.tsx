import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

interface LazyImageProps extends Omit<ImageProps, 'onLoad'> {
    placeholderSrc?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({ src, placeholderSrc, className = "", alt, ...props }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [shouldLoad, setShouldLoad] = useState(false);
    const imgRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setShouldLoad(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div ref={imgRef} className={`relative overflow-hidden w-full h-full ${className}`}>
            {/* Low Quality Placeholder - always visible initially if provided */}
            {placeholderSrc && !isLoaded && (
                <img
                    alt={alt || "Placeholder"}
                    src={placeholderSrc}
                    className="absolute inset-0 w-full h-full object-cover"
                />
            )}

            {/* Default fallback if no placeholder and not loaded */}
            {!placeholderSrc && !isLoaded && (
                <div className="absolute inset-0 bg-neutral-800 animate-pulse" />
            )}

            {/* High Quality Image - loads when in view */}
            {src && shouldLoad && (
                <Image
                    {...props}
                    src={src}
                    alt={alt || "Image"}
                    className={`object-cover ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setIsLoaded(true)}
                />
            )}
        </div>
    );
};

export default LazyImage;
