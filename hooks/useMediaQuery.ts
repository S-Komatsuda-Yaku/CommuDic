import { useSyncExternalStore } from 'react';

/**
 * Modern responsive hook using useSyncExternalStore.
 * Synchronizes with the window media query state.
 */
export function useMediaQuery(query: string): boolean {
    const subscribe = (callback: () => void) => {
        const matchMedia = window.matchMedia(query);
        matchMedia.addEventListener('change', callback);
        return () => matchMedia.removeEventListener('change', callback);
    };

    const getSnapshot = () => {
        return window.matchMedia(query).matches;
    };

    const getServerSnapshot = () => {
        return false; // Default for SSR
    };

    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// Predefined breakpoints matching Tailwind defaults
export const useIsMobile = () => useMediaQuery('(max-width: 767px)');
export const useIsTablet = () => useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');
