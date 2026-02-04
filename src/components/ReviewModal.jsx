// src/components/ReviewModal.jsx
import React, { useState, useEffect } from 'react';
import { getApprovedReviews, hasUserReviewed } from '../services/reviewService';
import ReviewForm from './ReviewForm';
import './ReviewModal.css';

export default function ReviewModal({ block, user, onClose }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userAlreadyReviewed, setUserAlreadyReviewed] = useState(false);

    useEffect(() => {
        loadReviews();
    }, [block.id, user]);

    async function loadReviews() {
        try {
            const reviewsList = await getApprovedReviews(block.id);
            setReviews(reviewsList);

            if (user) {
                const alreadyReviewed = await hasUserReviewed(user.uid, block.id);
                setUserAlreadyReviewed(alreadyReviewed);
            }
        } catch (error) {
            console.error('Erro ao carregar reviews:', error);
        } finally {
            setLoading(false);
        }
    }

    function handleSuccess() {
        loadReviews();
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content review-modal" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>{block.name}</h2>
                    <button className="close-btn" onClick={onClose} aria-label="Fechar">
                        ✕
                    </button>
                </header>

                <div className="modal-body">
                    {/* Distribuição de estrelas */}
                    {block.ratingDistribution && block.totalReviews > 0 && (
                        <div className="rating-distribution">
                            <h3>Distribuição de avaliações</h3>
                            {[5, 4, 3, 2, 1].map(star => {
                                const count = block.ratingDistribution[star] || 0;
                                const percentage = block.totalReviews > 0
                                    ? (count / block.totalReviews) * 100
                                    : 0;

                                return (
                                    <div key={star} className="rating-bar">
                                        <span className="star-label">{star}★</span>
                                        <div className="bar">
                                            <div
                                                className="fill"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <span className="count">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Form de avaliação (se não avaliou ainda) */}
                    {!userAlreadyReviewed && user && (
                        <ReviewForm
                            block={block}
                            user={user}
                            onSuccess={handleSuccess}
                        />
                    )}

                    {userAlreadyReviewed && (
                        <div className="already-reviewed">
                            <p>✓ Você já avaliou este bloco</p>
                        </div>
                    )}

                    {!user && (
                        <div className="login-required">
                            <p>Faça login para deixar sua avaliação</p>
                        </div>
                    )}

                    {/* Lista de comentários */}
                    <div className="reviews-list">
                        <h3>Comentários ({reviews.filter(r => r.comment).length})</h3>
                        {loading ? (
                            <p className="loading">Carregando...</p>
                        ) : reviews.filter(r => r.comment).length === 0 ? (
                            <p className="empty-state">Nenhum comentário ainda. Seja o primeiro!</p>
                        ) : (
                            <div className="reviews-container">
                                {reviews
                                    .filter(r => r.comment)
                                    .map(review => (
                                        <div key={review.id} className="review-item">
                                            <div className="review-header">
                                                <span className="stars">{'★'.repeat(review.rating)}</span>
                                                {review.timesAttended && (
                                                    <span className="attendance-badge">
                                                        Foi em {review.timesAttended}
                                                    </span>
                                                )}
                                                <time className="review-date">
                                                    {new Date(review.createdAt.toDate()).toLocaleDateString('pt-BR')}
                                                </time>
                                            </div>
                                            <p className="review-comment">{review.comment}</p>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
