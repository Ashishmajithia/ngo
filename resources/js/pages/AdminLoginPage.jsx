import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, HeartHandshake, Database, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if already authenticated
    fetch('/api/admin/verify')
      .then((res) => {
        if (res.ok) {
          window.location.href = '/admin';
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        localStorage.setItem('act_admin_user', JSON.stringify(json.user));
        if (json.token) {
          localStorage.setItem('act_admin_token', json.token);
        }
        window.location.href = '/admin';
      } else {
        setError(json.error || 'Invalid administrator credentials');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickCredentials = () => {
    setEmail('admin@actcharitabletrust.org');
    setPassword('ActTrust@2026!');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0b2823] via-[#123f38] to-[#1a574e] px-4 py-16 text-[#183a35] relative overflow-hidden">
      {/* Background Decorative Lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#f2ad3b]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#28745e]/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md rounded-[2.5rem] bg-[#fffdf8] p-8 sm:p-10 shadow-2xl border border-white/40 backdrop-blur-xl">
        {/* Header Branding */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#123f38] text-white shadow-xl border-2 border-[#f2ad3b]/40">
            <HeartHandshake className="w-8 h-8 text-[#f2ad3b]" />
          </div>
          <h2 className="display-font mt-5 text-2xl sm:text-3xl font-bold text-[#183a35] tracking-tight">
            ACT Trust Admin Portal
          </h2>
          <p className="mt-1 text-xs text-[#28745e] font-bold uppercase tracking-widest">
            Laravel Enterprise Management Console
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>Laravel Database & Eloquent Connected</span>
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl bg-red-50 p-4 text-xs font-semibold text-red-600 border border-red-200 flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#123f38] mb-1.5">
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
            <label className="block text-xs font-bold uppercase tracking-wider text-[#123f38] mb-1.5">
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
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-2xl bg-[#123f38] py-4 text-sm font-bold text-[#fffdf8] shadow-xl hover:bg-[#28745e] hover:shadow-2xl transition duration-300 disabled:opacity-50 hover:-translate-y-0.5"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In To Admin Console'}</span>
            <ArrowRight className="w-4 h-4 text-[#f2ad3b]" />
          </button>
        </form>

        {/* Quick Credentials Helper */}
        <div className="mt-5 p-3 rounded-xl bg-[#f8f4e9] border border-[#e5dec9] text-xs text-[#58706a] flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="font-semibold text-[#183a35] block">Default Admin Login:</span>
            <span className="text-[11px] text-[#58706a]">admin@actcharitabletrust.org</span>
          </div>
          <button
            type="button"
            onClick={fillQuickCredentials}
            className="px-2.5 py-1 text-xs font-bold text-[#123f38] bg-white rounded-lg border border-[#dce7dc] hover:bg-[#f2ad3b]/10 transition"
          >
            Auto-Fill
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-[#dce7dc] flex items-center justify-center gap-2 text-xs text-[#58706a]">
          <ShieldCheck className="w-4 h-4 text-[#28745e]" />
          <span>Laravel Auth & 256-Bit Encrypted Sessions</span>
        </div>
      </div>
    </div>
  );
}
