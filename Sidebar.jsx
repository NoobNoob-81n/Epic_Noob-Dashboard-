'use client';
// ════════════════════════════════════════════════════════════════
// Sidebar — shown on every /dashboard/[guildId]/* page. Links are
// relative to the current guild so switching servers just means
// visiting a different guildId in the URL.
// ════════════════════════════════════════════════════════════════
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_SECTIONS = [
    {
        label: 'Server',
        items: [
            { href: '', label: 'Home', icon: '🏠' },
            { href: '/general', label: 'General', icon: '⚙️' },
            { href: '/staff', label: 'Staff', icon: '👮' },
            { href: '/welcome', label: 'Welcome', icon: '👋' },
            { href: '/logs', label: 'Logs', icon: '📋' },
            { href: '/tickets', label: 'Tickets', icon: '🎫' },
            { href: '/autoresponses', label: 'Auto Responses', icon: '💬' },
        ],
    },
    {
        label: 'Game Systems',
        items: [
            { href: '/economy', label: 'Economy', icon: '💰' },
            { href: '/fishing', label: 'Fishing', icon: '🎣' },
            { href: '/rpg', label: 'RPG', icon: '⚔️' },
            { href: '/events', label: 'Events', icon: '🎮' },
        ],
    },
];

export default function Sidebar({ guildId, isOwner }) {
    const pathname = usePathname();
    const base = `/dashboard/${guildId}`;

    return (
        <nav
            className="w-60 shrink-0 h-screen sticky top-0 flex flex-col py-6 px-3 border-r"
            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
        >
            <Link href="/servers" className="px-3 mb-6 text-sm text-muted hover:text-accent transition-colors">
                ← All servers
            </Link>

            {NAV_SECTIONS.map((section) => (
                <div key={section.label} className="mb-5">
                    <div className="px-3 mb-1.5 text-xs uppercase tracking-wide text-muted">
                        {section.label}
                    </div>
                    {section.items.map((item) => {
                        const href = `${base}${item.href}`;
                        const active = pathname === href;
                        return (
                            <Link
                                key={item.href}
                                href={href}
                                className="flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors"
                                style={{
                                    background: active ? 'var(--accent)' : 'transparent',
                                    color: active ? 'var(--accent-text)' : 'var(--text)',
                                }}
                            >
                                <span>{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            ))}

            {isOwner && (
                <div className="mb-5">
                    <div className="px-3 mb-1.5 text-xs uppercase tracking-wide text-muted">Owner</div>
                    <Link
                        href="/owner"
                        className="flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors"
                        style={{
                            background: pathname === '/owner' ? 'var(--accent)' : 'transparent',
                            color: pathname === '/owner' ? 'var(--accent-text)' : 'var(--danger)',
                        }}
                    >
                        <span>🛠️</span>
                        Owner Panel
                    </Link>
                </div>
            )}

            <div className="mt-auto">
                <Link
                    href="/settings"
                    className="flex items-center gap-2.5 px-3 py-2 rounded text-sm text-muted hover:text-accent transition-colors"
                >
                    <span>🎨</span>
                    Settings
                </Link>
            </div>
        </nav>
    );
}
