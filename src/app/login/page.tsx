'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'فشل تسجيل الدخول، يرجى التأكد من البيانات.');
        setLoading(false);
        return;
      }

      setSuccess('تم تسجيل الدخول بنجاح! جاري تحويلك...');
      setTimeout(() => {
        if (data.user?.role === 'admin' || data.user?.role === 'manager') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      }, 800);
    } catch (err: any) {
      setError('حدث خطأ في الاتصال بالخادم.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
          <div className="w-12 h-12 rounded-2xl overflow-hidden border border-zinc-800 shadow-md group-hover:scale-105 transition-transform bg-white">
            <img src="/images/logo.webp" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div className="text-right">
            <span className="font-black text-xl text-white block">زيكو ستور</span>
            <span className="text-[10px] text-zinc-400 font-bold">لوحة التحكم وإدارة الفروع</span>
          </div>
        </Link>
        <h2 className="text-2xl font-black text-white">تسجيل الدخول إلى حسابك</h2>
        <p className="mt-1 text-xs text-zinc-400">
          ليس لديك حساب؟{' '}
          <Link href="/signup" className="font-bold text-zinc-200 underline hover:text-white">
            إنشاء حساب جديد
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-zinc-900/90 backdrop-blur-md py-8 px-6 shadow-2xl rounded-3xl border border-zinc-800 sm:px-10">
          
          {/* Alerts */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute right-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@zeko.com"
                  className="w-full pr-10 pl-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-zinc-300">كلمة المرور</label>
                <Link href="/forgot-password" className="text-[11px] font-bold text-zinc-400 hover:text-zinc-200">
                  نسيت كلمة المرور؟
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute right-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pr-10 pl-10 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-100 hover:bg-white text-zinc-950 font-black py-3 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              <span>{loading ? 'جاري التحقق...' : 'تسجيل الدخول'}</span>
            </button>
          </form>

          {/* Quick Demo Credentials for ZeKo Store Admin */}
          <div className="mt-6 p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 text-[11px] text-zinc-400 text-center space-y-1">
            <div className="font-bold text-zinc-300">بيانات دخول الإدارة الافتراضية:</div>
            <div className="font-mono text-zinc-300 dir-ltr text-center">admin@zeko.com</div>
            <div className="font-mono text-zinc-400 dir-ltr text-center">Admin@123456</div>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition">
              <ArrowRight className="w-3.5 h-3.5" />
              <span>العودة للمتجر الرئيسي</span>
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}
