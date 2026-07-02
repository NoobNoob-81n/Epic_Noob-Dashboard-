// ════════════════════════════════════════════════════════════════
// Small fetch wrapper used by every page/component. Centralizes the
// API base URL and makes sure the session cookie always goes along
// for the ride (credentials: 'include').
// ════════════════════════════════════════════════════════════════
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function apiFetch(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
        ...options,
    });

    if (res.status === 401) {
        if (typeof window !== 'undefined') window.location.href = '/login';
        throw new Error('Not authenticated');
    }

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed: ${res.status}`);
    }

    const text = await res.text();
    return text ? JSON.parse(text) : null;
          }
