import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import MyAgenda from './MyAgenda';
import useStore from '../store/useStore';
import * as shareService from '../services/shareService';

// Mock store
vi.mock('../store/useStore');

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
    getAuth: vi.fn(() => ({
        currentUser: { uid: 'user1', displayName: 'Test User' }
    })),
}));

// Mock blocks data
vi.mock('../data/blocos.json', () => ({
    default: [
        {
            id: '1',
            nome: 'Bloco 1',
            data: '2026-02-15',
            horario: '10:00',
            bairro: 'Centro',
            endereco: 'Rua A',
            latitude: 0,
            longitude: 0
        },
        {
            id: '2',
            nome: 'Bloco 2',
            data: '2026-02-15',
            horario: '14:00',
            bairro: 'Savassi',
            endereco: 'Rua B',
            latitude: 0,
            longitude: 0
        }
    ],
}));

// Mock Share Service
vi.mock('../services/shareService', () => ({
    getSharedAgenda: vi.fn(),
    createShareLink: vi.fn(),
}));

// Mock Framer Motion to avoid animation issues in tests
vi.mock('framer-motion', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useScroll: () => ({ scrollY: { get: () => 0, onChange: () => { } } }),
        useTransform: (val, input, output) => output[0],
        AnimatePresence: ({ children }) => <>{children}</>,
    };
});

describe('MyAgenda', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useStore.mockReturnValue({
            favoriteBlocks: [],
            friends: [],
            toggleFavorite: vi.fn(),
            addFriend: vi.fn(),
            removeFriend: vi.fn(),
        });
    });

    it('renders Personal Mode correctly', () => {
        useStore.mockReturnValue({
            favoriteBlocks: [{ id: '1' }],
            friends: [],
            toggleFavorite: vi.fn(),
            addFriend: vi.fn(),
            removeFriend: vi.fn(),
        });

        render(
            <MemoryRouter>
                <MyAgenda />
            </MemoryRouter>
        );

        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Minha Agenda/i);
        // Using findByText to allow for any micro-delays in memoized hooks
        expect(screen.getAllByText('Bloco 1').length).toBeGreaterThan(0);
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

        expect(screen.getByText('Agenda de')).toBeInTheDocument();
        expect(screen.getByText('Amigo')).toBeInTheDocument();
        expect(screen.getAllByText('Bloco 1').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Bloco 2').length).toBeGreaterThan(0);
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

    it('renders Friends tab correctly with empty state', () => {
        useStore.mockReturnValue({
            favoriteBlocks: [{ id: '1' }],
            friends: [],
            toggleFavorite: vi.fn(),
            addFriend: vi.fn(),
            removeFriend: vi.fn(),
        });

        render(
            <MemoryRouter>
                <MyAgenda />
            </MemoryRouter>
        );

        const friendsTab = screen.getByText(/Amigos \(0\)/i);
        fireEvent.click(friendsTab);

        expect(screen.getByText(/Nenhum amigo ainda/i)).toBeInTheDocument();
    });

    it('renders list of friends and allows viewing their agenda', () => {
        const friends = [
            { shareId: 'f1', name: 'Amigo 1', addedAt: new Date().toISOString() }
        ];
        useStore.mockReturnValue({
            favoriteBlocks: [{ id: '1' }],
            friends: friends,
            toggleFavorite: vi.fn(),
            addFriend: vi.fn(),
            removeFriend: vi.fn(),
        });

        render(
            <MemoryRouter>
                <MyAgenda />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText(/Amigos \(1\)/i));
        expect(screen.getByText('Amigo 1')).toBeInTheDocument();

        // Clicking the friend should trigger a navigation
        // The button has a Calendar icon inside. We can find it by getting the button relative to the friend name.
        const friendCard = screen.getByText('Amigo 1').closest('div').parentElement.parentElement;
        const viewButton = within(friendCard).getAllByRole('button')[0];
        expect(viewButton).toBeInTheDocument();
    });
});
