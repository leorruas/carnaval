import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BlockCard from './BlockCard';

const mockBlock = {
    id: 1,
    nome: 'Bloco Teste',
    horario: '10:00',
    data: '2026-02-28',
    endereco: 'Rua Teste, 123',
    bairro: 'Centro',
    latitude: -19.92,
    longitude: -43.94,
};

describe('BlockCard', () => {
    it('renders block information correctly', () => {
        render(<BlockCard block={mockBlock} />);

        expect(screen.getByText('Bloco Teste')).toBeInTheDocument();
        expect(screen.getByText('10:00')).toBeInTheDocument();
        expect(screen.getByText('Rua Teste, 123')).toBeInTheDocument();
    });

    it('shows countdown if event is in the future', () => {
        // Mock date to be before the event
        vi.setSystemTime(new Date('2026-02-01'));

        render(<BlockCard block={mockBlock} />);
        expect(screen.getByText(/Faltam:/i)).toBeInTheDocument();

        vi.useRealTimers();
    });
});
