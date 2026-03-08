'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const navItems = [
  { href: '/stock-manager', label: 'Dashboard', icon: 'overview' },
  { href: '/stock-manager/comprehensive-stock', label: 'Stock Tracking', icon: 'stock' },
  { href: '/stock-manager/transactions', label: 'Transactions', icon: 'transactions' },
  { href: '/stock-manager/expenses', label: 'Expenses', icon: 'expenses' },
  { href: '/stock-manager/reports', label: 'Reports', icon: 'reports' },
];

function Icon({ name }: { name: string }) {
  const cls = "w-[18px] h-[18px] fill-current";
  switch (name) {
    case 'overview':
      return <svg className={cls} viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zM3 21h8v-6H3v6zM13 21h8V11h-8v10zM13 3v6h8V3h-8z" /></svg>;
    case 'transactions':
      return <svg className={cls} viewBox="0 0 24 24"><path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" /></svg>;
    case 'expenses':
      return <svg className={cls} viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1.81.45 1.61 1.67 1.61 1.16 0 1.6-.64 1.6-1.46 0-.84-.68-1.22-1.88-1.56-1.85-.49-3.34-1.32-3.34-3.16 0-1.67 1.19-2.85 2.96-3.21V4h2.67v1.95c1.86.45 2.51 1.84 2.56 2.81h-1.96c-.05-.64-.41-1.46-1.53-1.46-1.07 0-1.5.57-1.5 1.28 0 .73.56 1.09 1.84 1.44 1.95.52 3.37 1.25 3.37 3.29 0 1.82-1.22 3.07-3.01 3.47z" /></svg>;
    case 'stock':
      return <svg className={cls} viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" /></svg>;
    case 'reports':
      return <svg className={cls} viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" /></svg>;
    case 'logout':
      return <svg className={cls} viewBox="0 0 24 24"><path d="M16 13v-2H7V8l-5 4 5 4v-3zM20 3h-8v2h8v14h-8v2h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" /></svg>;
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

export default function StockManagerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('stockToken');
    const userData = localStorage.getItem('stockUser');

    if (!token) {
      router.push('/stock-login');
    } else {
      setAuthenticated(true);
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('stockToken');
    localStorage.removeItem('stockUser');
    router.push('/stock-login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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
            <div className="w-full h-full bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
              </svg>
            </div>
          </div>

          {/* Text - Hidden when collapsed */}
          {!isCollapsed && (
            <>
              <div className="text-lg font-bold text-gray-800 text-center">Stock Manager</div>
              <div className="text-sm text-gray-500 text-center">CAPVETS Inventory</div>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          <ul className="space-y-3 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/stock-manager' && pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                      ${isActive
                        ? 'bg-green-50 text-green-700 border-l-4 border-green-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-l-4 hover:border-green-400'}`}
                    title={isCollapsed ? item.label : ''}
                  >
                    <Icon name={item.icon} />
                    {!isCollapsed && item.label}
                  </a>
                </li>
              );
            })}
            <li>
              <a
                href="/admin-login"
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-l-4 hover:border-blue-400 transition-all duration-200`}
                title={isCollapsed ? 'Admin Login' : ''}
              >
                <Icon name="logout" />
                {!isCollapsed && 'Admin Login'}
              </a>
            </li>
          </ul>
        </nav>

        {/* User Info & Logout Section */}
        <div className="p-3 border-t border-gray-200">
          {!isCollapsed && user && (
            <div className="mb-3 px-3">
              <div className="text-sm font-medium text-gray-800">{user.name}</div>
              <div className="text-xs text-gray-500">{user.username}</div>
            </div>
          )}
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
      <main className={`flex-1 transition-all duration-300 ease-in-out ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-semibold text-gray-800">
                {navItems.find(item => pathname === item.href || (item.href !== '/stock-manager' && pathname.startsWith(item.href)))?.label || 'Stock Manager'}
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
