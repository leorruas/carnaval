import { useMemo, useState, useEffect } from 'react';
import { sortBlocksByDateTime, groupBlocksByDate } from '../utils/dateUtils';
import { getDateTheme } from '../utils/themeUtils';

export const useAgendaSelection = (allBlocks, sharedData, isSharedMode, favoriteBlocks) => {
    const blocksList = Array.isArray(favoriteBlocks) ? favoriteBlocks : [];

    const currentBlocks = useMemo(() => {
        if (isSharedMode && sharedData) {
            const ids = sharedData.blocks || [];
            const hydrated = allBlocks.filter(b => ids.includes(b.id));
            return sortBlocksByDateTime(hydrated);
        }
        const favoriteIds = blocksList.map(f => f.id);
        const blocks = allBlocks.filter(b => favoriteIds.includes(b.id));
        return sortBlocksByDateTime(blocks);
    }, [isSharedMode, sharedData, blocksList, allBlocks]);

    const navigationDates = useMemo(() => {
        const groups = groupBlocksByDate(currentBlocks);
        return Object.keys(groups).sort();
    }, [currentBlocks]);

    const [selectedDate, setSelectedDate] = useState(null);

    useEffect(() => {
        if (!selectedDate || !navigationDates.includes(selectedDate)) {
            if (navigationDates.length > 0) setSelectedDate(navigationDates[0]);
            else setSelectedDate(null);
        }
    }, [navigationDates, selectedDate]);

    const displayBlocks = useMemo(() => {
        if (!selectedDate) return [];
        return currentBlocks.filter(b => b.data === selectedDate);
    }, [currentBlocks, selectedDate]);

    const nextBlock = useMemo(() => {
        if (isSharedMode) return null;
        const now = new Date();
        return currentBlocks.find(block => {
            const blockDate = new Date(`${block.data}T${block.horario || '00:00'}`);
            return blockDate > now;
        });
    }, [currentBlocks, isSharedMode]);

    const nextBlockTheme = nextBlock ? getDateTheme(nextBlock.data) : null;

    return { currentBlocks, navigationDates, selectedDate, setSelectedDate, displayBlocks, nextBlock, nextBlockTheme };
};
