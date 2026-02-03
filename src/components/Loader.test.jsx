import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Loader from './Loader';

describe('Loader', () => {
    it('renders without crashing', () => {
        render(<Loader />);
        const loaderContainer = document.querySelector('.fixed');
        expect(loaderContainer).toBeInTheDocument();
        expect(loaderContainer).toHaveClass('backdrop-blur-xl');
    });

    it('matches snapshot', () => {
        const { container } = render(<Loader />);
        expect(container).toMatchSnapshot();
    });
});
