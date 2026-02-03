import { describe, it, expect, vi } from 'vitest';
import { mergeUserData } from './migration';
import * as syncService from '../services/syncService';

vi.mock('../services/syncService', () => ({
    saveUserData: vi.fn().mockResolvedValue()
}));

describe('migration helper', () => {
    it('should merge and deduplicate favorites and friends', async () => {
        const local = {
            favorites: [{ id: 1 }, { id: 2 }],
            friends: [{ shareId: 'a' }]
        };
        const cloud = {
            favorites: [{ id: 2 }, { id: 3 }],
            friends: [{ shareId: 'b' }]
        };

        const result = await mergeUserData('user1', local, cloud);

        expect(result.favorites).toEqual(expect.arrayContaining([{ id: 1 }, { id: 2 }, { id: 3 }]));
        expect(result.favorites.length).toBe(3);

        expect(result.friends).toEqual(expect.arrayContaining([{ shareId: 'a' }, { shareId: 'b' }]));
        expect(result.friends.length).toBe(2);
    });

    it('should push update to cloud if local adds new data', async () => {
        const local = {
            favorites: [{ id: 1 }, { id: 2 }],
            friends: []
        };
        const cloud = {
            favorites: [{ id: 1 }],
            friends: []
        };

        await mergeUserData('user1', local, cloud);

        expect(syncService.saveUserData).toHaveBeenCalledWith(
            'user1',
            expect.objectContaining({
                favorites: expect.arrayContaining([{ id: 1 }, { id: 2 }])
            }),
            'Folião'
        );
    });

    it('should NOT push update to cloud if local has no new data', async () => {
        vi.clearAllMocks();
        const local = {
            favorites: [{ id: 1 }],
            friends: []
        };
        const cloud = {
            favorites: [{ id: 1 }, { id: 2 }],
            friends: []
        };

        await mergeUserData('user1', local, cloud);

        expect(syncService.saveUserData).not.toHaveBeenCalled();
    });
});

