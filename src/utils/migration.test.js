import { describe, it, expect, vi } from 'vitest';
import { mergeFavorites } from './migration';
import * as syncService from '../services/syncService';

vi.mock('../services/syncService', () => ({
    saveUserFavorites: vi.fn().mockResolvedValue()
}));

describe('migration helper', () => {
    it('should merge and deduplicate favorites', async () => {
        const local = [1, 2];
        const cloud = [2, 3];
        const result = await mergeFavorites('user1', local, cloud);

        expect(result).toContain(1);
        expect(result).toContain(2);
        expect(result).toContain(3);
        expect(result.length).toBe(3);
    });

    it('should push update to cloud if local adds new data', async () => {
        const local = [1, 2];
        const cloud = [1];
        await mergeFavorites('user1', local, cloud);

        expect(syncService.saveUserFavorites).toHaveBeenCalledWith('user1', [1, 2], 'Folião');
    });

    it('should NOT push update to cloud if local has no new data', async () => {
        vi.clearAllMocks();
        const local = [1];
        const cloud = [1, 2];
        await mergeFavorites('user1', local, cloud);

        expect(syncService.saveUserFavorites).not.toHaveBeenCalled();
    });
});
