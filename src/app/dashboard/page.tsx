'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  LogOut, 
  User, 
  Mail, 
  Sparkles, 
  CheckCircle2, 
  Upload, 
  Camera, 
  ShieldAlert,
  Loader2 
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function DashboardPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          router.push('/login');
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadMessage(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('isAvatar', 'true');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setUser((prev: any) => ({ ...prev, avatar: data.url }));
        setUploadMessage('تم تحديث الصورة الشخصية بنجاح!');
      } else {
        setUploadMessage(data.message || 'فشل رفع الصورة.');
      }
    } catch (err) {
      setUploadMessage('حدث خطأ أثناء الرفع.');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadMessage(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-xs font-bold text-slate-500">
        جاري التحقق من الجلسة والصلاحيات...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      
      {/* Top Bar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-black text-slate-900 dark:text-white text-base">Next.js SaaS Dashboard</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Admin Panel Link if Admin or Manager */}
            {(user?.role === 'admin' || user?.role === 'manager') && (
              <Link
                href="/admin"
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">لوحة إدارة المخازن والمتجر</span>
                <span className="sm:hidden">الإدارة</span>
              </Link>
            )}

            <span className="text-xs text-slate-500 hidden md:inline">
              مرحباً، <strong className="text-slate-800 dark:text-slate-200">{user?.name}</strong>
            </span>

            <button
              onClick={handleLogout}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-300 mb-2">
            <Sparkles className="w-4 h-4" />
            <span>جلسة مستخدم موثقة ومحمية بـ JWT Cookies</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">أهلاً بك يا {user?.name} 👋</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
            تم تسجيل دخولك بنجاح. القالب يدعم نظام الصلاحيات، ورفع الصور السحابية، والوضع الليلي الكامل.
          </p>
        </div>

        {/* Profile Card & Avatar Upload */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b pb-6 border-slate-100 dark:border-slate-800">
            
            {/* Avatar Section */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-blue-100 dark:bg-blue-950 border-2 border-blue-500/30 overflow-hidden flex items-center justify-center text-blue-700 dark:text-blue-300 font-black text-2xl shadow-inner">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user?.firstName?.charAt(0) || 'U'
                  )}
                </div>
                
                {/* Upload Avatar Trigger */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-1 -left-1 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all cursor-pointer"
                  title="تغيير الصورة الشخصية"
                >
                  {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">{user?.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{user?.email}</p>
                {uploadMessage && (
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                    {uploadMessage}
                  </span>
                )}
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {user?.role === 'admin' ? '🛡️ مدير النظام (Admin)' : '👤 مستخدم عادي (User)'}
              </span>
            </div>

          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 block font-medium">الاسم الكامل:</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{user?.name}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 block font-medium">البريد الإلكتروني:</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100 font-mono">{user?.email}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 block font-medium">حالة الحساب:</span>
              <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>نشط ومفعل</span>
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 block font-medium">رفع الملفات والصور:</span>
              <span className="text-slate-700 dark:text-slate-300 font-bold">
                نظام الرفع نشط (حد أقصى 5MB)
              </span>
            </div>
          </div>
        </div>

      </main>

    </div>
  );
}
