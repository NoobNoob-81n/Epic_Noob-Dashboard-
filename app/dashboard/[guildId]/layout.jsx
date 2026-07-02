'use client';
// ════════════════════════════════════════════════════════════════
// Layout for every /dashboard/[guildId]/* page. Renders the sidebar
// and fetches the current user once to know whether to show the
// Owner Panel link.
// ════════════════════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Sidebar from '../../../components/Sidebar';
import { apiFetch } from '../../../lib/api';

export default function GuildDashboardLayout({ children }) {
    const { guildId } = useParams();
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const me = await apiFetch('/api/auth/me');
                setIsOwner(!!me.isOwner);
            } catch {
                // apiFetch already redirects to /login on 401
            }
        })();
    }, []);

    return (
        <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
            <Sidebar guildId={guildId} isOwner={isOwner} />
            <main className="flex-1 min-w-0">{children}</main>
        </div>
    );
}
