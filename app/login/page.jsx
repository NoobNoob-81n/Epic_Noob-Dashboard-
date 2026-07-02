'use client';
// ════════════════════════════════════════════════════════════════
// Login page. No form — just kicks off the Discord OAuth2 flow by
// sending the browser to the Express server's /api/auth/login route,
// which redirects to Discord.
// ════════════════════════════════════════════════════════════════
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--bg)' }}>
            <div className="card p-8 max-w-sm w-full text-center">
                <h1 className="text-xl font-semibold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                    Bot Dashboard
                </h1>
                <p className="text-muted mb-6 text-sm">
                    Log in with Discord to manage servers where you have Manage Server permission.
                </p>
                <a
                    href={`${API_BASE}/api/auth/login`}
                    className="block w-full py-2.5 rounded font-medium bg-accent transition-opacity hover:opacity-90"
                >
                    Log in with Discord
                </a>
            </div>
        </div>
    );
}
