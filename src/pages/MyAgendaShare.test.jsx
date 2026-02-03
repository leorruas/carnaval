import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import MyAgenda from './MyAgenda';
import useStore from '../store/useStore';
import * as shareService from '../services/shareService';

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
    createShareLink: vi.fn(),
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

// --- TESTS ---
describe('MyAgenda Sharing & Shared Mode', () => {
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

    it('renders Shared Mode when shareId is present', async () => {
        useStore.mockReturnValue({
            favoriteBlocks: [],
            friends: [],
            toggleFavorite: vi.fn(),
            addFriend: vi.fn(),
            removeFriend: vi.fn(),
        });

        shareService.getSharedAgenda.mockResolvedValue({
            ownerName: 'Amigo',
            blocks: ['1', '2']
        });

        render(
            <MemoryRouter initialEntries={['/agenda?shareId=share-123']}>
                <Routes>
                    <Route path="/agenda" element={<MyAgenda />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(shareService.getSharedAgenda).toHaveBeenCalledWith('share-123');
        });

        await waitFor(() => {
            expect(screen.getByText('Agenda de')).toBeInTheDocument();
            expect(screen.getByText('Amigo')).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getAllByText('Bloco 1').length).toBeGreaterThan(0);
        });
    });

    it('calculates matches correctly in Shared Mode', async () => {
        useStore.mockReturnValue({
            favoriteBlocks: [{ id: '1' }],
            friends: [],
            toggleFavorite: vi.fn(),
            addFriend: vi.fn(),
            removeFriend: vi.fn(),
        });

        shareService.getSharedAgenda.mockResolvedValue({
            ownerName: 'Crush',
            blocks: ['1', '2']
        });

        render(
            <MemoryRouter initialEntries={['/agenda?shareId=xyz']}>
                <MyAgenda />
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText('Crush')).toBeInTheDocument());
        expect(screen.getByText(/1 em comum/i)).toBeInTheDocument();
        expect(screen.getByText(/Adicionar 1 novos/i)).toBeInTheDocument();
    });

    it('handles adding blocks from Shared View', async () => {
        const toggleFavoriteMock = vi.fn();
        useStore.mockReturnValue({
            favoriteBlocks: [],
            friends: [],
            toggleFavorite: toggleFavoriteMock,
            addFriend: vi.fn(),
            removeFriend: vi.fn(),
        });

        shareService.getSharedAgenda.mockResolvedValue({
            ownerName: 'Alegria',
            blocks: ['2']
        });

        render(
            <MemoryRouter initialEntries={['/agenda?shareId=abc']}>
                <MyAgenda />
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText('Alegria')).toBeInTheDocument());
        const addAllButton = screen.getByText(/Adicionar 1 novos/i);
        fireEvent.click(addAllButton);

        expect(toggleFavoriteMock).toHaveBeenCalledWith('2');
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

    it('renders Live Link Agenda correctly using uid', async () => {
        useStore.mockReturnValue({
            favoriteBlocks: [],
            friends: [],
            toggleFavorite: vi.fn(),
        });

        // Mock getPublicAgenda for Live Link
        shareService.getPublicAgenda.mockResolvedValue({
            ownerName: 'Live User',
            blocks: ['1', '2']
        });

        render(
            <MemoryRouter initialEntries={['/agenda?uid=live-user-123']}>
                <Routes>
                    <Route path="/agenda" element={<MyAgenda />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(shareService.getPublicAgenda).toHaveBeenCalledWith('live-user-123');
        });

        await waitFor(() => {
            expect(screen.getByText('Agenda de')).toBeInTheDocument();
            expect(screen.getByText('Live User')).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getAllByText('Bloco 1').length).toBeGreaterThan(0);
        });
    });
});
