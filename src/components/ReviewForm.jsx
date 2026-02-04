// src/components/ReviewForm.jsx
import React, { useState } from 'react';
import { createReview } from '../services/reviewService';
import './ReviewForm.css';

export default function ReviewForm({ block, user, onSuccess }) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [timesAttended, setTimesAttended] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const currentYear = new Date().getFullYear();
    const years = [currentYear, currentYear - 1, currentYear - 2];

    async function handleSubmit(e) {
        e.preventDefault();

        if (rating === 0) {
            setError('Por favor, selecione uma avaliação');
            return;
        }

        setSubmitting(true);
        setError(null);
        setSuccess(false);

        try {
            await createReview({
                blockId: block.id,
                userId: user.uid,
                userName: user.displayName,
                userEmail: user.email,
                rating,
                comment: comment.trim() || null,
                timesAttended
            });

            setSuccess(true);
            // Reset form
            setRating(0);
            setComment('');
            setTimesAttended(null);

            // Call onSuccess after a brief delay
            setTimeout(() => {
                onSuccess();
            }, 1500);
        } catch (err) {
            console.error('Erro ao enviar avaliação:', err);
            setError(err.message || 'Erro ao enviar avaliação. Tente novamente.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form className="review-form" onSubmit={handleSubmit}>
            <h3>Deixe sua avaliação</h3>

            {/* Success message */}
            {success && (
                <div className="success-message">
                    ✓ Avaliação enviada! Aguarde a moderação para publicação.
                </div>
            )}

            {/* Rating de estrelas */}
            <div className="star-rating">
                <label>Sua avaliação:</label>
                <div className="stars">
                    {[1, 2, 3, 4, 5].map(star => (
                        <button
                            key={star}
                            type="button"
                            className={star <= (hoverRating || rating) ? 'filled' : 'empty'}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            aria-label={`${star} estrelas`}
                        >
                            ★
                        </button>
                    ))}
                </div>
            </div>

            {/* Comentário (opcional) */}
            <div className="form-group">
                <label htmlFor="comment">Comentário (opcional):</label>
                <textarea
                    id="comment"
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Compartilhe sua experiência..."
                    maxLength={500}
                    rows={4}
                />
                <small>{comment.length}/500</small>
            </div>

            {/* Pills de frequência (opcional) */}
            <div className="form-group">
                <label>Já foi nesse bloco?</label>
                <div className="pills">
                    {years.map(year => (
                        <button
                            key={year}
                            type="button"
                            className={`pill ${timesAttended === year ? 'active' : ''}`}
                            onClick={() => setTimesAttended(timesAttended === year ? null : year)}
                        >
                            {year}
                        </button>
                    ))}
                </div>
            </div>

            {error && <p className="error">{error}</p>}

            <button type="submit" disabled={submitting || rating === 0} className="submit-btn">
                {submitting ? 'Enviando...' : 'Enviar Avaliação'}
            </button>

            <p className="privacy-note">
                Seu comentário será anônimo e passará por moderação antes de ser publicado.
            </p>
        </form>
    );
}
