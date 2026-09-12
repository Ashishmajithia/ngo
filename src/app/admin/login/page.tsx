'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, ArrowRight, HeartHandshake } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        localStorage.setItem('act_admin_user', JSON.stringify(json.user));
        router.push('/admin');
      } else {
        setError(json.error || 'Invalid admin credentials');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#123f38] px-4 py-12 text-[#183a35]">
      <div className="w-full max-w-md rounded-3xl bg-[#fffdf8] p-8 shadow-2xl border border-white/20">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#123f38] text-white shadow-lg">
            <HeartHandshake className="w-7 h-7 text-[#f2ad3b]" />
          </div>
          <h2 className="display-font mt-4 text-2xl font-bold text-[#183a35]">
            ACT Trust Admin Portal
          </h2>
          <p className="mt-1 text-xs text-[#28745e] font-semibold">
            Full Control Panel & Content Management
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-200 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#123f38] mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-[#58706a] absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="admin@act.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[#dce7dc] pl-11 pr-4 py-2.5 text-sm focus:border-[#28745e] focus:outline-none bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#123f38] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-[#58706a] absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[#dce7dc] pl-11 pr-4 py-2.5 text-sm focus:border-[#28745e] focus:outline-none bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#123f38] py-3.5 text-sm font-bold text-white shadow-lg hover:bg-[#28745e] transition disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In To Dashboard'}</span>
            <ArrowRight className="w-4 h-4 text-[#f2ad3b]" />
          </button>

          <div className="rounded-2xl bg-[#f8f4e9] p-3 text-[11px] text-[#58706a] text-center border border-[#dce7dc] mt-4">
            <ShieldCheck className="w-4 h-4 text-[#28745e] inline mr-1" />
            <span>Default Demo Login: <strong>admin@act.org</strong> / Password: <strong>admin123</strong></span>
          </div>
        </form>
      </div>
    </div>
  );
}
