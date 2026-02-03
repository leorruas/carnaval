import { useMemo } from 'react';

export const useAgendaMatches = (isSharedMode, currentBlocks, favoriteBlocks) => {
    const blocksList = Array.isArray(favoriteBlocks) ? favoriteBlocks : [];
    return useMemo(() => {
        if (!isSharedMode) return { matches: [], newBlocks: [] };
        const myIds = new Set(blocksList.map(b => b.id));
        const matchIds = [];
        const newIds = [];
        currentBlocks.forEach(b => {
            if (myIds.has(b.id)) matchIds.push(b.id);
            else newIds.push(b.id);
        });
        return { matches: matchIds, newBlocks: newIds };
    }, [isSharedMode, currentBlocks, blocksList]);
};
