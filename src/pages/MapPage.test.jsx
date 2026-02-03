import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MapPage from './MapPage';
import { useBlocks } from '../hooks/useBlocks';

// Mock Leaflet
vi.mock('react-leaflet', () => ({
    MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
    TileLayer: () => <div data-testid="tile-layer" />,
    Marker: ({ children }) => <div data-testid="marker">{children}</div>,
    Popup: ({ children }) => <div data-testid="popup">{children}</div>,
    useMap: () => ({
        flyTo: vi.fn(),
    }),
}));

// Mock hooks
vi.mock('../hooks/useBlocks');
vi.mock('../utils/dateUtils', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        // Keep actual logic for grouping if possible, or mock it if complex dependencies
        // simpler to just use actual as it's pure logic
    };
});

// Mock Geolocation
const mockGeolocation = {
    getCurrentPosition: vi.fn().mockImplementation((success) =>
        success({ coords: { latitude: -19.9, longitude: -43.9 } })
    ),
};
global.navigator.geolocation = mockGeolocation;

describe('MapPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useBlocks.mockReturnValue({
            blocks: [
                { id: '1', nome: 'Bloco A', data: '2026-02-14', latitude: '-19.9', longitude: '-43.9', horario: '10:00' },
                { id: '2', nome: 'Bloco B', data: '2026-02-15', latitude: '-19.9', longitude: '-43.9', horario: '11:00' }
            ],
            loading: false
        });
    });

    it('renders the map page title', () => {
        render(<MapPage />);
        expect(screen.getByText(/Mapa de/i)).toBeInTheDocument();
        expect(screen.getByText(/Blocos/i)).toBeInTheDocument();
    });

    it('renders the map container', () => {
        render(<MapPage />);
        expect(screen.getByTestId('map-container')).toBeInTheDocument();
    });

    it('renders date selection buttons', () => {
        render(<MapPage />);
        // Should check for date format. "14" and "15" should appear
        expect(screen.getByText('14')).toBeInTheDocument();
        expect(screen.getByText('15')).toBeInTheDocument();
    });

    it('renders focus button', () => {
        render(<MapPage />);
        const button = screen.getByTitle(/Focar na minha localização/i);
        expect(button).toBeInTheDocument();
    });
});
