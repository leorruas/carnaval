import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoginModal from './LoginModal';

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
    getAuth: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    updateProfile: vi.fn(),
}));

// Mock Framer Motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className }) => <div className={className}>{children}</div>,
    },
    AnimatePresence: ({ children }) => <>{children}</>,
}));

describe('LoginModal', () => {
    it('renders correctly when open', () => {
        render(<LoginModal isOpen={true} onClose={() => { }} />);
        expect(screen.getByRole('heading', { name: 'Fazer Login' })).toBeInTheDocument();
        expect(screen.getByPlaceholderText('exemplo@email.com')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
        render(<LoginModal isOpen={false} onClose={() => { }} />);
        expect(screen.queryByText('Fazer Login')).not.toBeInTheDocument();
    });

    it('switches to registration mode', () => {
        render(<LoginModal isOpen={true} onClose={() => { }} />);

        const toggleButton = screen.getByText('Não tem conta? Cadastre-se');
        fireEvent.click(toggleButton);

        expect(screen.getByRole('heading', { name: 'Criar Conta' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Criar Conta' })).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Seu nome ou apelido')).toBeInTheDocument();
    });

    it('opens Terms Modal when link is clicked', async () => {
        render(<LoginModal isOpen={true} onClose={() => { }} />);

        // Find the terms button/link (it might be split across lines, so we look for part of it)
        const termsLink = screen.getByText(/Política de Privacidade/i);
        fireEvent.click(termsLink);

        // After clicking, TermsModal should appear (which initially has "Termos de Uso" header)
        // Note: TermsModal is rendered inside LoginModal, and we just toggle visibility
        expect(screen.getByText('Privacidade e Segurança')).toBeInTheDocument();
    });

    it('displays privacy disclaimer', () => {
        render(<LoginModal isOpen={true} onClose={() => { }} />);
        expect(screen.getByText(/Não coletamos dados para fins comerciais/i)).toBeInTheDocument();
    });
});
