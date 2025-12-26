'use client';

import React from 'react';
import { ButtonProps } from './Button.types';

const Button: React.FC<ButtonProps> = ({
	variant = 'primary',
	size = 'md',
	loading = false,
	disabled = false,
	icon,
	iconPosition = 'left',
	fullWidth = false,
	className = '',
	children,
	...props
}) => {
	// Base styles
	const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';

	// Variant styles
	const variantStyles = {
		primary: 'bg-white text-black hover:bg-neutral-200 shadow-lg hover:shadow-xl focus:ring-white/50',
		secondary: 'bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 focus:ring-white/50',
		ghost: 'bg-transparent text-white/80 hover:text-white hover:bg-white/10 focus:ring-white/30',
		danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl focus:ring-red-500',
		link: 'bg-transparent text-indigo-400 hover:text-indigo-300 underline-offset-4 hover:underline focus:ring-indigo-400',
	};

	// Size styles
	const sizeStyles = {
		sm: 'text-sm px-4 py-2',
		md: 'text-base px-6 py-3',
		lg: 'text-lg px-8 py-4',
	};

	// Width styles
	const widthStyles = fullWidth ? 'w-full' : '';

	// Combine all styles
	const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`;

	// Loading spinner
	const LoadingSpinner = () => (
		<svg
			className="animate-spin h-5 w-5"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
		>
			<circle
				className="opacity-25"
				cx="12"
				cy="12"
				r="10"
				stroke="currentColor"
				strokeWidth="4"
			></circle>
			<path
				className="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			></path>
		</svg>
	);

	return (
		<button
			className={combinedStyles}
			disabled={disabled || loading}
			{...props}
		>
			{loading ? (
				<LoadingSpinner />
			) : (
				icon && iconPosition === 'left' && icon
			)}
			{children}
			{!loading && icon && iconPosition === 'right' && icon}
		</button>
	);
};

export default Button;
