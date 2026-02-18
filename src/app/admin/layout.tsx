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
    case 'menu':
      return <svg className={cls} viewBox="0 0 24 24"><path d="M3 12h18v2H3v-2zm0-6h18v2H3V6zm0 12h18v2H3v-2z" /></svg>;
    case 'chevron-left':
      return <svg className={cls} viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59z" /></svg>;
    case 'chevron-right':
      return <svg className={cls} viewBox="0 0 24 24"><path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12l-4.58 4.59z" /></svg>;
    default:
      return null;
  }
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

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
      <aside className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex flex-col shrink-0 transition-all duration-300 ease-in-out fixed left-0 top-0 h-screen z-10`}>
        {/* Logo Section - Collapsible */}
        <div className="p-4 border-b border-gray-200 flex flex-col items-center relative">
          {/* Collapse Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-2 top-8 bg-white border border-gray-300 rounded-full p-1.5 shadow-sm hover:bg-gray-50 transition-colors z-10"
          >
            <Icon name={isCollapsed ? 'chevron-right' : 'chevron-left'} />
          </button>

          {/* Logo */}
          <div className={`${isCollapsed ? 'w-10 h-10' : 'w-20 h-20'} flex items-center justify-center mb-2 transition-all duration-300`}>
            <img src="/logo.png" alt="CAPVETS Logo" className="w-full h-full object-contain" />
          </div>

          {/* Text - Hidden when collapsed */}
          {!isCollapsed && (
            <>
              <div className="text-lg font-bold text-gray-800 text-center">CAPVETS</div>
              <div className="text-sm text-gray-500 text-center">Admin Dashboard</div>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          <ul className="space-y-3 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                      ${isActive
                        ? 'bg-green-50 text-green-700 border-l-4 border-green-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-l-4 hover:border-green-400'}`}
                    title={isCollapsed ? item.label : ''}
                  >
                    <Icon name={item.icon} />
                    {!isCollapsed && item.label}
                  </Link>
                </li>
              );
            })}
            <li>
              <a
                href="/"
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-l-4 hover:border-blue-400 transition-all duration-200`}
                title={isCollapsed ? 'Visit Site' : ''}
              >
                <Icon name="open" />
                {!isCollapsed && 'Visit Site'}
              </a>
            </li>
          </ul>
        </nav>

        {/* Logout Section */}
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 w-full cursor-pointer`}
            title={isCollapsed ? 'Logout' : ''}
          >
            <Icon name="logout" />
            {!isCollapsed && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 bg-gray-50 p-6 overflow-auto transition-all duration-300 ease-in-out ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        {children}
      </main>
    </div>
  );
}
