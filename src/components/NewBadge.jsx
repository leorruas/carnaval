// src/components/NewBadge.jsx
import React from 'react';
import './NewBadge.css';

export default function NewBadge({ block }) {
    // Verificar se badge ainda é válido
    if (!block.isUserSuggested || !block.newBadgeUntil) {
        return null;
    }

    const now = new Date();
    const expiration = block.newBadgeUntil.toDate();

    if (now > expiration) {
        return null;
    }

    return (
        <span className="badge-new" title="Bloco sugerido pela comunidade">
            🆕 NOVO
        </span>
    );
}
