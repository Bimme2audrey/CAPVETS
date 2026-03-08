"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StockManagerLoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/stock-manager/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        // Store token and user data
        localStorage.setItem('stockToken', data.token);
        localStorage.setItem('stockUser', JSON.stringify(data.user));

        // Redirect to stock manager dashboard
        router.push('/stock-manager');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center p-4 fixed inset-0 z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative z-10">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Stock Manager</h1>
          <p className="text-gray-600">CAPVETS Inventory System</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Enter your username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 text-yellow-400 py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors disabled:bg-gray-300 disabled:text-gray-500"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Links */}
        <div className="mt-6 text-center">
          <a
            href="/admin-login"
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            ← Back to Admin Login
          </a>
        </div>

        {/* Demo Credentials - Hidden by default */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              const demoSection = document.getElementById('demo-credentials');
              if (demoSection) {
                demoSection.style.display = demoSection.style.display === 'none' ? 'block' : 'none';
              }
            }}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Show Demo Credentials
          </button>
        </div>

        <div id="demo-credentials" className="mt-4 p-3 bg-gray-50 rounded-lg text-center" style={{ display: 'none' }}>
          <p className="text-xs text-gray-600">
            <strong>Demo Credentials:</strong><br />
            Username: stock@capvets.com<br />
            Password: stock123
          </p>
        </div>
      </div>
    </div>
  );
}
