'use client';
// ════════════════════════════════════════════════════════════════
// /dashboard/[guildId]/fishing — owner sees live weather/event/
// multiplier controls; everyone else sees a read-only leaderboard.
// ════════════════════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '../../../../lib/api';
import { useAuth } from '../../../../lib/auth-provider';

export default function FishingPage() {
    const { guildId } = useParams();
    const { isOwner, loading: authLoading } = useAuth();

    if (authLoading) return <div className="p-8 text-muted text-sm">Loading…</div>;
    return isOwner ? <OwnerFishingControls guildId={guildId} /> : <FishingLeaderboard guildId={guildId} />;
}

// ── Staff view: read-only leaderboard ──
function FishingLeaderboard({ guildId }) {
    const [board, setBoard] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await apiFetch(`/api/guild/${guildId}/fishing/leaderboard`);
                setBoard(res.leaderboard);
            } catch (err) {
                setError(err.message);
            }
        })();
    }, [guildId]);

    return (
        <div className="p-8 max-w-2xl">
            <h1 className="text-2xl font-semibold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                🎣 Fishing Leaderboard
            </h1>
            <p className="text-muted mb-6">Top anglers by total fish caught.</p>

            {error && <div className="card p-4 mb-4" style={{ borderColor: 'var(--danger)' }}><span style={{ color: 'var(--danger)' }}>{error}</span></div>}
            {board === null && !error && <div className="text-muted text-sm">Loading…</div>}
            {board?.length === 0 && <div className="text-muted text-sm">No fishing data yet.</div>}

            <div className="space-y-2">
                {board?.map((entry, i) => (
                    <div key={entry.userId} className="card p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-muted w-6">#{i + 1}</span>
                            <code className="text-sm">{entry.userId}</code>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-medium">{entry.total.toLocaleString()} caught</div>
                            {entry.biggestName && (
                                <div className="text-xs text-muted">Biggest: {entry.biggestName} ({entry.biggest}kg)</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Owner view: live controls ──
function OwnerFishingControls({ guildId }) {
    const [status, setStatus] = useState(null);
    const [error, setError] = useState(null);
    const [msg, setMsg] = useState(null);
    const [busy, setBusy] = useState(false);
    const [weatherInput, setWeatherInput] = useState('');

    const load = async () => {
        try {
            const res = await apiFetch(`/api/guild/${guildId}/fishing/status`);
            setStatus(res);
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => { load(); }, [guildId]);

    const setWeather = async () => {
        if (!weatherInput.trim()) return;
        setBusy(true);
        try {
            await apiFetch(`/api/guild/${guildId}/fishing/weather`, {
                method: 'POST',
                body: JSON.stringify({ weather: weatherInput.trim() }),
            });
            setMsg('Weather updated');
            setTimeout(() => setMsg(null), 2000);
            await load();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const setMultiplier = async (type, value) => {
        setBusy(true);
        try {
            await apiFetch(`/api/guild/${guildId}/fishing/multiplier`, {
                method: 'POST',
                body: JSON.stringify({ type, value }),
            });
            setMsg(`${type} multiplier set to ${value}x`);
            setTimeout(() => setMsg(null), 2000);
            await load();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const multiplierFields = [
        { key: 'secret', label: 'Secret' },
        { key: 'legendary', label: 'Legendary' },
        { key: 'mutation', label: 'Mutation' },
        { key: 'xp', label: 'XP' },
        { key: 'coin', label: 'Coin' },
        { key: 'sell', label: 'Sell' },
    ];

    return (
        <div className="p-8 max-w-2xl">
            <h1 className="text-2xl font-semibold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                🎣 Fishing Controls
            </h1>
            <p className="text-muted mb-6">Owner-only: force weather, adjust multipliers.</p>

            {error && <div className="card p-4 mb-4" style={{ borderColor: 'var(--danger)' }}><span style={{ color: 'var(--danger)' }}>{error}</span></div>}
            {msg && <div className="card p-4 mb-4" style={{ borderColor: 'var(--success)' }}><span style={{ color: 'var(--success)' }}>✓ {msg}</span></div>}

            {status && (
                <div className="card p-4 mb-6 text-sm">
                    <div className="text-muted mb-1">Current weather override</div>
                    <div className="font-medium">{status.weatherOverride || 'None'}</div>
                </div>
            )}

            <div className="card p-5 mb-6">
                <label className="block text-sm text-muted mb-2">Force Weather</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={weatherInput}
                        onChange={(e) => setWeatherInput(e.target.value)}
                        placeholder="e.g. storm, sunny, eclipse"
                        className="flex-1 px-3 py-2 rounded text-sm"
                        style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    />
                    <button onClick={setWeather} disabled={busy} className="px-4 py-2 rounded text-sm font-medium bg-accent disabled:opacity-50">Set</button>
                </div>
            </div>

            <div className="card p-5">
                <div className="text-sm text-muted mb-3">Multipliers</div>
                <div className="space-y-3">
                    {multiplierFields.map(({ key, label }) => (
                        <div key={key} className="flex items-center justify-between">
                            <span className="text-sm">{label}</span>
                            <div className="flex gap-2">
                                {[1, 2, 3, 5].map((v) => (
                                    <button
                                        key={v}
                                        onClick={() => setMultiplier(key, v)}
                                        disabled={busy}
                                        className="px-3 py-1 rounded text-xs disabled:opacity-50"
                                        style={{
                                            background: status?.multipliers?.[key] === v ? 'var(--accent)' : 'transparent',
                                            color: status?.multipliers?.[key] === v ? 'var(--accent-text)' : 'var(--text)',
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
            </div>
        </div>
    );
      }
