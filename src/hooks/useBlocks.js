import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import blocosData from '../data/blocos.json';

const staticBlocks = Array.isArray(blocosData) ? blocosData : (blocosData?.default || []);

// CRITICAL FIX: Global state to share ONE listener across all components
let globalBlocks = staticBlocks;
let globalLoading = true;
let globalError = null;
let globalListeners = new Set();
let unsubscribeGlobal = null;

// Initialize the SINGLE Firestore listener
const initializeGlobalListener = () => {
    if (unsubscribeGlobal || !db) {
        return; // Already initialized or no Firestore
    }

    console.log('[useBlocks] Initializing GLOBAL Firestore listener (singleton)');

    unsubscribeGlobal = onSnapshot(
        collection(db, 'approved_blocks'),
        (snapshot) => {
            const dynamicBlocks = [];
            snapshot.forEach((doc) => {
                dynamicBlocks.push({ id: doc.id, ...doc.data() });
            });

            // Merge with dedupe and property preservation
            const blockMap = new Map(staticBlocks.map(b => [b.id, b]));
            dynamicBlocks.forEach(b => {
                const existing = blockMap.get(b.id) || {};
                blockMap.set(b.id, { ...existing, ...b });
            });

            globalBlocks = Array.from(blockMap.values());
            globalLoading = false;

            // Notify all listeners
            globalListeners.forEach(callback => callback({
                blocks: globalBlocks,
                loading: globalLoading,
                error: globalError
            }));
        },
        (err) => {
            console.error("Error fetching dynamic blocks:", err);
            globalError = err;
            globalLoading = false;

            // Notify all listeners
            globalListeners.forEach(callback => callback({
                blocks: globalBlocks,
                loading: globalLoading,
                error: globalError
            }));
        }
    );
};

export const useBlocks = () => {
    const [state, setState] = useState({
        blocks: globalBlocks,
        loading: globalLoading,
        error: globalError
    });

    useEffect(() => {
        // Register this component as a listener
        const updateState = (newState) => setState(newState);
        globalListeners.add(updateState);

        // Initialize global listener only once
        initializeGlobalListener();

        // If data already loaded, update immediately
        if (!globalLoading) {
            setState({
                blocks: globalBlocks,
                loading: globalLoading,
                error: globalError
            });
        }

        return () => {
            // Unregister this component
            globalListeners.delete(updateState);

            // If no more components using it, cleanup
            if (globalListeners.size === 0 && unsubscribeGlobal) {
                console.log('[useBlocks] No more listeners, cleaning up global listener');
                unsubscribeGlobal();
                unsubscribeGlobal = null;
            }
        };
    }, []);

    return state;
};
