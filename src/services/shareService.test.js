import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createShareLink, getSharedAgenda, getPublicAgenda } from './shareService';
import { addDoc, getDoc, doc } from 'firebase/firestore';

// Mock Firebase
vi.mock('./firebase', () => ({
    db: { _firestoreClient: {} }
}));

vi.mock('firebase/firestore', () => ({
    collection: vi.fn((db, name) => ({ _collectionPath: name })),
    addDoc: vi.fn(),
    getDoc: vi.fn(),
    doc: vi.fn((db, collection, id) => ({ _docPath: `${collection}/${id}` })),
    serverTimestamp: vi.fn(() => ({ _serverTimestamp: true }))
}));

describe('shareService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createShareLink', () => {
        it('should create a share link successfully', async () => {
            const mockDocRef = { id: 'test-share-id-123' };
            addDoc.mockResolvedValue(mockDocRef);

            const result = await createShareLink('user123', 'Test User', [1, 2, 3]);

            expect(result).toBe('test-share-id-123');
            expect(addDoc).toHaveBeenCalledWith(
                expect.objectContaining({ _collectionPath: 'shared_agendas' }),
                expect.objectContaining({
                    ownerId: 'user123',
                    ownerName: 'Test User',
                    blocks: [1, 2, 3]
                })
            );
        });

        it('should timeout after 10 seconds', async () => {
            // Mock a slow Firebase operation
            addDoc.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 15000)));

            await expect(
                createShareLink('user123', 'Test User', [1, 2, 3])
            ).rejects.toThrow('Operation timed out');
        }, 12000); // Test timeout of 12 seconds

        it('should throw error for invalid userId', async () => {
            await expect(
                createShareLink('', 'Test User', [1, 2, 3])
            ).rejects.toThrow('Invalid parameters for share link creation');
        });

        it('should throw error for invalid userName', async () => {
            await expect(
                createShareLink('user123', '', [1, 2, 3])
            ).rejects.toThrow('Invalid parameters for share link creation');
        });

        it('should throw error for empty blockIds', async () => {
            await expect(
                createShareLink('user123', 'Test User', [])
            ).rejects.toThrow('Invalid parameters for share link creation');
        });

        it('should throw error for non-array blockIds', async () => {
            await expect(
                createShareLink('user123', 'Test User', 'not-an-array')
            ).rejects.toThrow('Invalid parameters for share link creation');
        });

        it('should handle Firebase errors gracefully', async () => {
            const firebaseError = new Error('Firebase: Permission denied');
            firebaseError.code = 'permission-denied';
            addDoc.mockRejectedValue(firebaseError);

            await expect(
                createShareLink('user123', 'Test User', [1, 2, 3])
            ).rejects.toThrow('Firebase: Permission denied');
        });
    });

    describe('getSharedAgenda', () => {
        it('should retrieve a shared agenda successfully', async () => {
            const mockData = {
                ownerId: 'user123',
                ownerName: 'Test User',
                blocks: [1, 2, 3],
                createdAt: { seconds: 1234567890 }
            };

            getDoc.mockResolvedValue({
                exists: () => true,
                id: 'share-id-123',
                data: () => mockData
            });

            const result = await getSharedAgenda('share-id-123');

            expect(result).toEqual({
                id: 'share-id-123',
                ...mockData
            });
        });

        it('should return null for non-existent share', async () => {
            getDoc.mockResolvedValue({
                exists: () => false
            });

            const result = await getSharedAgenda('non-existent-id');

            expect(result).toBeNull();
        });

        it('should handle Firebase errors', async () => {
            getDoc.mockRejectedValue(new Error('Network error'));

            await expect(
                getSharedAgenda('share-id-123')
            ).rejects.toThrow('Network error');
        });
    });

    describe('getPublicAgenda', () => {
        it('should retrieve a public agenda successfully', async () => {
            const mockData = {
                ownerName: 'Test User',
                blocks: [1, 2]
            };
            const mockDocSnap = {
                exists: () => true,
                id: 'user-123',
                data: () => mockData
            };
            getDoc.mockResolvedValue(mockDocSnap);

            const result = await getPublicAgenda('user-123');

            expect(doc).toHaveBeenCalledWith(expect.objectContaining({ _firestoreClient: {} }), 'public_agendas', 'user-123');
            expect(getDoc).toHaveBeenCalled();
            expect(result).toEqual({ id: 'user-123', ...mockData });
        });

        it('should return null if public agenda does not exist', async () => {
            const mockDocSnap = {
                exists: () => false
            };
            getDoc.mockResolvedValue(mockDocSnap);

            const result = await getPublicAgenda('non-existent');

            expect(result).toBeNull();
        });

        it('should handle Firebase errors', async () => {
            getDoc.mockRejectedValue(new Error('Firebase error'));

            await expect(getPublicAgenda('user-123'))
                .rejects.toThrow('Firebase error');
        });
    });
});
