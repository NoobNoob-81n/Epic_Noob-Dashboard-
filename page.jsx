'use client';
// ════════════════════════════════════════════════════════════════
// /dashboard/[guildId] — Home. Server icon/name/members, bot
// uptime/latency, matching the original spec.
// ════════════════════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '../../../lib/api';

function formatUptime(seconds) {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
}

export default function GuildHomePage() {
    const { guildId } = useParams();
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await apiFetch(`/api/guild/${guildId}/home`);
                setData(res);
            } catch (err) {
                setError(err.message);
            }
        })();
    }, [guildId]);

    if (error) {
        return <div className="p-8" style={{ color: 'var(--danger)' }}>{error}</div>;
    }

    if (!data) {
        return <div className="p-8 text-muted text-sm">Loading…</div>;
    }

    const { server, bot } = data;

    return (
        <div className="p-8 max-w-4xl">
            <div className="flex items-center gap-4 mb-8">
                {server.icon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={server.icon} alt="" className="w-16 h-16 rounded-full" />
                ) : (
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-medium"
                        style={{ background: 'var(--bg-elevated)' }}
                    >
                        {server.name.slice(0, 2).toUpperCase()}
                    </div>
                )}
                <div>
                    <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                        {server.name}
                    </h1>
                    <p className="text-muted text-sm">{server.memberCount.toLocaleString()} members</p>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Bot Uptime" value={formatUptime(bot.uptimeSeconds)} />
                <StatCard label="Latency" value={`${bot.pingMs}ms`} />
                <StatCard label="Servers" value={bot.guildCount.toLocaleString()} />
            </div>
        </div>
    );
}

function StatCard({ label, value }) {
    return (
        <div className="card p-5">
            <div className="text-sm text-muted mb-1">{label}</div>
            <div className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                {value}
            </div>
        </div>
    );
}
