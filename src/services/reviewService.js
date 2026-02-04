// src/services/reviewService.js

import {
    collection,
    query,
    where,
    getDocs,
    doc,
    updateDoc,
    addDoc,
    serverTimestamp,
    orderBy
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Calcula estatísticas agregadas de reviews para um bloco
 */
export async function calculateBlockStats(blockId) {
    try {
        const reviewsQuery = query(
            collection(db, 'reviews'),
            where('blockId', '==', blockId),
            where('status', '==', 'approved')
        );

        const snapshot = await getDocs(reviewsQuery);

        if (snapshot.empty) {
            return {
                avgRating: null,
                totalReviews: 0,
                ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
            };
        }

        let totalRating = 0;
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

        snapshot.forEach(doc => {
            const rating = Number(doc.data().rating) || 0;
            totalRating += rating;
            distribution[rating] = (distribution[rating] || 0) + 1;
        });

        const totalReviews = snapshot.size;
        const avgRating = Math.round((totalRating / totalReviews) * 10) / 10;

        return { avgRating, totalReviews, ratingDistribution: distribution };
    } catch (error) {
        console.error('Error in calculateBlockStats:', error);
        return { avgRating: null, totalReviews: 0, ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
    }
}

/**
 * Atualiza as estatísticas de um bloco na coleção approved_blocks
 */
export async function updateBlockStats(blockId) {
    const stats = await calculateBlockStats(blockId);

    await updateDoc(doc(db, 'approved_blocks', blockId), {
        avgRating: stats.avgRating,
        totalReviews: stats.totalReviews,
        ratingDistribution: stats.ratingDistribution
    });

    return stats;
}

/**
 * Busca reviews aprovados de um bloco com fallback para queries sem índice
 */
export async function getApprovedReviews(blockId) {
    try {
        const reviewsQuery = query(
            collection(db, 'reviews'),
            where('blockId', '==', blockId),
            where('status', '==', 'approved'),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(reviewsQuery);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        // Fallback para quando o índice está sendo construído ou falha
        const simpleQuery = query(
            collection(db, 'reviews'),
            where('blockId', '==', blockId),
            where('status', '==', 'approved')
        );
        const snapshot = await getDocs(simpleQuery);
        const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return reviews.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    }
}

/**
 * Verifica se usuário já avaliou o bloco
 */
export async function hasUserReviewed(userId, blockId) {
    try {
        const reviewsQuery = query(
            collection(db, 'reviews'),
            where('userId', '==', userId),
            where('blockId', '==', blockId)
        );
        const snapshot = await getDocs(reviewsQuery);
        return !snapshot.empty;
    } catch (error) {
        console.error('Error in hasUserReviewed:', error);
        return false;
    }
}

/**
 * Cria uma nova review. 
 * Se não houver comentário, o status é 'approved' (visível na hora).
 * Se houver comentário, o status é 'pending' (vai para moderação).
 */
export async function createReview({ blockId, userId, userName, userEmail, rating, comment, timesAttended }) {
    const alreadyReviewed = await hasUserReviewed(userId, blockId);
    if (alreadyReviewed) {
        throw new Error('Você já avaliou este bloco');
    }

    const trimmedComment = comment?.trim() || null;
    const isAutoApproved = !trimmedComment;

    const reviewData = {
        blockId,
        userId,
        userName: userName || 'Anônimo',
        userEmail: userEmail || '',
        rating: Number(rating),
        comment: trimmedComment,
        timesAttended: timesAttended || null,
        status: isAutoApproved ? 'approved' : 'pending',
        createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'reviews'), reviewData);

    // Se foi auto-aprovado, já atualiza as stats do bloco
    if (isAutoApproved) {
        try {
            await updateBlockStats(blockId);
        } catch (e) {
            console.error('Failed to update block stats after auto-approval:', e);
        }
    }

    return docRef.id;
}

/**
 * Busca reviews pendentes para moderação (manual sort fallback)
 */
export async function getPendingReviews() {
    try {
        const reviewsQuery = query(
            collection(db, 'reviews'),
            where('status', '==', 'pending')
        );
        const snapshot = await getDocs(reviewsQuery);
        const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return reviews.sort((a, b) => {
            const timeA = a.createdAt?.seconds || a.createdAt?._seconds || 0;
            const timeB = b.createdAt?.seconds || b.createdAt?._seconds || 0;
            return timeB - timeA;
        });
    } catch (error) {
        console.error('Error in getPendingReviews:', error);
        throw error;
    }
}

/**
 * Busca reviews rejeitados (manual sort fallback)
 */
export async function getRejectedReviews() {
    try {
        const reviewsQuery = query(
            collection(db, 'reviews'),
            where('status', '==', 'rejected')
        );
        const snapshot = await getDocs(reviewsQuery);
        const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return reviews.sort((a, b) => {
            const timeA = a.createdAt?.seconds || a.createdAt?._seconds || 0;
            const timeB = b.createdAt?.seconds || b.createdAt?._seconds || 0;
            return timeB - timeA;
        });
    } catch (error) {
        console.error('Error in getRejectedReviews:', error);
        throw error;
    }
}

/**
 * Aprova uma review e atualiza estatísticas do bloco
 */
export async function approveReview(reviewId, moderatorId, blockId) {
    await updateDoc(doc(db, 'reviews', reviewId), {
        status: 'approved',
        moderatedAt: serverTimestamp(),
        moderatorId
    });

    try {
        await updateBlockStats(blockId);
    } catch (e) {
        console.error('Failed to update block stats after approval:', e);
    }
}

/**
 * Rejeita uma review com motivo opcional
 */
export async function rejectReview(reviewId, moderatorId, reason) {
    await updateDoc(doc(db, 'reviews', reviewId), {
        status: 'rejected',
        moderatedAt: serverTimestamp(),
        moderatorId,
        moderationReason: reason || 'Rejeitado pelo moderador'
    });
}
