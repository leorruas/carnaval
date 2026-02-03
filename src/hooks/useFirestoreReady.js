import { useState, useEffect } from 'react';

/**
 * Hook to monitor Firestore connection readiness.
 * Simplified version - just checks network status without aggressive Firestore probing
 * Returns { isReady, isOnline, error }
 */
export const useFirestoreReady = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    // Firestore is ready if we're online
    // Don't do aggressive checks that cause "INTERNAL ASSERTION FAILED"
    const isReady = isOnline;

    useEffect(() => {
        const handleOnline = () => {
            console.log('[useFirestoreReady] Network online');
            setIsOnline(true);
        };

        const handleOffline = () => {
            console.log('[useFirestoreReady] Network offline');
            setIsOnline(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Log initial state
        console.log(`[useFirestoreReady] Initial state - Online: ${isOnline}`);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return { isReady, isOnline, error: null };
};
