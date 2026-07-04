'use client';
// ════════════════════════════════════════════════════════════════
// /dashboard/[guildId]/events — owner-only live event controls.
// Non-owners see a simple "owner only" notice instead of a 403 flash.
// ════════════════════════════════════════════════════════════════
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '../../../../lib/api';
import { useAuth } from '../../../../lib/auth-provider';

export default function EventsPage() {
    const { guildId } = useParams();
    const { isOwner, loading: authLoading } = useAuth();

    const [channelId, setChannelId] = useState('');
    const [word, setWord] = useState('');
    const [reward, setReward] = useState('');
    const [coins, setCoins] = useState('');
    const [error, setError] = useState(null);
    const [msg, setMsg] = useState(null);
    const [busy, setBusy] = useState(false);
    const [chaosOn, setChaosOn] = useState(false);

    if (authLoading) return <div className="p-8 text-muted text-sm">Loading…</div>;
    if (!isOwner) {
        return (
            <div className="p-8 max-w-2xl">
                <h1 className="text-2xl font-semibold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                    🎮 Events
                </h1>
                <p className="text-muted">Only the bot owner can start or manage events.</p>
            </div>
        );
    }

    const run = async (path, body, successMsg) => {
        setBusy(true);
        setError(null);
        try {
            await apiFetch(`/api/guild/${guildId}/events/${path}`, {
                method: 'POST',
                body: JSON.stringify(body || {}),
            });
            setMsg(successMsg);
            setTimeout(() => setMsg(null), 2500);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const startWordle = () => {
        if (!channelId.trim() || !word.trim()) return setError('Channel ID and word are required');
        run('wordle/start', {
            channelId: channelId.trim(),
            word: word.trim(),
            reward: Number(reward) || 0,
            coins: Number(coins) || 0,
        }, 'Wordle started!');
    };

    const endWordle = () => {
        if (!channelId.trim()) return setError('Channel ID is required to end a wordle');
        run('wordle/end', { channelId: channelId.trim() }, 'Wordle ended.');
    };

    const toggleChaos = async () => {
        const next = !chaosOn;
        await run('chaos-mode', { enabled: next }, `Chaos mode ${next ? 'enabled' : 'disabled'}`);
        setChaosOn(next);
    };

    return (
        <div className="p-8 max-w-2xl">
            <h1 className="text-2xl font-semibold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                🎮 Events
            </h1>
            <p className="text-muted mb-6">Start and manage live events across the server.</p>

            {error && <div className="card p-4 mb-4" style={{ borderColor: 'var(--danger)' }}><span style={{ color: 'var(--danger)' }}>{error}</span></div>}
            {msg && <div className="card p-4 mb-4" style={{ borderColor: 'var(--success)' }}><span style={{ color: 'var(--success)' }}>✓ {msg}</span></div>}

            <div className="card p-5 mb-6 space-y-3">
                <div className="text-sm font-medium mb-1">Wordle</div>
                <input
                    type="text"
                    placeholder="Channel ID"
                    value={channelId}
                    onChange={(e) => setChannelId(e.target.value)}
                    className="w-full px-3 py-2 rounded text-sm"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                />
                <input
                    type="text"
                    placeholder="Word (2-10 letters)"
                    value={word}
                    onChange={(e) => setWord(e.target.value)}
                    className="w-full px-3 py-2 rounded text-sm"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                />
                <div className="flex gap-2">
                    <input
                        type="number"
                        placeholder="Token reward"
                        value={reward}
                        onChange={(e) => setReward(e.target.value)}
                        className="flex-1 px-3 py-2 rounded text-sm"
                        style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    />
                    <input
                        type="number"
                        placeholder="Coin reward"
                        value={coins}
                        onChange={(e) => setCoins(e.target.value)}
                        className="flex-1 px-3 py-2 rounded text-sm"
                        style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    />
                </div>
                <div className="flex gap-2">
                    <button onClick={startWordle} disabled={busy} className="px-4 py-2 rounded text-sm font-medium bg-accent disabled:opacity-50">Start Wordle</button>
                    <button onClick={endWordle} disabled={busy} className="px-4 py-2 rounded text-sm disabled:opacity-50" style={{ color: 'var(--danger)', border: '1px solid var(--danger)' }}>End Wordle</button>
                </div>
            </div>

            <div className="card p-5 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm font-medium">Chaos Mode</div>
                        <div className="text-xs text-muted">Every fish caught gets a random mutation</div>
                    </div>
                    <button
                        onClick={toggleChaos}
                        disabled={busy}
                        className="px-4 py-2 rounded text-sm font-medium disabled:opacity-50"
                        style={{
                            background: chaosOn ? 'var(--accent)' : 'transparent',
                            color: chaosOn ? 'var(--accent-text)' : 'var(--text)',
                            border: '1px solid var(--border)',
                        }}
                    >
                        {chaosOn ? 'Enabled' : 'Disabled'}
                    </button>
                </div>
            </div>

            <div className="card p-5">
                <div className="text-sm font-medium mb-3">Quick Boosts</div>
                <div className="flex gap-2 flex-wrap">
                    <button onClick={() => run('double-xp', {}, 'Double XP activated!')} disabled={busy} className="px-4 py-2 rounded text-sm bg-accent disabled:opacity-50">Double XP</button>
                    <button onClick={() => run('double-coins', {}, 'Double Coins activated!')} disabled={busy} className="px-4 py-2 rounded text-sm bg-accent disabled:opacity-50">Double Coins</button>
                </div>
            </div>
        </div>
    );
      }
