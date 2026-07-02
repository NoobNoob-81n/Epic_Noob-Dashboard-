'use client';
// ════════════════════════════════════════════════════════════════
// 🎨 ThemeProvider
// Wraps the whole app. On mount, fetches the user's saved theme
// from the API and applies it. Exposes setTheme() so the Settings
// page (or anywhere else) can change it — the change is applied
// instantly AND persisted to the account via PATCH /api/me/theme.
// ════════════════════════════════════════════════════════════════
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiFetch } from './api.js';

const THEMES = ['monochrome', 'discord', 'light', 'neon'];
const DEFAULT_THEME = 'monochrome';

const ThemeContext = createContext({
    theme: DEFAULT_THEME,
    setTheme: () => {},
    themes: THEMES,
    loading: true,
});

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(DEFAULT_THEME);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = await apiFetch('/api/me/theme');
                if (!cancelled && data?.theme && THEMES.includes(data.theme)) {
                    setThemeState(data.theme);
                }
            } catch {
                // Not logged in yet, or request failed — stick with default
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const setTheme = useCallback(async (next) => {
        if (!THEMES.includes(next)) return;
        setThemeState(next);
        try {
            await apiFetch('/api/me/theme', {
                method: 'PATCH',
                body: JSON.stringify({ theme: next }),
            });
        } catch (err) {
            console.error('Failed to save theme preference:', err);
        }
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES, loading }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
              }
