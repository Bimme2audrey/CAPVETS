'use client';

import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '@/lib/api';

interface Stats {
  totalOrders: number;
  ordersToday: number;
  totalRevenue: number;
  mtnRevenue: number;
  mtnCount: number;
  orangeRevenue: number;
  orangeCount: number;
}

function StatCard({ title, value, hint }: { title: string; value: string | number; hint?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="text-sm text-gray-500 font-medium mb-1">{title}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {hint && <div className="text-xs text-gray-400 mt-1">{hint}</div>}
    </div>
  );
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(API_ENDPOINTS.ADMIN_STATS, {
          headers: { Authorization: token ? `Bearer ${token}` : '' },
        });
        if (!res.ok) throw new Error('Failed to fetch stats');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const v = (val: string | number | undefined) => (loading ? '…' : val ?? '-');

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Orders" value={v(stats?.totalOrders)} />
        <StatCard title="Orders Today" value={v(stats?.ordersToday)} />
        <StatCard title="Total Revenue" value={v(stats ? `${stats.totalRevenue.toLocaleString()} CFA` : undefined)} />
        <StatCard title="MTN Revenue" value={v(stats ? `${stats.mtnRevenue.toLocaleString()} CFA` : undefined)} hint={stats ? `${stats.mtnCount} payments` : ''} />
        <StatCard title="Orange Revenue" value={v(stats ? `${stats.orangeRevenue.toLocaleString()} CFA` : undefined)} hint={stats ? `${stats.orangeCount} payments` : ''} />
      </div>
    </div>
  );
}
