"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Expense {
  _id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  paymentMode: string;
  reference?: string;
  recordedBy: string;
  createdAt: string;
}

const EXPENSE_CATEGORIES = [
  { value: 'feed', label: 'Feed & Nutrition' },
  { value: 'medication', label: 'Medication & Vaccines' },
  { value: 'labor', label: 'Labor & Salaries' },
  { value: 'utilities', label: 'Utilities (Electricity, Water)' },
  { value: 'maintenance', label: 'Maintenance & Repairs' },
  { value: 'transport', label: 'Transportation' },
  { value: 'equipment', label: 'Equipment & Supplies' },
  { value: 'rent', label: 'Rent & Property' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'marketing', label: 'Marketing & Advertising' },
  { value: 'professional', label: 'Professional Services' },
  { value: 'other', label: 'Other Expenses' }
];

const PAYMENT_MODES = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'momo', label: 'Mobile Money' },
  { value: 'orange_money', label: 'Orange Money' },
  { value: 'inter_transfer', label: 'Inter-transfer' }
];

export default function ExpensesPage() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: '',
    description: '',
    amount: '',
    paymentMode: '',
    reference: ''
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('stockToken');
      const res = await fetch('/api/expenses', {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      const data = await res.json();
      if (data.success) {
        setExpenses(data.data);
      }
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('stockToken');
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setShowAddForm(false);
        setFormData({
          date: new Date().toISOString().split('T')[0],
          category: '',
          description: '',
          amount: '',
          paymentMode: '',
          reference: ''
        });
        fetchExpenses();
      }
    } catch (err) {
      console.error('Error adding expense:', err);
    }
  };

  const getCategoryLabel = (value: string) => {
    const category = EXPENSE_CATEGORIES.find(c => c.value === value);
    return category?.label || value;
  };

  const getPaymentLabel = (value: string) => {
    const payment = PAYMENT_MODES.find(p => p.value === value);
    return payment?.label || value;
  };

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading expenses...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Expense Tracker</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-green-700 text-yellow-400 rounded-lg font-semibold text-sm hover:bg-green-800"
        >
          Add Expense
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Total Expenses</div>
          <div className="text-2xl font-bold text-red-600">
            {getTotalExpenses().toLocaleString()} CFA
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-600">This Month</div>
          <div className="text-2xl font-bold text-gray-800">
            {expenses
              .filter(e => new Date(e.date).getMonth() === new Date().getMonth())
              .reduce((sum, e) => sum + e.amount, 0)
              .toLocaleString()} CFA
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Today</div>
          <div className="text-2xl font-bold text-gray-800">
            {expenses
              .filter(e => new Date(e.date).toDateString() === new Date().toDateString())
              .reduce((sum, e) => sum + e.amount, 0)
              .toLocaleString()} CFA
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Transactions</div>
          <div className="text-2xl font-bold text-gray-800">{expenses.length}</div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Expenses</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-3 font-semibold text-gray-700">Date</th>
                <th className="text-left py-3 px-3 font-semibold text-gray-700">Category</th>
                <th className="text-left py-3 px-3 font-semibold text-gray-700">Description</th>
                <th className="text-left py-3 px-3 font-semibold text-gray-700">Amount</th>
                <th className="text-left py-3 px-3 font-semibold text-gray-700">Payment</th>
                <th className="text-left py-3 px-3 font-semibold text-gray-700">Reference</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No expenses found
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-3 text-gray-600">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-1 bg-gray-100 rounded text-xs">
                        {getCategoryLabel(expense.category)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-600">{expense.description}</td>
                    <td className="py-3 px-3 font-semibold text-red-600">
                      {expense.amount.toLocaleString()} CFA
                    </td>
                    <td className="py-3 px-3 text-gray-600">
                      {getPaymentLabel(expense.paymentMode)}
                    </td>
                    <td className="py-3 px-3 text-gray-600">{expense.reference || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Add Expense</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select category</option>
                  {EXPENSE_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Enter description"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (CFA)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Enter amount"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                <select
                  value={formData.paymentMode}
                  onChange={(e) => setFormData({...formData, paymentMode: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select payment mode</option>
                  {PAYMENT_MODES.map(mode => (
                    <option key={mode.value} value={mode.value}>{mode.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference (Optional)</label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => setFormData({...formData, reference: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Reference number"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-700 text-yellow-400 py-2 rounded-lg font-semibold hover:bg-green-800"
                >
                  Add Expense
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
