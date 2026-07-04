'use client';
// ════════════════════════════════════════════════════════════════
// /dashboard/[guildId]/welcome — configure welcome channel, message,
// and auto-role, with a live preview of the embed.
// ════════════════════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '../../../../lib/api';

export default function WelcomePage() {
    const { guildId } = useParams();
    const [channelId, setChannelId] = useState('');
    const [message, setMessage] = useState('Welcome {user} to the server!');
    const [roleId, setRoleId] = useState('');
    const [enabled, setEnabled] = useState(false);
    const [error, setError] = useState(null);
    const [saved, setSaved] = useState(false);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await apiFetch(`/api/guild/${guildId}/welcome`);
                if (res.config) {
                    setChannelId(res.config.channelId || '');
                    setMessage(res.config.message || 'Welcome {user} to the server!');
                    setRoleId(res.config.roleId || '');
                    setEnabled(true);
                }
            } catch (err) {
                setError(err.message);
            }
        })();
    }, [guildId]);

    const save = async () => {
        if (!channelId.trim()) return setError('Channel ID is required');
        setBusy(true);
        setError(null);
        try {
            await apiFetch(`/api/guild/${guildId}/welcome`, {
                method: 'PUT',
                body: JSON.stringify({ channelId: channelId.trim(), message, roleId: roleId.trim() || null }),
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
            await apiFetch(`/api/guild/${guildId}/welcome`, { method: 'DELETE' });
            setEnabled(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const previewText = message.replace(/{user}/g, '@NewMember');

    return (
        <div className="p-8 max-w-2xl">
            <h1 className="text-2xl font-semibold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                Welcome System
            </h1>
            <p className="text-muted mb-6">Configure the message new members see when they join.</p>

            {error && (
                <div className="card p-4 mb-4" style={{ borderColor: 'var(--danger)' }}>
                    <span style={{ color: 'var(--danger)' }}>{error}</span>
                </div>
            )}

            <div className="card p-5 mb-4 space-y-4">
                <div>
                    <label className="block text-sm text-muted mb-1">Channel ID</label>
                    <input
                        type="text"
                        value={channelId}
                        onChange={(e) => setChannelId(e.target.value)}
                        placeholder="e.g. 123456789012345678"
                        className="w-full px-3 py-2 rounded text-sm"
                        style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    />
                </div>
                <div>
                    <label className="block text-sm text-muted mb-1">Welcome Message (use {'{user}'} for mention)</label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 rounded text-sm"
                        style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    />
                </div>
                <div>
                    <label className="block text-sm text-muted mb-1">Auto-Role ID (optional)</label>
                    <input
                        type="text"
                        value={roleId}
                        onChange={(e) => setRoleId(e.target.value)}
                        placeholder="e.g. 123456789012345678"
                        className="w-full px-3 py-2 rounded text-sm"
                        style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    />
                </div>
            </div>

            <div className="mb-6">
                <div className="text-sm text-muted mb-2">Preview</div>
                <div className="card p-4" style={{ borderLeft: '3px solid var(--accent)' }}>
                    <div className="text-sm">{previewText}</div>
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={save}
                    disabled={busy}
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
