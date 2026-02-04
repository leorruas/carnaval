// src/components/BlockRating.jsx
import React from 'react';
import './BlockRating.css';

export default function BlockRating({ avgRating, totalReviews, onClick }) {
    if (!avgRating || totalReviews === 0) {
        return (
            <button className="block-rating empty" onClick={onClick} type="button">
                <span className="stars">☆☆☆☆☆</span>
            </button>
        );
    }

    const fullStars = Math.floor(avgRating);
    const hasHalfStar = avgRating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <button className="block-rating" onClick={onClick} type="button">
            <span className="stars" aria-label={`${avgRating} estrelas`}>
                {'★'.repeat(fullStars)}
                {hasHalfStar && '⯨'}
                {'☆'.repeat(emptyStars)}
            </span>
            <span className="rating-text">
                {avgRating.toFixed(1)} ({totalReviews})
            </span>
        </button>
    );
}
