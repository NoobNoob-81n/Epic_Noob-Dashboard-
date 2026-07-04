'use client';
// ════════════════════════════════════════════════════════════════
// /dashboard/[guildId]/economy — give/remove coins, view richest
// users, reset a user's economy data.
// ════════════════════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '../../../../lib/api';

export default function EconomyPage() {
    const { guildId } = useParams();
    const [richest, setRichest] = useState(null);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState(null);
    const [busy, setBusy] = useState(false);

    const [targetUser, setTargetUser] = useState('');
    const [amount, setAmount] = useState('');

    const load = async () => {
        try {
            const res = await apiFetch(`/api/guild/${guildId}/economy/richest`);
            setRichest(res.richest);
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => { load(); }, [guildId]);

    const runAction = async (endpoint, body, successMsg) => {
        if (!targetUser.trim()) return setError('Enter a user ID first');
        setBusy(true);
        setError(null);
        try {
            await apiFetch(`/api/guild/${guildId}/economy/${endpoint}`, {
                method: 'POST',
                body: JSON.stringify(body),
            });
            setStatus(successMsg);
            setTimeout(() => setStatus(null), 2500);
            await load();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const give = () => runAction('give', { userId: targetUser.trim(), amount: Number(amount) || 0 }, `Gave coins to ${targetUser.trim()}`);
    const remove = () => runAction('remove', { userId: targetUser.trim(), amount: Number(amount) || 0 }, `Removed coins from ${targetUser.trim()}`);
    const reset = () => runAction('reset', { userId: targetUser.trim() }, `Reset economy data for ${targetUser.trim()}`);

    return (
        <div className="p-8 max-w-2xl">
            <h1 className="text-2xl font-semibold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                Economy
            </h1>
            <p className="text-muted mb-6">Manage coins for individual users, or reset their data entirely.</p>

            {error && (
                <div className="card p-4 mb-4" style={{ borderColor: 'var(--danger)' }}>
                    <span style={{ color: 'var(--danger)' }}>{error}</span>
                </div>
            )}
            {status && (
                <div className="card p-4 mb-4" style={{ borderColor: 'var(--success)' }}>
                    <span style={{ color: 'var(--success)' }}>✓ {status}</span>
                </div>
            )}

            <div className="card p-5 mb-6 space-y-3">
                <div>
                    <label className="block text-sm text-muted mb-1">User ID</label>
                    <input
                        type="text"
                        value={targetUser}
                        onChange={(e) => setTargetUser(e.target.value)}
                        placeholder="Discord user ID"
                        className="w-full px-3 py-2 rounded text-sm"
                        style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    />
                </div>
                <div>
                    <label className="block text-sm text-muted mb-1">Amount</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="e.g. 1000"
                        className="w-full px-3 py-2 rounded text-sm"
                        style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <button onClick={give} disabled={busy} className="px-4 py-2 rounded text-sm font-medium bg-accent disabled:opacity-50">Give Coins</button>
                    <button onClick={remove} disabled={busy} className="px-4 py-2 rounded text-sm disabled:opacity-50" style={{ border: '1px solid var(--border)' }}>Remove Coins</button>
                    <button onClick={reset} disabled={busy} className="px-4 py-2 rounded text-sm disabled:opacity-50" style={{ color: 'var(--danger)', border: '1px solid var(--danger)' }}>Reset User</button>
                </div>
            </div>

            <div className="text-lg font-medium mb-3">🏆 Richest Users</div>
            {richest === null && !error && <div className="text-muted text-sm">Loading…</div>}
            {richest?.length === 0 && <div className="text-muted text-sm">No economy data yet.</div>}
            <div className="space-y-2">
                {richest?.map((entry, i) => (
                    <div key={entry.userId} className="card p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-muted w-6">#{i + 1}</span>
                            <code className="text-sm">{entry.userId}</code>
                        </div>
                        <span className="text-sm font-medium">{entry.coins.toLocaleString()} coins</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
