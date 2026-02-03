import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
            data: '2026-02-15', // Same date for easier testing
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

// Mock Scroll (Framer Motion)
vi.mock('framer-motion', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useScroll: () => ({ scrollY: { get: () => 0, onChange: () => { } } }),
        useTransform: () => 0,
    };
});

describe('MyAgenda', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders Personal Mode correctly', () => {
        useStore.mockReturnValue({
            favoriteBlocks: [{ id: '1' }],
            toggleFavorite: vi.fn(),
        });

        render(
            <MemoryRouter>
                <MyAgenda />
            </MemoryRouter>
        );

        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Minha Agenda/i);
        expect(screen.getAllByText('Bloco 1').length).toBeGreaterThan(0);
    });

    it('renders Shared Mode when shareId is present', async () => {
        useStore.mockReturnValue({
            favoriteBlocks: [], // I have no favorites
            toggleFavorite: vi.fn(),
        });

        shareService.getSharedAgenda.mockResolvedValue({
            ownerName: 'Amigo',
            blocks: ['1', '2'] // Shared agenda has both blocks
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
            favoriteBlocks: [{ id: '1' }], // I have Bloco 1
            toggleFavorite: vi.fn(),
        });

        shareService.getSharedAgenda.mockResolvedValue({
            ownerName: 'Crush',
            blocks: ['1', '2'] // They have 1 and 2
        });

        render(
            <MemoryRouter initialEntries={['/agenda?shareId=xyz']}>
                <MyAgenda />
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText('Crush')).toBeInTheDocument());

        // "1 em comum"
        expect(screen.getByText(/1 em comum/i)).toBeInTheDocument();

        // "Adicionar 1 novos" (since 2 is new to me)
        expect(screen.getByText(/Adicionar 1 novos/i)).toBeInTheDocument();
    });

    it('handles adding blocks from Shared View', async () => {
        const toggleFavoriteMock = vi.fn();
        useStore.mockReturnValue({
            favoriteBlocks: [],
            toggleFavorite: toggleFavoriteMock,
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

        // Find "Adicionar" button on the card (Bloco 2)
        // Since styling puts "Adicionar" text visually, we look for it.
        // There is also a global "Adicionar X novos" button.
        const addAllButton = screen.getByText(/Adicionar 1 novos/i);
        fireEvent.click(addAllButton);

        // Should trigger toggleFavorite for '2'
        // Wait for potential async if any (handleAddAll is synchronous but good to be safe)
        expect(toggleFavoriteMock).toHaveBeenCalledWith('2');
    });
});
