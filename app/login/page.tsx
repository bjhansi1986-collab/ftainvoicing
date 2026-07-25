'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { apiPath, withBasePath } from '@/lib/paths';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || withBasePath('/dashboard');

  const [email, setEmail] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch(apiPath('/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, companyCode }),
      });

      if (response.ok) {
        router.push(nextPath);
      } else {
        const data = await response.json();
        setMessage(data.error || 'Login failed');
      }
    } catch {
      setMessage('Unable to login at this time.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Company Login</h1>
          <p className="text-gray-600 mb-6">
            Sign in using your company email and company code (UAE ID, Tax ID, or TRRN).
          </p>

          {message && (
            <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                required
                placeholder="admin@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Code
              </label>
              <input
                type="text"
                value={companyCode}
                onChange={(e) => setCompanyCode(e.target.value)}
                className="input-field"
                required
                placeholder="UAE ID / Tax ID / TRRN"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-60"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-sm text-gray-600">
            Use your saved company details to login. If credentials changed, ask an authenticated admin to update Company Details.
          </p>
        </div>
      </div>
    </div>
  );
}
