'use client';
// ════════════════════════════════════════════════════════════════
// /dashboard/[guildId]/logs — set the mod-log channel using a
// dropdown populated from the server's actual text channels.
// ════════════════════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '../../../../lib/api';

export default function LogsPage() {
    const { guildId } = useParams();
    const [channels, setChannels] = useState([]);
    const [selected, setSelected] = useState('');
    const [enabled, setEnabled] = useState(false);
    const [error, setError] = useState(null);
    const [saved, setSaved] = useState(false);
    const [busy, setBusy] = useState(false);

    
    useEffect(() => {
        (async () => {
            try {
                const cfgRes = await apiFetch(`/api/guild/${guildId}/logs`);
                const chRes = await apiFetch(`/api/guild/${guildId}/logs/channels`);
                setChannels(chRes.channels);
                if (cfgRes.config) {
                    setSelected(cfgRes.config.channelId);
                    setEnabled(true);
                }
            } catch (err) {
                setError(err.message);
            }
        })();
    }, [guildId]);
        
    const save = async () => {
        if (!selected) return;
        setBusy(true);
        setError(null);
        try {
            await apiFetch(`/api/guild/${guildId}/logs`, {
                method: 'PUT',
                body: JSON.stringify({ channelId: selected }),
            });
            setEnabled(true);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const disable = async () => {
        setBusy(true);
        try {
            await apiFetch(`/api/guild/${guildId}/logs`, { method: 'DELETE' });
            setEnabled(false);
            setSelected('');
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl">
            <h1 className="text-2xl font-semibold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                Mod Logs
            </h1>
            <p className="text-muted mb-6">Choose which channel receives moderation log messages.</p>

            {error && (
                <div className="card p-4 mb-4" style={{ borderColor: 'var(--danger)' }}>
                    <span style={{ color: 'var(--danger)' }}>{error}</span>
                </div>
            )}

            <div className="card p-5 mb-6">
                <label className="block text-sm text-muted mb-1">Log Channel</label>
                <select
                    value={selected}
                    onChange={(e) => setSelected(e.target.value)}
                    className="w-full px-3 py-2 rounded text-sm"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                >
                    <option value="">Select a channel…</option>
                    {channels.map((c) => (
                        <option key={c.id} value={c.id}>#{c.name}</option>
                    ))}
                </select>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={save}
                    disabled={busy || !selected}
                    className="px-4 py-2 rounded text-sm font-medium bg-accent disabled:opacity-50"
                >
                    {saved ? '✓ Saved' : 'Save'}
                </button>
                {enabled && (
                    <button
                        onClick={disable}
                        disabled={busy}
                        className="px-4 py-2 rounded text-sm disabled:opacity-50"
                        style={{ color: 'var(--danger)', border: '1px solid var(--danger)' }}
                    >
                        Disable
                    </button>
                )}
            </div>
        </div>
    );
          }
