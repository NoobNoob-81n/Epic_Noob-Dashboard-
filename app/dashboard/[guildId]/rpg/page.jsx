'use client';
// ════════════════════════════════════════════════════════════════
// /dashboard/[guildId]/rpg — read-only leaderboards, visible to
// staff and owner alike (no live controls exist for RPG systems).
// ════════════════════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '../../../../lib/api';

export default function RpgPage() {
    const { guildId } = useParams();
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await apiFetch(`/api/guild/${guildId}/rpg/leaderboard`);
                setData(res);
            } catch (err) {
                setError(err.message);
            }
        })();
    }, [guildId]);

    return (
        <div className="p-8 max-w-2xl">
            <h1 className="text-2xl font-semibold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                ⚔️ RPG Leaderboards
            </h1>
            <p className="text-muted mb-6">Dungeon clears, PvP wins, and top guilds.</p>

            {error && <div className="card p-4 mb-4" style={{ borderColor: 'var(--danger)' }}><span style={{ color: 'var(--danger)' }}>{error}</span></div>}
            {data === null && !error && <div className="text-muted text-sm">Loading…</div>}

            {data && (
                <>
                    <Section title="🏰 Dungeon Clears" empty="No dungeon clears recorded yet.">
                        {data.dungeonClears.map((e, i) => (
                            <Row key={e.userId} rank={i + 1} id={e.userId} value={`${e.clears} clears`} />
                        ))}
                    </Section>

                    <Section title="🗡️ PvP Wins" empty="No PvP wins recorded yet.">
                        {data.pvpWins.map((e, i) => (
                            <Row key={e.userId} rank={i + 1} id={e.userId} value={`${e.wins} wins`} />
                        ))}
                    </Section>

                    <Section title="🏛️ Top Guilds" empty="No guilds created yet.">
                        {data.guilds.map((g, i) => (
                            <div key={g.guildId} className="card p-3 flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-muted w-6">#{i + 1}</span>
                                    <div>
                                        <div className="text-sm font-medium">{g.name}</div>
                                        <div className="text-xs text-muted">{g.memberCount} members · Level {g.level}</div>
                                    </div>
                                </div>
                                <span className="text-sm font-medium">{g.xp.toLocaleString()} XP</span>
                            </div>
                        ))}
                    </Section>
                </>
            )}
        </div>
    );
}

function Section({ title, empty, children }) {
    const hasContent = Array.isArray(children) ? children.length > 0 : !!children;
    return (
        <div className="mb-8">
            <div className="text-lg font-medium mb-3">{title}</div>
            {!hasContent && <div className="text-muted text-sm">{empty}</div>}
            <div className="space-y-2">{children}</div>
        </div>
    );
}

function Row({ rank, id, value }) {
    return (
        <div className="card p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <span className="text-sm text-muted w-6">#{rank}</span>
                <code className="text-sm">{id}</code>
            </div>
            <span className="text-sm font-medium">{value}</span>
        </div>
    );
}
