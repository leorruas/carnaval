import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MyAgenda from './MyAgenda';
import useStore from '../store/useStore';

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
    getSharedAgenda: vi.fn().mockResolvedValue({ id: 'f1', ownerName: 'Amigo 1', blocks: [] }),
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
describe('MyAgenda Personal Mode', () => {
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

    it('renders Personal Mode correctly', { timeout: 10000 }, () => {
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
        expect(screen.getAllByText('Bloco 1').length).toBeGreaterThan(0);
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

    it('renders list of friends and allows viewing their agenda', async () => {
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

        // Clicking the friend should trigger a navigation (simulated by checking if view callback is available logic)
        // Here we just check if buttons are present
        const friendCard = screen.getByText('Amigo 1').closest('div').parentElement.parentElement;
        const viewButton = within(friendCard).getAllByRole('button')[0];
        expect(viewButton).toBeInTheDocument();

        // Simular clique para ver agenda
        fireEvent.click(viewButton);

        // Verificar se mudou para a view da agenda (deve renderizar AgendaMyView)
        // O efeito é async, então precisamos esperar
        await waitFor(() => {
            expect(screen.getByText(/Agenda de/i)).toBeInTheDocument();
            expect(screen.getByText('Amigo 1')).toBeInTheDocument();
        });

        // E NÃO deve mais mostrar a lista de amigos (FriendsList)
        expect(screen.queryByLabelText('Remover amigo')).not.toBeInTheDocument();
    });
});
