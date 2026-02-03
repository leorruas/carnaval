import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hydrateBlocks } from './blockService';
import * as firebase from 'firebase/firestore';

// Mock Firebase
vi.mock('firebase/firestore', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        collection: vi.fn(),
        query: vi.fn(),
        where: vi.fn(),
        getDocs: vi.fn(),
    };
});

// Mock Firebase app
vi.mock('./firebase', () => ({
    db: {}
}));

// Mock blocos.json
vi.mock('../data/blocos.json', () => ({
    default: [
        { id: '18161', nome: 'GRANDE BLOCO DO ENCONTRO', data: '2026-01-31', horario: '09:00', endereco: 'PRACA APA, 703' },
        { id: '18013', nome: 'BURITIS DE GUIMARÃES ROSA', data: '2026-01-31', horario: '09:30', endereco: 'RUA JUVENAL MELO SENRA, 385' },
        { id: '18973', nome: 'BLOCO DA FLORESTA', data: '2026-01-31', horario: '09:30', endereco: 'RUA DEPUTADO BERNARDINO' },
    ]
}));

describe('blockService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('hydrateBlocks', () => {
        it('should return empty array for empty input', async () => {
            const result = await hydrateBlocks([]);
            expect(result).toEqual([]);
        });

        it('should return empty array for null/undefined input', async () => {
            const result1 = await hydrateBlocks(null);
            const result2 = await hydrateBlocks(undefined);
            expect(result1).toEqual([]);
            expect(result2).toEqual([]);
        });

        it('should hydrate blocks from static data', async () => {
            const result = await hydrateBlocks(['18161', '18013']);

            expect(result).toHaveLength(2);
            expect(result[0]).toMatchObject({
                id: '18161',
                nome: 'GRANDE BLOCO DO ENCONTRO',
                horario: '09:00'
            });
            expect(result[1]).toMatchObject({
                id: '18013',
                nome: 'BURITIS DE GUIMARÃES ROSA',
                horario: '09:30'
            });
        });

        it('should handle numeric IDs by converting to strings', async () => {
            const result = await hydrateBlocks([18161, 18013]);

            expect(result).toHaveLength(2);
            expect(result[0].id).toBe('18161');
        });

        it('should fetch missing blocks from Firestore', async () => {
            const mockDocs = [
                {
                    id: 'dynamic-1',
                    data: () => ({ nome: 'Dynamic Block', data: '2026-02-01', horario: '10:00' })
                }
            ];

            firebase.getDocs.mockResolvedValue({
                docs: mockDocs
            });

            const result = await hydrateBlocks(['18161', 'dynamic-1']);

            // Should find 18161 in static data
            expect(result.some(b => b.id === '18161')).toBe(true);

            // Should fetch dynamic-1 from Firestore
            expect(firebase.getDocs).toHaveBeenCalled();
        });

        it('should handle Firestore errors gracefully', async () => {
            firebase.getDocs.mockRejectedValue(new Error('Firestore error'));

            // Should still return static blocks even if Firestore fails
            const result = await hydrateBlocks(['18161', 'missing-block']);

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('18161');
        });

        it('should filter out non-existent blocks silently', async () => {
            firebase.getDocs.mockResolvedValue({ docs: [] });

            const result = await hydrateBlocks(['18161', '999999']);

            // Only 18161 should be found
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('18161');
        });

        it('should batch Firestore queries for > 10 blocks', async () => {
            const manyIds = Array.from({ length: 25 }, (_, i) => `dynamic-${i}`);

            firebase.getDocs.mockResolvedValue({ docs: [] });

            await hydrateBlocks(manyIds);

            // Should call getDocs 3 times (25/10 = 3 batches)
            expect(firebase.getDocs).toHaveBeenCalledTimes(3);
        });
    });
});
