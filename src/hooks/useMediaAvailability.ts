// import { useEffect, useState, useCallback } from "react";
// // import { isMediaAvailableOnConsumet } from "@/API/Consumet";

// interface UseMediaAvailabilityProps {
// 	title: string;
// 	enabled?: boolean;
// }

// interface UseMediaAvailabilityResult {
// 	isAvailable: boolean;
// 	isLoading: boolean;
// 	error: string | null;
// }

// /**
//  * Custom hook to check media availability on Consumet
//  * @param title - Movie/show title to check
//  * @param enabled - Whether to enable the check (default: true)
//  * @returns Object with availability status, loading state, and error
//  */
// export const useMediaAvailability = ({
// 	title,
// 	enabled = true,
// }: UseMediaAvailabilityProps): UseMediaAvailabilityResult => {
// 	const [isAvailable, setIsAvailable] = useState(false);
// 	const [isLoading, setIsLoading] = useState(false);
// 	const [error, setError] = useState<string | null>(null);

// 	const checkAvailability = useCallback(async () => {
// 		if (!enabled || !title || title.trim() === "") {
// 			setIsAvailable(false);
// 			setIsLoading(false);
// 			return;
// 		}

// 		setIsLoading(true);
// 		setError(null);

// 		try {
// 			const available = await isMediaAvailableOnConsumet(title);
// 			setIsAvailable(available);
// 		} catch (err) {
// 			const errorMessage =
// 				err instanceof Error ? err.message : "Failed to check availability";
// 			setError(errorMessage);
// 			setIsAvailable(false);
// 		} finally {
// 			setIsLoading(false);
// 		}
// 	}, [title, enabled]);

// 	useEffect(() => {
// 		// Add a small delay to debounce rapid checks
// 		const timeoutId = setTimeout(() => {
// 			checkAvailability();
// 		}, 300);

// 		return () => clearTimeout(timeoutId);
// 	}, [checkAvailability]);

// 	return { isAvailable, isLoading, error };
// };
