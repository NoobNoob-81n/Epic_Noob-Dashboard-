'use client';
// ════════════════════════════════════════════════════════════════
// Layout for every /dashboard/[guildId]/* page. Renders the sidebar
// and wraps children in AuthProvider so every page can read isOwner
// via useAuth() without re-fetching /api/auth/me itself.
// ════════════════════════════════════════════════════════════════
import { useParams } from 'next/navigation';
import Sidebar from '../../../components/Sidebar';
import { AuthProvider, useAuth } from '../../../lib/auth-provider';

function LayoutInner({ children, guildId }) {
    const { isOwner } = useAuth();
    return (
        <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
            <Sidebar guildId={guildId} isOwner={isOwner} />
            <main className="flex-1 min-w-0">{children}</main>
        </div>
    );
}

export default function GuildDashboardLayout({ children }) {
    const { guildId } = useParams();
    return (
        <AuthProvider>
            <LayoutInner guildId={guildId}>{children}</LayoutInner>
        </AuthProvider>
    );
}
