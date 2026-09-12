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
        setError(json.error || 'Invalid administrator credentials');
      }
    } catch {
      setError('Secure authentication connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0b2823] via-[#123f38] to-[#1a574e] px-4 py-16 text-[#183a35] relative overflow-hidden">
      {/* Background Decorative Lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#f2ad3b]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#28745e]/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md rounded-[2.5rem] bg-[#fffdf8] p-8 sm:p-10 shadow-2xl border border-white/30 backdrop-blur-xl">
        {/* Header Branding */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#123f38] text-white shadow-xl border-2 border-[#f2ad3b]/40">
            <HeartHandshake className="w-8 h-8 text-[#f2ad3b]" />
          </div>
          <h2 className="display-font mt-5 text-2xl sm:text-3xl font-bold text-[#183a35] tracking-tight">
            ACT Trust Admin Portal
          </h2>
          <p className="mt-1 text-xs text-[#28745e] font-bold uppercase tracking-widest">
            Secure Management Console
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl bg-red-50 p-4 text-xs font-semibold text-red-600 border border-red-200 text-center animate-in fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#123f38] mb-2">
              Administrator Email
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-[#58706a] absolute left-4 top-3.5" />
              <input
                type="email"
                required
                placeholder="admin@actcharitabletrust.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-[#dce7dc] pl-12 pr-4 py-3.5 text-sm focus:border-[#28745e] focus:ring-2 focus:ring-[#28745e]/20 focus:outline-none bg-[#f8f4e9]/40 text-[#183a35] font-medium transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#123f38] mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-[#58706a] absolute left-4 top-3.5" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-[#dce7dc] pl-12 pr-4 py-3.5 text-sm focus:border-[#28745e] focus:ring-2 focus:ring-[#28745e]/20 focus:outline-none bg-[#f8f4e9]/40 text-[#183a35] font-medium transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 flex items-center justify-center gap-2 rounded-2xl bg-[#123f38] py-4 text-sm font-bold text-[#fffdf8] shadow-xl hover:bg-[#28745e] hover:shadow-2xl transition duration-300 disabled:opacity-50 hover:-translate-y-0.5"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In To Control Console'}</span>
            <ArrowRight className="w-4 h-4 text-[#f2ad3b]" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#dce7dc] flex items-center justify-center gap-2 text-xs text-[#58706a]">
          <ShieldCheck className="w-4 h-4 text-[#28745e]" />
          <span>256-Bit Encrypted Admin Authentication</span>
        </div>
      </div>
    </div>
  );
}
