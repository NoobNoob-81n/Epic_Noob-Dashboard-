'use client';
// ════════════════════════════════════════════════════════════════
// /dashboard/[guildId]/general — edit the server's command prefix.
// ════════════════════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '../../../../lib/api';

export default function GeneralPage() {
    const { guildId } = useParams();
    const [prefix, setPrefix] = useState('!');
    const [error, setError] = useState(null);
    const [saved, setSaved] = useState(false);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await apiFetch(`/api/guild/${guildId}/general`);
                setPrefix(res.prefix);
            } catch (err) {
                setError(err.message);
            }
        })();
    }, [guildId]);

    const save = async () => {
        if (!prefix.trim()) return setError('Prefix cannot be empty');
        setBusy(true);
        setError(null);
        try {
            await apiFetch(`/api/guild/${guildId}/general/prefix`, {
                method: 'PUT',
                body: JSON.stringify({ prefix: prefix.trim() }),
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl">
            <h1 className="text-2xl font-semibold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                General
            </h1>
            <p className="text-muted mb-6">Basic server-wide bot settings.</p>

            {error && (
                <div className="card p-4 mb-4" style={{ borderColor: 'var(--danger)' }}>
                    <span style={{ color: 'var(--danger)' }}>{error}</span>
                </div>
            )}

            <div className="card p-5 mb-4">
                <label className="block text-sm text-muted mb-1">Command Prefix</label>
                <p className="text-xs text-muted mb-2">Used for text commands like {prefix}balance. Max 5 characters.</p>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={prefix}
                        maxLength={5}
                        onChange={(e) => setPrefix(e.target.value)}
                        className="w-32 px-3 py-2 rounded text-sm"
                        style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    />
                    <button
                        onClick={save}
                        disabled={busy}
                        className="px-4 py-2 rounded text-sm font-medium bg-accent disabled:opacity-50"
                    >
                        {saved ? '✓ Saved' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
              }
