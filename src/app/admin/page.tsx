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

interface Order {
  _id: string;
  name: string;
  phone: string;
  email: string;
  productType: string;
  quantity: string;
  unit: string;
  chickenNature?: string;
  weightRange?: string;
  cutUp?: string;
  cutPieces?: string;
  total: number;
  subtotal: number;
  cutUpFee: number;
  deliveryFee: number;
  status: string;
  paymentStatus: string;
  deliveryStatus: string;
  orderType: string;
  address?: string;
  preferredTime: string;
  createdAt: string;
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
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('adminToken');

        // Fetch stats
        const statsRes = await fetch(API_ENDPOINTS.ADMIN_STATS, {
          headers: { Authorization: token ? `Bearer ${token}` : '' },
        });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        // Fetch all orders for search and filtering
        const ordersRes = await fetch(API_ENDPOINTS.ORDERS, {
          headers: { Authorization: token ? `Bearer ${token}` : '' },
        });
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          const ordersArray = Array.isArray(ordersData) ? ordersData : ordersData.orders || [];
          setAllOrders(ordersArray);

          // Get recent 10 orders
          const sortedOrders = [...ordersArray].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setRecentOrders(sortedOrders.slice(0, 10));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Get unique months from orders
  const getAvailableMonths = () => {
    const months = new Set<string>();

    // Always add the current month and a few recent months for testing
    const currentDate = new Date();
    for (let i = 0; i < 6; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      months.add(monthYear);
    }

    // Add months from actual orders
    allOrders.forEach(order => {
      const date = new Date(order.createdAt);
      const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      months.add(monthYear);
    });

    return Array.from(months).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  };

  // Filter orders based on search and month
  const getFilteredOrders = () => {
    let filtered = [...allOrders];

    // Filter by month
    if (selectedMonth !== 'all') {
      filtered = filtered.filter(order => {
        const date = new Date(order.createdAt);
        const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        return monthYear === selectedMonth;
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.productType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const formatProductDetails = (order: Order) => {
    if (order.productType === 'chicken') {
      const details = [];
      if (order.chickenNature) details.push(order.chickenNature);
      if (order.weightRange) details.push(order.weightRange);
      if (order.cutUp) details.push(`Cut up: ${order.cutUp}`);
      if (order.cutPieces) details.push(`Pieces: ${order.cutPieces}`);
      return details.join(' • ');
    }
    return `${order.quantity} ${order.unit}`;
  };

  const filteredOrders = getFilteredOrders();
  const availableMonths = getAvailableMonths();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    };
  };

  const statusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'preparing': return 'bg-blue-100 text-blue-700';
      case 'out-for-delivery': return 'bg-orange-100 text-orange-700';
      case 'scheduled': return 'bg-purple-100 text-purple-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const v = (val: string | number | undefined) => (loading ? '…' : val ?? '-');

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Overview</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard title="Total Orders" value={v(stats?.totalOrders)} />
        <StatCard title="Orders Today" value={v(stats?.ordersToday)} />
        <StatCard title="Total Revenue" value={v(stats ? `${stats.totalRevenue.toLocaleString()} CFA` : undefined)} />
        <StatCard title="MTN Revenue" value={v(stats ? `${stats.mtnRevenue.toLocaleString()} CFA` : undefined)} hint={stats ? `${stats.mtnCount} payments` : ''} />
        <StatCard title="Orange Revenue" value={v(stats ? `${stats.orangeRevenue.toLocaleString()} CFA` : undefined)} hint={stats ? `${stats.orangeCount} payments` : ''} />
        <StatCard title="Filtered Results" value={filteredOrders.length} hint={selectedMonth === 'all' ? 'All months' : selectedMonth} />
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Orders</label>
            <input
              type="text"
              placeholder="Search by name, phone, email, product, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Month Filter */}
          <div className="lg:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Months</option>
              {availableMonths.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            {searchTerm || selectedMonth !== 'all' ? 'Search Results' : 'Recent Orders'}
            <span className="text-sm text-gray-500 ml-2">({filteredOrders.length} orders)</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Date & Time</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Customer</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Contact</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Product</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Amount</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Order Type</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">Loading orders...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    {searchTerm || selectedMonth !== 'all' ? 'No orders found matching your criteria' : 'No orders found'}
                  </td>
                </tr>
              ) : (
                filteredOrders.slice(0, 10).map((order) => {
                  const { date, time } = formatDate(order.createdAt);

                  return (
                    <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{date}</div>
                        <div className="text-xs text-gray-500">{time}</div>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{order.name}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{order.phone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 capitalize">{order.productType}</div>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{order.total?.toLocaleString()} CFA</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium capitalize ${order.orderType === 'pickup' ? 'text-green-700' : 'text-blue-700'
                          }`}>
                          {order.orderType}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusColor(order.deliveryStatus)}`}>
                          {order.deliveryStatus || 'pending'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filteredOrders.length > 10 && (
          <div className="px-6 py-3 border-t border-gray-200 text-center">
            <button className="text-green-600 hover:text-green-700 font-medium text-sm">
              View all {filteredOrders.length} orders →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
