"use client";

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

interface StockLevel {
  _id: string;
  productType: string;
  chickenCategory?: string;
  unit: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel?: number;
  lastUpdated: string;
}

interface StockTransaction {
  _id: string;
  productType: string;
  chickenCategory?: string;
  unit: string;
  transactionType: 'incoming' | 'outgoing';
  quantity: number;
  unitPrice?: number;
  source: string;
  sourceName?: string;
  reference?: string;
  notes?: string;
  recordedBy: string;
  createdAt: string;
}

export default function StockManagerDashboard() {
  const router = useRouter();
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('stockToken');
    const userData = localStorage.getItem('stockUser');
    
    if (!token) {
      router.push('/stock-manager/login');
      return;
    }
    
    if (userData) {
      setUser(JSON.parse(userData));
    }

    fetchStockData();
  }, [router]);

  const fetchStockData = async () => {
    try {
      const token = localStorage.getItem('stockToken');
      const res = await fetch('/api/stock', {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
      const data = await res.json();
      if (data.success) {
        setStockLevels(data.data.stockLevels);
        setTransactions(data.data.recentTransactions);
      }
    } catch (err) {
      console.error('Error fetching stock data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (current: number, min: number) => {
    if (current <= min) return { color: 'text-red-600', bg: 'bg-red-100', label: 'Low Stock' };
    if (current <= min * 2) return { color: 'text-amber-600', bg: 'bg-amber-100', label: 'Medium' };
    return { color: 'text-green-600', bg: 'bg-green-100', label: 'Good' };
  };

  const getProductLabel = (type: string) => {
    const products: { [key: string]: string } = {
      'chicken': 'Chicken',
      'eggs': 'Eggs',
      'corn': 'Corn',
      'beans': 'Beans',
      'soybean': 'Soybean',
      'palmnuts': 'Palm Nuts',
      'snails': 'Snails',
      'pigs': 'Pigs',
      'fish': 'Fish'
    };
    return products[type] || type;
  };

  const getUnitLabel = (unit: string) => {
    const units: { [key: string]: string } = {
      'crate': 'Crate',
      'piece': 'Piece',
      'kg': 'Kilogram',
      'bag': 'Bag',
      'dozen': 'Dozen'
    };
    return units[unit] || unit;
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading stock data...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Stock Overview</h2>
        <div className="flex gap-4">
          <a
            href="/stock-manager/comprehensive-stock"
            className="px-4 py-2 bg-green-700 text-yellow-400 rounded-lg font-semibold text-sm hover:bg-green-800"
          >
            Advanced Stock Tracking
          </a>
        </div>
      </div>

      {/* Current Stock Levels */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Stock Levels</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Unit</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Current Stock</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Min Level</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {stockLevels.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    No stock data found
                  </td>
                </tr>
              ) : (
                stockLevels.map((stock) => {
                  const status = getStockStatus(stock.currentStock, stock.minStockLevel);
                  return (
                    <tr key={stock._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {getProductLabel(stock.productType)}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {stock.chickenCategory || '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {stock.unit ? getUnitLabel(stock.unit) : '-'}
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900">
                        {stock.currentStock.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {stock.minStockLevel.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(stock.lastUpdated).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Quantity</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Source</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Source Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Recorded By</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">
                        {getProductLabel(transaction.productType)}
                      </div>
                      {transaction.chickenCategory && (
                        <div className="text-xs text-gray-500">{transaction.chickenCategory}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.transactionType === 'incoming' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {transaction.transactionType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      {transaction.quantity.toLocaleString()} {transaction.unit ? getUnitLabel(transaction.unit) : ''}
                    </td>
                    <td className="py-3 px-4 text-gray-600 capitalize">
                      {transaction.source}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {transaction.sourceName || '-'}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {transaction.recordedBy}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
