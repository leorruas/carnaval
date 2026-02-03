import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MyAgenda from './MyAgenda';
import useStore from '../store/useStore';

// Mock store
vi.mock('../store/useStore');

// Mock blocos data
vi.mock('../data/blocos.json', () => ({
    default: [
        {
            id: 'fav-1',
            nome: 'Bloco Favorito 1',
            data: '2026-03-01',
            horario: '14:00',
            bairro: 'Centro',
            endereco: 'Rua A, 100',
            latitude: -19.92,
            longitude: -43.94,
        },
        {
            id: 'fav-2',
            nome: 'Bloco Favorito 2',
            data: '2026-03-02',
            horario: '16:00',
            bairro: 'Savassi',
            endereco: 'Rua B, 200',
            latitude: -19.93,
            longitude: -43.95,
        },
    ],
}));

describe('MyAgenda', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly with favorites', () => {
        useStore.mockReturnValue({
            favoriteBlocks: [{ id: 'fav-1' }, { id: 'fav-2' }],
        });

        const { container } = render(
            <BrowserRouter>
                <MyAgenda />
            </BrowserRouter>
        );
        expect(container).toMatchSnapshot();
    });

    it('shows empty state when no favorites', () => {
        useStore.mockReturnValue({
            favoriteBlocks: [],
        });

        render(
            <BrowserRouter>
                <MyAgenda />
            </BrowserRouter>
        );

        expect(screen.getByText('Agenda Vazia')).toBeInTheDocument();
        expect(screen.getByText(/Favorite blocos para montar sua agenda/i)).toBeInTheDocument();
        expect(screen.getByText('Explorar blocos')).toBeInTheDocument();
    });

    it('uses sticky header', () => {
        useStore.mockReturnValue({
            favoriteBlocks: [{ id: 'fav-1' }],
        });

        const { container } = render(
            <BrowserRouter>
                <MyAgenda />
            </BrowserRouter>
        );

        const header = container.querySelector('header');
        const headerClasses = header?.className || '';
        expect(headerClasses).toContain('sticky');
    });

    it('displays favorite blocks count', () => {
        useStore.mockReturnValue({
            favoriteBlocks: [{ id: 'fav-1' }, { id: 'fav-2' }],
        });

        render(
            <BrowserRouter>
                <MyAgenda />
            </BrowserRouter>
        );

        expect(screen.getByText(/2 blocos/i)).toBeInTheDocument();
    });

    it('shows next block section when there is an upcoming event', () => {
        useStore.mockReturnValue({
            favoriteBlocks: [{ id: 'fav-1' }],
        });

        // Mock current date to be before the event
        vi.setSystemTime(new Date('2026-02-01'));

        render(
            <BrowserRouter>
                <MyAgenda />
            </BrowserRouter>
        );

        expect(screen.getByText('Próximo Bloco')).toBeInTheDocument();
        const blockNames = screen.getAllByText('Bloco Favorito 1');
        expect(blockNames.length).toBeGreaterThanOrEqual(1);

        vi.useRealTimers();
    });

    it('renders share and export buttons with tabbar style', () => {
        useStore.mockReturnValue({
            favoriteBlocks: [{ id: 'fav-1' }],
        });

        const { container } = render(
            <BrowserRouter>
                <MyAgenda />
            </BrowserRouter>
        );

        const shareButton = screen.getByText('Compartilhar').closest('button');
        const exportButton = screen.getByText('Exportar').closest('button');

        const shareClasses = shareButton?.className || '';
        const exportClasses = exportButton?.className || '';

        expect(shareClasses).toContain('bg-muted/30');
        expect(shareClasses).toContain('hover:bg-primary/10');
        expect(exportClasses).toContain('bg-muted/30');
        expect(exportClasses).toContain('hover:bg-primary/10');
    });

    it('displays favorited blocks in the list', () => {
        useStore.mockReturnValue({
            favoriteBlocks: [{ id: 'fav-1' }, { id: 'fav-2' }],
        });

        render(
            <BrowserRouter>
                <MyAgenda />
            </BrowserRouter>
        );

        const block1 = screen.getAllByText('Bloco Favorito 1');
        const block2 = screen.getAllByText('Bloco Favorito 2');

        expect(block1.length).toBeGreaterThanOrEqual(1);
        expect(block2.length).toBeGreaterThanOrEqual(1);
    });
});
