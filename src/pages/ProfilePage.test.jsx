import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ProfilePage from './ProfilePage';
import useStore from '../store/useStore';

// Mock useStore
vi.mock('../store/useStore', () => ({
    default: vi.fn(() => ({
        favoriteBlocks: [],
        toggleTheme: vi.fn(),
        theme: 'light'
    }))
}));

// Mock Firebase
vi.mock('firebase/auth', () => ({
    getAuth: vi.fn(() => ({ currentUser: { displayName: 'Folião Teste', email: 'teste@email.com' } }))
}));

describe('ProfilePage', () => {
    it('renders the footer with attribution', () => {
        render(
            <BrowserRouter>
                <ProfilePage />
            </BrowserRouter>
        );

        expect(screen.getByText(/Desenvolvido por/i)).toBeInTheDocument();
        expect(screen.getByText('Leo Ruas')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Leo Ruas' })).toHaveAttribute('href', 'https://leoruas.com');
    });
});
