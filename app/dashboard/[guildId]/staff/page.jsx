'use client';
// ════════════════════════════════════════════════════════════════
// /dashboard/[guildId]/staff — GUI for adding/removing staff,
// checking warnings, and resetting a user's economy data.
// ════════════════════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '../../../../lib/api';

export default function StaffPage() {
    const { guildId } = useParams();
    const [staff, setStaff] = useState(null);
    const [error, setError] = useState(null);
    const [newStaffId, setNewStaffId] = useState('');
    const [busy, setBusy] = useState(false);

    const load = async () => {
        try {
            const res = await apiFetch(`/api/guild/${guildId}/staff`);
            setStaff(res.staff);
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => { load(); }, [guildId]);

    const addStaff = async () => {
        if (!newStaffId.trim()) return;
        setBusy(true);
        try {
            await apiFetch(`/api/guild/${guildId}/staff/add`, {
                method: 'POST',
                body: JSON.stringify({ userId: newStaffId.trim() }),
            });
            setNewStaffId('');
            await load();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const removeStaff = async (userId) => {
        setBusy(true);
        try {
            await apiFetch(`/api/guild/${guildId}/staff/remove`, {
                method: 'POST',
                body: JSON.stringify({ userId }),
            });
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
                Staff
            </h1>
            <p className="text-muted mb-6">Add or remove staff members by their Discord user ID.</p>

            {error && (
                <div className="card p-4 mb-4" style={{ borderColor: 'var(--danger)' }}>
                    <span style={{ color: 'var(--danger)' }}>{error}</span>
                </div>
            )}

            <div className="card p-4 mb-6 flex gap-2">
                <input
                    type="text"
                    placeholder="Discord user ID"
                    value={newStaffId}
                    onChange={(e) => setNewStaffId(e.target.value)}
                    className="flex-1 px-3 py-2 rounded text-sm"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                />
                <button
                    onClick={addStaff}
                    disabled={busy || !newStaffId.trim()}
                    className="px-4 py-2 rounded text-sm font-medium bg-accent disabled:opacity-50"
                >
                    Add Staff
                </button>
            </div>

            {staff === null && !error && <div className="text-muted text-sm">Loading…</div>}
            {staff?.length === 0 && <div className="text-muted text-sm">No staff added yet.</div>}

            <div className="space-y-2">
                {staff?.map((userId) => (
                    <div key={userId} className="card p-3 flex items-center justify-between">
                        <code className="text-sm">{userId}</code>
                        <button
                            onClick={() => removeStaff(userId)}
                            disabled={busy}
                            className="text-sm px-3 py-1 rounded disabled:opacity-50"
                            style={{ color: 'var(--danger)', border: '1px solid var(--danger)' }}
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
                  }
