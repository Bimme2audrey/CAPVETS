'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: 'overview' },
  { href: '/admin/orders', label: 'Orders', icon: 'orders' },
  { href: '/admin/media', label: 'Media', icon: 'media' },
  { href: '/admin/receipts', label: 'Receipts', icon: 'receipt' },
  { href: '/admin/settings', label: 'Settings', icon: 'settings' },
];

function Icon({ name }: { name: string }) {
  const cls = "w-[18px] h-[18px] fill-current";
  switch (name) {
    case 'overview':
      return <svg className={cls} viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zM3 21h8v-6H3v6zM13 21h8V11h-8v10zM13 3v6h8V3h-8z" /></svg>;
    case 'orders':
      return <svg className={cls} viewBox="0 0 24 24"><path d="M3 6h18v2H3V6zm2 4h14v10H5V10zM7 14h2v2H7v-2zm4 0h6v2h-6v-2z" /></svg>;
    case 'media':
      return <svg className={cls} viewBox="0 0 24 24"><path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14l4-4 3 3 5-5 5 5z" /></svg>;
    case 'receipt':
      return <svg className={cls} viewBox="0 0 24 24"><path d="M21 6v13a1 1 0 0 1-1 1H6l-4-4V6a1 1 0 0 1 1-1h3V4a2 2 0 1 1 4 0v1h6V4a2 2 0 1 1 4 0v1h1a1 1 0 0 1 1 1zM8 9h8v2H8V9zm0 4h6v2H8v-2z" /></svg>;
    case 'settings':
      return <svg className={cls} viewBox="0 0 24 24"><path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.82 1.18V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06A2 2 0 1 1 4.34 16.96l.06-.06a1.65 1.65 0 0 0-.33-1.82A1.65 1.65 0 0 0 2.56 14H2.5a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 6.54 4.21l.06.06a1.65 1.65 0 0 0 1.82.33H8.5a1.65 1.65 0 0 0 1-1.51V2.5a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V8.5c.36.7 1.08 1.16 1.85 1.16h.06a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;
    case 'logout':
      return <svg className={cls} viewBox="0 0 24 24"><path d="M16 13v-2H7V8l-5 4 5 4v-3zM20 3h-8v2h8v14h-8v2h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" /></svg>;
    case 'open':
      return <svg className={cls} viewBox="0 0 24 24"><path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3zM5 5h5v2H7v10h10v3H5V5z" /></svg>;
    default:
      return null;
  }
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin-login');
    } else {
      setAuthenticated(true);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin-login');
  };

  if (!authenticated) return null;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="p-5 border-b border-gray-700">
          <img src="/logo.png" alt="Logo" className="w-10 h-auto mb-2" />
          <div className="text-sm font-bold text-gray-300">CAPVETS System Admin</div>
        </div>

        <nav className="flex-1 py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                      ${isActive ? 'bg-green-700 text-yellow-400' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
                  >
                    <Icon name={item.icon} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
            <li>
              <a href="/" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200">
                <Icon name="open" />
                Home
              </a>
            </li>
          </ul>
        </nav>

        <div className="p-3 border-t border-gray-700">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-all duration-200 w-full cursor-pointer">
            <Icon name="logout" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
