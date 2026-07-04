'use client';
// ════════════════════════════════════════════════════════════════
// AuthProvider — fetches the logged-in user's info ONCE per guild
// layout mount, and shares it (especially isOwner) with every child
// page via context. Avoids every page re-fetching /api/auth/me
// individually.
// ════════════════════════════════════════════════════════════════
import { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch } from './api';

const AuthContext = createContext({ isOwner: false, userId: null, loading: true });

export function AuthProvider({ children }) {
    const [state, setState] = useState({ isOwner: false, userId: null, loading: true });

    useEffect(() => {
        (async () => {
            try {
                const me = await apiFetch('/api/auth/me');
                setState({ isOwner: !!me.isOwner, userId: me.userId, loading: false });
            } catch {
                setState({ isOwner: false, userId: null, loading: false });
            }
        })();
    }, []);

    return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}
