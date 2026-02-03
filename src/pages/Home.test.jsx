import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from './Home';
import useStore from '../store/useStore';

// Mock store
vi.mock('../store/useStore');

// Mock blocos data
vi.mock('../data/blocos.json', () => ({
    default: [
        {
            id: 'bloco-1',
            nome: 'Bloco Teste 1',
            data: '2026-03-01',
            horario: '14:00',
            bairro: 'Centro',
            endereco: 'Rua A, 100',
            latitude: -19.92,
            longitude: -43.94,
        },
        {
            id: 'bloco-2',
            nome: 'Bloco Teste 2',
            data: '2026-03-02',
            horario: '16:00',
            bairro: 'Savassi',
            endereco: 'Rua B, 200',
            latitude: -19.93,
            longitude: -43.95,
        },
    ],
}));

describe('Home', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useStore.mockReturnValue({
            toggleFavorite: vi.fn(),
            favoriteBlocks: [],
        });
    });

    it('renders correctly', () => {
        const { container } = render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );
        expect(container).toMatchSnapshot();
    });

    it('uses sticky header instead of fixed', () => {
        const { container } = render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        const header = container.querySelector('header');
        const headerClasses = header?.className || '';
        expect(headerClasses).toContain('sticky');
        expect(headerClasses).not.toContain('fixed');
    });

    it('displays navigation pills', () => {
        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        expect(screen.getByText('Hoje')).toBeInTheDocument();
        expect(screen.getByText('Calendário')).toBeInTheDocument();
        expect(screen.getByText('Favoritos')).toBeInTheDocument();
    });

    it('renders block cards', () => {
        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        expect(screen.getByText('Bloco Teste 1')).toBeInTheDocument();
    });
});
