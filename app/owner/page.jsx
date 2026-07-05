'use client';
// ════════════════════════════════════════════════════════════════
// /owner — global owner-only panel. Not guild-scoped, matches the
// backend's /api/owner mounting. Guards itself client-side via
// useAuth(), but the real security is server-side (requireOwner).
// ════════════════════════════════════════════════════════════════
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '../../lib/api';
import { AuthProvider, useAuth } from '../../lib/auth-provider';

function OwnerPanelInner() {
    const { isOwner, loading: authLoading } = useAuth();
    const [abuse, setAbuse] = useState(null);
    const [summary, setSummary] = useState(null);
    const [error, setError] = useState(null);
    const [msg, setMsg] = useState(null);
    const [busy, setBusy] = useState(false);
    const fileInputRef = useRef(null);

    const load = async () => {
        try {
            const abuseRes = await apiFetch('/api/owner/abuse');
            const summaryRes = await apiFetch('/api/owner/database/summary');
            setAbuse(abuseRes.abuseConfig);
            setSummary(summaryRes);
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        if (isOwner) load();
    }, [isOwner]);

    if (authLoading) return <div className="p-8 text-muted text-sm">Loading…</div>;
    if (!isOwner) {
        return (
            <div className="p-8 max-w-2xl">
                <h1 className="text-2xl font-semibold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                    🛠️ Owner Panel
                </h1>
                <p className="text-muted">Only the bot owner can access this page.</p>
            </div>
        );
    }

    const setMultiplier = async (field, value) => {
        setBusy(true);
        try {
            await apiFetch('/api/owner/abuse/multiplier', {
                method: 'POST',
                body: JSON.stringify({ field, value }),
            });
            setMsg(`${field} set to ${value}x`);
            setTimeout(() => setMsg(null), 2000);
            await load();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const resetAbuse = async () => {
        setBusy(true);
        try {
            await apiFetch('/api/owner/abuse/reset', { method: 'POST' });
            setMsg('All abuse settings reset to normal');
            setTimeout(() => setMsg(null), 2500);
            await load();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const downloadBackup = () => {
        // Direct navigation so the browser handles the file download
        // (Content-Disposition header) rather than fetch-then-blob.
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        window.open(`${API_BASE}/api/owner/backup`, '_blank');
    };

    const restoreBackup = async (file) => {
        setBusy(true);
        setError(null);
        try {
            const text = await file.text();
            const json = JSON.parse(text);
            await apiFetch('/api/owner/restore', {
                method: 'POST',
                body: JSON.stringify(json),
            });
            setMsg('Backup restored successfully');
            setTimeout(() => setMsg(null), 2500);
            await load();
        } catch (err) {
            setError(err.message.includes('JSON') ? 'That file is not valid JSON' : err.message);
        } finally {
            setBusy(false);
        }
    };

    const multiplierFields = [
        { key: 'secretMult', label: 'Secret' },
        { key: 'legendaryMult', label: 'Legendary' },
        { key: 'mutationMult', label: 'Mutation' },
        { key: 'xpMult', label: 'XP' },
        { key: 'coinMult', label: 'Coin' },
        { key: 'sellMult', label: 'Sell' },
    ];

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <Link href="/servers" className="text-sm text-muted hover:text-accent transition-colors mb-4 inline-block">
                ← Back to servers
            </Link>
            <h1 className="text-2xl font-semibold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                🛠️ Owner Panel
            </h1>
            <p className="text-muted mb-6">Global controls, visible only to you.</p>

            {error && <div className="card p-4 mb-4" style={{ borderColor: 'var(--danger)' }}><span style={{ color: 'var(--danger)' }}>{error}</span></div>}
            {msg && <div className="card p-4 mb-4" style={{ borderColor: 'var(--success)' }}><span style={{ color: 'var(--success)' }}>✓ {msg}</span></div>}

            {/* Admin Abuse */}
            <div className="card p-5 mb-6">
                <div className="text-sm font-medium mb-3">Admin Abuse Multipliers</div>
                <div className="space-y-3">
                    {multiplierFields.map(({ key, label }) => (
                        <div key={key} className="flex items-center justify-between">
                            <span className="text-sm">{label}</span>
                            <div className="flex gap-2">
                                {[1, 2, 3, 5, 10].map((v) => (
                                    <button
                                        key={v}
                                        onClick={() => setMultiplier(key, v)}
                                        disabled={busy}
                                        className="px-3 py-1 rounded text-xs disabled:opacity-50"
                                        style={{
                                            background: abuse?.[key] === v ? 'var(--accent)' : 'transparent',
                                            color: abuse?.[key] === v ? 'var(--accent-text)' : 'var(--text)',
                                            border: '1px solid var(--border)',
                                        }}
                                    >
                                        {v}x
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <button
                    onClick={resetAbuse}
                    disabled={busy}
                    className="mt-4 px-4 py-2 rounded text-sm disabled:opacity-50"
                    style={{ color: 'var(--danger)', border: '1px solid var(--danger)' }}
                >
                    Reset All to Normal
                </button>
            </div>

            {/* Database summary */}
            <div className="card p-5 mb-6">
                <div className="text-sm font-medium mb-3">Database Summary</div>
                {summary ? (
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><span className="text-muted">Users:</span> {summary.userCount}</div>
                        <div><span className="text-muted">Staff:</span> {summary.staffCount}</div>
                        <div><span className="text-muted">Active wordles:</span> {summary.wordleGamesActive}</div>
                        <div><span className="text-muted">Servers w/ logs:</span> {summary.guildsWithLogs}</div>
                        <div><span className="text-muted">Servers w/ welcome:</span> {summary.guildsWithWelcome}</div>
                        <div><span className="text-muted">Servers w/ tickets:</span> {summary.guildsWithTickets}</div>
                    </div>
                ) : (
                    <div className="text-muted text-sm">Loading…</div>
                )}
            </div>

            {/* Backup / restore */}
            <div className="card p-5">
                <div className="text-sm font-medium mb-3">Backup</div>
                <div className="flex gap-3 flex-wrap">
                    <button onClick={downloadBackup} className="px-4 py-2 rounded text-sm font-medium bg-accent">
                        Download Backup
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={busy}
                        className="px-4 py-2 rounded text-sm disabled:opacity-50"
                        style={{ border: '1px solid var(--border)' }}
                    >
                        Restore Backup
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && restoreBackup(e.target.files[0])}
                    />
                </div>
                <p className="text-xs text-muted mt-2">
                    Restoring replaces all current bot data with the uploaded backup. This cannot be undone.
                </p>
            </div>
        </div>
    );
}

export default function OwnerPanelPage() {
    return (
        <AuthProvider>
            <OwnerPanelInner />
        </AuthProvider>
    );
}
