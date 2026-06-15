'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Inicio', icon: '🏠', exact: true },
  { href: '/dashboard/noticias', label: 'Noticias', icon: '📰' },
  { href: '/dashboard/categorias', label: 'Categorias', icon: '🏷️' },
  { href: '/dashboard/usuarios', label: 'Usuarios', icon: '👥' },
  { href: '/dashboard/ajustes', label: 'Ajustes', icon: '⚙️' },
];

function NavItem({ href, label, icon, exact }: { href: string; label: string; icon: string; exact?: boolean }) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);
  return (
    <Link href={href} className={'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ' + (active ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700')}>
      <span>{icon}</span>{label}
    </Link>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; role?: string } | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/signin'); return; }
    try {
      const u = localStorage.getItem('user');
      if (u) setUser(JSON.parse(u));
    } catch {}
  }, [router]);

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/signin');
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      {open && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setOpen(false)} />}

      <aside className={'fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ' + (open ? 'translate-x-0' : '-translate-x-full')}>
        <div className="p-6 border-b dark:border-gray-700">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">D</div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-sm">diario info</p>
              <p className="text-xs text-gray-500">Panel</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => <NavItem key={item.href} {...item} />)}
        </nav>
        <div className="p-4 border-t dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name || 'Usuario'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.role || ''}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full text-left text-sm text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50">Cerrar sesion</button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-gray-800 shadow-sm px-4 py-3 flex items-center gap-4 lg:hidden">
          <button onClick={() => setOpen(true)} className="text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <span className="font-semibold text-gray-900 dark:text-white">Panel</span>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}