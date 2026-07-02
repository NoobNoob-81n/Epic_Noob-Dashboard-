'use client';
// ════════════════════════════════════════════════════════════════
// /servers — shown right after login. Lists every server where the
// user has Manage Server AND the bot is present. Clicking one goes
// to /dashboard/[guildId].
// ════════════════════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '../../lib/api';

export default function ServerPickerPage() {
    const [guilds, setGuilds] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const data = await apiFetch('/api/guilds');
                setGuilds(data.guilds);
            } catch (err) {
                setError(err.message);
            }
        })();
    }, []);

    return (
        <div className="min-h-screen px-6 py-12" style={{ background: 'var(--bg)' }}>
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-semibold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                    Select a server
                </h1>
                <p className="text-muted mb-8">
                    Showing servers where you have Manage Server permission and the bot is present.
                </p>

                {error && (
                    <div className="card p-4 mb-4" style={{ borderColor: 'var(--danger)' }}>
                        <span style={{ color: 'var(--danger)' }}>{error}</span>
                    </div>
                )}

                {guilds === null && !error && (
                    <div className="text-muted text-sm">Loading your servers…</div>
                )}

                {guilds?.length === 0 && (
                    <div className="card p-8 text-center text-muted">
                        No manageable servers found. Make sure the bot is in a server
                        where you have Manage Server permission.
                    </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                    {guilds?.map((g) => (
                        <Link
                            key={g.id}
                            href={`/dashboard/${g.id}`}
                            className="card p-4 flex items-center gap-3 transition-transform hover:-translate-y-0.5"
                        >
                            {g.icon ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={g.icon} alt="" className="w-12 h-12 rounded-full" />
                            ) : (
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium"
                                    style={{ background: 'var(--bg-elevated)' }}
                                >
                                    {g.name.slice(0, 2).toUpperCase()}
                                </div>
                            )}
                            <div className="min-w-0">
                                <div className="font-medium truncate">{g.name}</div>
                                {g.memberCount != null && (
                                    <div className="text-sm text-muted">{g.memberCount.toLocaleString()} members</div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
