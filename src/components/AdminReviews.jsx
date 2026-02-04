// src/components/AdminReviews.jsx
import React, { useState, useEffect } from 'react';
import {
    getPendingReviews,
    getRejectedReviews,
    approveReview,
    rejectReview
} from '../services/reviewService';
import './AdminReviews.css';

export default function AdminReviews({ user }) {
    const [pendingReviews, setPendingReviews] = useState([]);
    const [rejectedReviews, setRejectedReviews] = useState([]);
    const [activeTab, setActiveTab] = useState('pending');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadReviews();
    }, []);

    async function loadReviews() {
        setLoading(true);
        setError(null);

        try {
            const [pending, rejected] = await Promise.all([
                getPendingReviews(),
                getRejectedReviews()
            ]);

            setPendingReviews(pending);
            setRejectedReviews(rejected);
        } catch (err) {
            console.error('Error loading reviews:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleApprove(review) {
        try {
            await approveReview(review.id, user.uid, review.blockId);
            await loadReviews();
            alert('Avaliação aprovada!');
        } catch (error) {
            console.error('Error approving:', error);
            alert('Erro ao aprovar avaliação');
        }
    }

    async function handleReject(reviewId) {
        const reason = prompt('Motivo da rejeição (opcional):');
        if (reason === null) return; // cancelled

        try {
            await rejectReview(reviewId, user.uid, reason);
            await loadReviews();
            alert('Avaliação rejeitada');
        } catch (error) {
            console.error('Error rejecting:', error);
            alert('Erro ao rejeitar avaliação');
        }
    }

    const reviews = activeTab === 'pending' ? pendingReviews : rejectedReviews;

    return (
        <div className="admin-reviews">
            <div className="reviews-header">
                <h2>Moderação de Avaliações</h2>
            </div>

            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pending')}
                >
                    Pendentes ({pendingReviews.length})
                </button>
                <button
                    className={`tab ${activeTab === 'rejected' ? 'active' : ''}`}
                    onClick={() => setActiveTab('rejected')}
                >
                    Rejeitados ({rejectedReviews.length})
                </button>
            </div>

            <div className="reviews-content">
                {error && (
                    <div style={{ color: '#ef4444', padding: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
                        <strong>Erro:</strong> {error}
                    </div>
                )}

                {loading ? (
                    <p className="loading">Carregando...</p>
                ) : reviews.length === 0 ? (
                    <p className="empty-state">
                        Nenhum comentário {activeTab === 'pending' ? 'pendente' : 'rejeitado'}
                    </p>
                ) : (
                    <div className="reviews-queue">
                        {reviews.map(review => (
                            <div key={review.id} className="review-card">
                                <div className="review-meta">
                                    <div className="rating-stars">
                                        {'★'.repeat(review.rating)}
                                        {'☆'.repeat(5 - review.rating)}
                                    </div>
                                    <span className="review-date">
                                        {review.createdAt?.toDate ?
                                            new Date(review.createdAt.toDate()).toLocaleDateString('pt-BR', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })
                                            : 'Recém enviado'
                                        }
                                    </span>
                                </div>

                                <div className="user-info">
                                    <strong>{review.userName || 'Anônimo'}</strong>
                                    <span className="email">{review.userEmail}</span>
                                </div>

                                {review.comment && (
                                    <p className="comment">{review.comment}</p>
                                )}

                                {review.timesAttended && (
                                    <span className="attendance-pill">
                                        Foi em {review.timesAttended}
                                    </span>
                                )}

                                {review.blockId && (
                                    <span className="block-id-label">
                                        ID do Bloco: {review.blockId}
                                    </span>
                                )}

                                {activeTab === 'pending' && (
                                    <div className="actions">
                                        <button
                                            className="approve-btn"
                                            onClick={() => handleApprove(review)}
                                        >
                                            ✓ Aprovar
                                        </button>
                                        <button
                                            className="reject-btn"
                                            onClick={() => handleReject(review.id)}
                                        >
                                            ✕ Rejeitar
                                        </button>
                                    </div>
                                )}

                                {review.moderationReason && (
                                    <div className="moderation-reason">
                                        <strong>Motivo:</strong> {review.moderationReason}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
