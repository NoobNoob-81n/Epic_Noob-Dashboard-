'use client';
// ════════════════════════════════════════════════════════════════
// /dashboard/[guildId]/autoresponses — Dyno-style trigger/reply list
// with add, edit, and delete.
// ════════════════════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '../../../../lib/api';

export default function AutoResponsesPage() {
    const { guildId } = useParams();
    const [responses, setResponses] = useState(null);
    const [error, setError] = useState(null);
    const [newTrigger, setNewTrigger] = useState('');
    const [newReply, setNewReply] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editTrigger, setEditTrigger] = useState('');
    const [editReply, setEditReply] = useState('');
    const [busy, setBusy] = useState(false);

    const load = async () => {
        try {
            const res = await apiFetch(`/api/guild/${guildId}/autoresponses`);
            setResponses(res.responses);
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => { load(); }, [guildId]);

    const addResponse = async () => {
        if (!newTrigger.trim() || !newReply.trim()) return;
        setBusy(true);
        try {
            await apiFetch(`/api/guild/${guildId}/autoresponses`, {
                method: 'POST',
                body: JSON.stringify({ trigger: newTrigger.trim(), reply: newReply.trim() }),
            });
            setNewTrigger('');
            setNewReply('');
            await load();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const startEdit = (r) => {
        setEditingId(r.id);
        setEditTrigger(r.trigger);
        setEditReply(r.reply);
    };

    const saveEdit = async (id) => {
        setBusy(true);
        try {
            await apiFetch(`/api/guild/${guildId}/autoresponses/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ trigger: editTrigger.trim(), reply: editReply.trim() }),
            });
            setEditingId(null);
            await load();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const deleteResponse = async (id) => {
        setBusy(true);
        try {
            await apiFetch(`/api/guild/${guildId}/autoresponses/${id}`, { method: 'DELETE' });
            await load();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl">
            <h1 className="text-2xl font-semibold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                Auto Responses
            </h1>
            <p className="text-muted mb-6">The bot replies automatically when a message matches a trigger.</p>

            {error && (
                <div className="card p-4 mb-4" style={{ borderColor: 'var(--danger)' }}>
                    <span style={{ color: 'var(--danger)' }}>{error}</span>
                </div>
            )}

            <div className="card p-4 mb-6 space-y-3">
                <div className="text-sm font-medium">New Response</div>
                <input
                    type="text"
                    placeholder="Trigger (e.g. hello)"
                    value={newTrigger}
                    onChange={(e) => setNewTrigger(e.target.value)}
                    className="w-full px-3 py-2 rounded text-sm"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                />
                <input
                    type="text"
                    placeholder="Reply (e.g. Hi there!)"
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    className="w-full px-3 py-2 rounded text-sm"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                />
                <button
                    onClick={addResponse}
                    disabled={busy || !newTrigger.trim() || !newReply.trim()}
                    className="px-4 py-2 rounded text-sm font-medium bg-accent disabled:opacity-50"
                >
                    Add Response
                </button>
            </div>

            {responses === null && !error && <div className="text-muted text-sm">Loading…</div>}
            {responses?.length === 0 && <div className="text-muted text-sm">No auto-responses yet.</div>}

            <div className="space-y-2">
                {responses?.map((r) => (
                    <div key={r.id} className="card p-3">
                        {editingId === r.id ? (
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={editTrigger}
                                    onChange={(e) => setEditTrigger(e.target.value)}
                                    className="w-full px-2 py-1 rounded text-sm"
                                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                                />
                                <input
                                    type="text"
                                    value={editReply}
                                    onChange={(e) => setEditReply(e.target.value)}
                                    className="w-full px-2 py-1 rounded text-sm"
                                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                                />
                                <div className="flex gap-2">
                                    <button onClick={() => saveEdit(r.id)} disabled={busy} className="text-sm px-3 py-1 rounded bg-accent disabled:opacity-50">Save</button>
                                    <button onClick={() => setEditingId(null)} className="text-sm px-3 py-1 rounded text-muted">Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="text-sm font-medium truncate">{r.trigger}</div>
                                    <div className="text-sm text-muted truncate">{r.reply}</div>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <button onClick={() => startEdit(r)} className="text-sm px-3 py-1 rounded" style={{ border: '1px solid var(--border)' }}>Edit</button>
                                    <button
                                        onClick={() => deleteResponse(r.id)}
                                        disabled={busy}
                                        className="text-sm px-3 py-1 rounded disabled:opacity-50"
                                        style={{ color: 'var(--danger)', border: '1px solid var(--danger)' }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
