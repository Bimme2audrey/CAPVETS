'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS } from '@/lib/api';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(API_ENDPOINTS.ADMIN_LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('adminToken', data.token);
        router.push('/admin');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Network error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Logo" className="w-20 h-auto mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Admin Login</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            placeholder="Admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-200"
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-200 pr-12"
            />
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-xl select-none"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? '🙈' : '👁'}
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-green-700 text-yellow-400 rounded-lg font-bold text-base hover:bg-green-800 transition-all duration-300 shadow-sm cursor-pointer"
          >
            Login
          </button>

          {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
        </form>
      </div>
    </div>
  );
}
