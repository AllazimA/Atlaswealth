import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Tracks page navigation — Base44 analytics removed
export default function NavigationTracker() {
    const location = useLocation();

    useEffect(() => {
        // Navigation tracking hook — extend here if you add your own analytics
    }, [location]);

    return null;
}
