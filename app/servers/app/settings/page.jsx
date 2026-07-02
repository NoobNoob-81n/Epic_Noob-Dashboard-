'use client';
// ════════════════════════════════════════════════════════════════
// Settings → Appearance
// Lets the user pick one of the 4 themes. Change applies instantly
// (ThemeProvider updates document.documentElement) and is saved to
// their account in the background.
// ════════════════════════════════════════════════════════════════
import { useTheme } from '../../lib/theme-provider';

const THEME_META = {
    monochrome: {
        label: 'Monochrome',
        desc: 'Dark, high-contrast, one sharp accent.',
        swatch: ['#0a0a0a', '#1a1a1a', '#d4ff4f'],
    },
    discord: {
        label: 'Discord',
        desc: 'Familiar dark navy and blurple.',
        swatch: ['#1e1f22', '#313338', '#5865f2'],
    },
    light: {
        label: 'Light',
        desc: 'Clean and bright for daytime use.',
        swatch: ['#fafafa', '#ffffff', '#4f46e5'],
    },
    neon: {
        label: 'Neon',
        desc: 'Black background, glowing accent — matches the bot.',
        swatch: ['#050507', '#12121a', '#39ff88'],
    },
};

export default function SettingsPage() {
    const { theme, setTheme, themes, loading } = useTheme();

    return (
        <div className="max-w-2xl mx-auto py-10 px-6">
            <h1 className="text-2xl font-semibold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                Appearance
            </h1>
            <p className="text-muted mb-8">Choose how the dashboard looks. Syncs to your account.</p>

            <div className="grid gap-4 sm:grid-cols-3">
                {themes.map((key) => {
                    const meta = THEME_META[key];
                    const active = theme === key;
                    return (
                        <button
                            key={key}
                            onClick={() => setTheme(key)}
                            disabled={loading}
                            className="card text-left p-4 transition-all"
                            style={{
                                borderColor: active ? 'var(--accent)' : 'var(--border)',
                                borderWidth: active ? '2px' : '1px',
                                opacity: loading ? 0.6 : 1,
                                cursor: loading ? 'default' : 'pointer',
                            }}
                        >
                            <div className="flex gap-1.5 mb-3">
                                {meta.swatch.map((c, i) => (
                                    <span
                                        key={i}
                                        className="block w-6 h-6 rounded-full border"
                                        style={{ background: c, borderColor: 'var(--border)' }}
                                    />
                                ))}
                            </div>
                            <div className="font-medium flex items-center gap-2">
                                {meta.label}
                                {active && (
                                    <span className="text-xs px-1.5 py-0.5 rounded bg-accent">Active</span>
                                )}
                            </div>
                            <div className="text-sm text-muted mt-1">{meta.desc}</div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
