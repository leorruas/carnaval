import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MyAgenda from './MyAgenda';
import useStore from '../store/useStore';

window.__IS_TEST__ = true;

// --- MOCKS ---
vi.mock('../store/useStore', () => {
    const mockUseStore = vi.fn();
    mockUseStore.getState = vi.fn(() => ({
        syncNow: vi.fn().mockResolvedValue()
    }));
    return { default: mockUseStore };
});

vi.mock('firebase/auth', () => ({
    getAuth: vi.fn(() => ({
        currentUser: { uid: 'user1', displayName: 'Test User' }
    })),
}));

vi.mock('../data/blocos.json', () => ({
    default: [
        { id: '1', nome: 'Bloco 1', data: '2026-02-15', horario: '10:00', local: 'Rua A' },
        { id: '2', nome: 'Bloco 2', data: '2026-02-15', horario: '14:00', local: 'Rua B' }
    ],
}));

vi.mock('../services/shareService', () => ({
    getSharedAgenda: vi.fn(),
    getPublicAgenda: vi.fn(),
}));

vi.mock('../hooks/useBlocks', () => ({
    useBlocks: vi.fn(() => ({
        blocks: [
            { id: '1', nome: 'Bloco 1', data: '2026-02-15', horario: '10:00', local: 'Rua A' },
            { id: '2', nome: 'Bloco 2', data: '2026-02-15', horario: '14:00', local: 'Rua B' },
        ],
        loading: false
    }))
}));

vi.mock('framer-motion', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useScroll: () => ({ scrollY: { get: () => 0, onChange: () => { } } }),
        useTransform: (val, input, output) => output[0],
        AnimatePresence: ({ children }) => <>{children}</>,
    };
});

describe('MyAgenda Share Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Default clipboard mock
        Object.assign(navigator, {
            clipboard: {
                writeText: vi.fn().mockResolvedValue(undefined)
            },
            share: undefined
        });
        global.alert = vi.fn();
    });

    it('allows sharing even when agenda is empty', async () => {
        useStore.mockReturnValue({
            favoriteBlocks: [],
            friends: [],
            toggleFavorite: vi.fn(),
            addFriend: vi.fn(),
            removeFriend: vi.fn(),
            syncNow: vi.fn().mockResolvedValue()
        });

        render(
            <MemoryRouter>
                <MyAgenda />
            </MemoryRouter>
        );

        const shareButton = screen.getByText('Compartilhar');
        fireEvent.click(shareButton);

        await waitFor(() => {
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
                expect.stringContaining('uid=user1')
            );
        });

        expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('Link permanente copiado!'));
    });

    it('successfully copies live link', async () => {
        useStore.mockReturnValue({
            favoriteBlocks: [{ id: '1' }],
            friends: [],
            toggleFavorite: vi.fn(),
            addFriend: vi.fn(),
            removeFriend: vi.fn(),
            syncNow: vi.fn().mockResolvedValue()
        });

        render(
            <MemoryRouter>
                <MyAgenda />
            </MemoryRouter>
        );

        const shareButton = screen.getByText('Compartilhar');
        fireEvent.click(shareButton);

        await waitFor(() => {
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
                expect.stringContaining('uid=user1')
            );
        });

        expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('Link permanente copiado!'));
    });
});
