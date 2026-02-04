import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import BlockCard from './BlockCard';
import useStore from '../store/useStore';

// Mock store
vi.mock('../store/useStore');

// Mock utils
vi.mock('../utils/dateUtils', () => ({
    calculateTimeUntil: vi.fn(() => ({
        days: 2,
        hours: 5,
        minutes: 30,
        seconds: 45,
        totalSeconds: 192645,
        isPast: false,
        isToday: false,
        formatted: '2d 5h 30m',
        shortFormatted: '2d 5h'
    })),
    formatTime: vi.fn((time) => time),
}));

vi.mock('../utils/locationUtils', () => ({
    getCurrentLocation: vi.fn(),
    calculateRoute: vi.fn(),
    estimateUberPrice: vi.fn(),
    getGoogleMapsTransitUrl: vi.fn(),
    getUberDeepLink: vi.fn(),
    getUberWebUrl: vi.fn(),
}));

const mockBlock = {
    id: 'test-block-1',
    nome: 'Bloco Teste',
    data: '2026-03-01',
    horario: '14:00',
    bairro: 'Centro',
    endereco: 'Rua Teste, 123',
    latitude: -19.9167,
    longitude: -43.9345,
    observacoes: 'Bloco de teste',
};

describe('BlockCard', () => {
    const mockToggleFavorite = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        useStore.mockReturnValue({
            toggleFavorite: mockToggleFavorite,
            favoriteBlocks: [],
        });
    });

    it('renders correctly', () => {
        const { container } = render(
            <BrowserRouter>
                <BlockCard block={mockBlock} />
            </BrowserRouter>
        );
        expect(container).toMatchSnapshot();
    });

    it('displays block information', () => {
        render(
            <BrowserRouter>
                <BlockCard block={mockBlock} />
            </BrowserRouter>
        );

        expect(screen.getByText('Bloco Teste')).toBeInTheDocument();
        expect(screen.getByText('Centro')).toBeInTheDocument();
        expect(screen.getByText('Rua Teste, 123')).toBeInTheDocument();
    });

    it('shows red heart when favorited', () => {
        useStore.mockReturnValue({
            toggleFavorite: mockToggleFavorite,
            favoriteBlocks: [{ id: 'test-block-1' }],
        });

        const { container } = render(
            <BrowserRouter>
                <BlockCard block={mockBlock} />
            </BrowserRouter>
        );

        const heartButton = container.querySelector('button');
        const heartClasses = heartButton?.className || '';
        expect(heartClasses).toContain('bg-red-500/10');

        const heartIcon = heartButton.querySelector('svg');
        const iconClasses = heartIcon?.getAttribute('class') || '';
        expect(iconClasses).toContain('fill-red-500');
        expect(iconClasses).toContain('text-red-500');
    });

    it('shows default heart when not favorited', () => {
        const { container } = render(
            <BrowserRouter>
                <BlockCard block={mockBlock} />
            </BrowserRouter>
        );

        const heartButton = container.querySelector('button');
        const heartClasses = heartButton?.className || '';
        expect(heartClasses).toContain('bg-muted/50');

        const heartIcon = heartButton.querySelector('svg');
        const iconClasses = heartIcon?.getAttribute('class') || '';
        expect(iconClasses).toContain('text-muted-foreground');
        expect(iconClasses).not.toContain('fill-red-500');
    });

    it('toggles favorite when heart is clicked', () => {
        render(
            <BrowserRouter>
                <BlockCard block={mockBlock} />
            </BrowserRouter>
        );

        const heartButton = screen.getAllByRole('button')[0];
        fireEvent.click(heartButton);

        expect(mockToggleFavorite).toHaveBeenCalledWith('test-block-1');
    });

    it('displays countdown with "Falta: " prefix', () => {
        render(
            <BrowserRouter>
                <BlockCard block={mockBlock} />
            </BrowserRouter>
        );

        expect(screen.getByText(/Falta: 2d 5h 30m/i)).toBeInTheDocument();
    });

    it('copies address to clipboard when clicked', async () => {
        const writeTextMock = vi.fn();
        Object.assign(navigator, {
            clipboard: {
                writeText: writeTextMock,
            },
        });

        render(
            <BrowserRouter>
                <BlockCard block={mockBlock} />
            </BrowserRouter>
        );

        const addressButton = screen.getByText('Rua Teste, 123').closest('button');
        fireEvent.click(addressButton);

        expect(writeTextMock).toHaveBeenCalledWith('Rua Teste, 123, Centro');
    });
    it('shows friends who are also going', () => {
        const mockFriendsAgendas = {
            'friend-1': {
                ownerId: 'friend-1',
                ownerName: 'Amigo 1',
                blocks: [{ id: 'test-block-1' }]
            },
            'friend-2': {
                ownerId: 'friend-2',
                ownerName: 'Bia',
                blocks: [{ id: 'other-block' }]
            }
        };

        const { container } = render(
            <BrowserRouter>
                <BlockCard block={mockBlock} friendsAgendas={mockFriendsAgendas} />
            </BrowserRouter>
        );

        // Should find "A" for "Amigo 1"
        expect(screen.getByText('A')).toBeInTheDocument();
        expect(screen.getByTitle('Amigo 1')).toBeInTheDocument();

        // Should NOT find "B" for "Bia" (different block)
        expect(screen.queryByTitle('Bia')).not.toBeInTheDocument();
    });
});

