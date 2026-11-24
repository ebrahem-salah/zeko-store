'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Users, 
  UserCheck, 
  UserX, 
  Search, 
  Filter, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  LogOut,
  Calendar,
  Lock,
  Unlock,
  ShieldAlert,
  Palette,
  ShoppingBag,
  Save,
  MessageSquare,
  Globe,
  DollarSign
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageToggle from '@/components/LanguageToggle';

interface AdminUser {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'admin';
  isBlocked: boolean;
  avatar?: string;
  createdAt: string;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  adminUsers: number;
  newUsers: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'settings' | 'orders'>('users');

  // Stats & Users State
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Settings State
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [siteSettings, setSiteSettings] = useState({
    siteName: 'منصتي الذكية',
    siteNameEn: 'My SaaS Platform',
    siteDescription: 'منصة سحابية متكاملة لتقديم الخدمات والمنتجات الرقمية',
    siteDescriptionEn: 'A full-stack cloud platform for digital services and commerce',
    primaryColor: '#2563eb',
    secondaryColor: '#4f46e5',
    contactEmail: 'support@example.com',
    contactPhone: '+201096986091',
    whatsappNumber: '201096986091',
    currency: 'ر.س',
  });

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // 1. Verify Admin Session
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated || data.user?.role !== 'admin') {
          router.push('/dashboard');
        } else {
          setCurrentUser(data.user);
          loadDashboardData();
          loadSiteSettings();
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  // 2. Fetch Stats & Users
  const loadDashboardData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch(`/api/admin/users?search=${encodeURIComponent(search)}&role=${filterRole}&status=${filterStatus}`),
      ]);

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();

      if (statsData.success) setStats(statsData.stats);
      if (usersData.success) setUsers(usersData.users);
    } catch (e) {
      console.error(e);
    }
  };

  // 3. Fetch Settings
  const loadSiteSettings = async () => {
    try {
      setSettingsLoading(true);
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        setSiteSettings({
          siteName: data.settings.siteName || '',
          siteNameEn: data.settings.siteNameEn || '',
          siteDescription: data.settings.siteDescription || '',
          siteDescriptionEn: data.settings.siteDescriptionEn || '',
          primaryColor: data.settings.primaryColor || '#2563eb',
          secondaryColor: data.settings.secondaryColor || '#4f46e5',
          contactEmail: data.settings.contactEmail || '',
          contactPhone: data.settings.contactPhone || '',
          whatsappNumber: data.settings.whatsappNumber || '',
          currency: data.settings.currency || 'ر.س',
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSettingsLoading(false);
    }
  };

  // 4. Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteSettings),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ text: data.message || 'تم حفظ الإعدادات وتطبيق الألوان بنجاح! ✨', type: 'success' });
        // Update live CSS variables immediately
        if (typeof document !== 'undefined') {
          document.documentElement.style.setProperty('--brand-primary', siteSettings.primaryColor);
          document.documentElement.style.setProperty('--brand-secondary', siteSettings.secondaryColor);
        }
      } else {
        setMessage({ text: data.message || 'فشل حفظ الإعدادات.', type: 'error' });
      }
    } catch (e) {
      setMessage({ text: 'خطأ في الاتصال بالسيرفر.', type: 'error' });
    } finally {
      setSettingsSaving(false);
    }
  };

  // 5. Load Orders
  const loadOrders = async () => {
    try {
      setOrdersLoading(true);
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') {
      loadOrders();
    }
  }, [activeTab]);

  useEffect(() => {
    if (currentUser?.role === 'admin' && activeTab === 'users') {
      const delay = setTimeout(() => {
        fetch(`/api/admin/users?search=${encodeURIComponent(search)}&role=${filterRole}&status=${filterStatus}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success) setUsers(data.users);
          });
      }, 300);
      return () => clearTimeout(delay);
    }
  }, [search, filterRole, filterStatus, currentUser, activeTab]);

  const handleToggleBlock = async (userId: string, currentBlocked: boolean) => {
    setActionLoading(`block-${userId}`);
    try {
      const res = await fetch(`/api/admin/users/${userId}/block`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked: !currentBlocked }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: data.message, type: 'success' });
        loadDashboardData();
      } else {
        setMessage({ text: data.message || 'فشلت العملية.', type: 'error' });
      }
    } catch (e) {
      setMessage({ text: 'خطأ في الاتصال بالخادم.', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    setActionLoading(`role-${userId}`);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: data.message, type: 'success' });
        loadDashboardData();
      } else {
        setMessage({ text: data.message || 'فشلت العملية.', type: 'error' });
      }
    } catch (e) {
      setMessage({ text: 'خطأ في الاتصال بالخادم.', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-xs font-bold text-slate-500">
        جاري التحقق من صلاحيات المدير...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      
      {/* Top Navbar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-slate-900 dark:text-white text-base">لوحة تحكم المدير العام</span>
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 px-2 py-0.5 rounded-full mr-2">
                Admin Panel
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle />
            <ThemeToggle />
            <Link
              href="/dashboard"
              className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 px-3 py-2 rounded-xl transition-colors bg-slate-100 dark:bg-slate-800"
            >
              العودة لحسابي
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900 transition-colors cursor-pointer"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Banner Alert Message */}
        {message && (
          <div
            className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between border ${
              message.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 text-rose-800 dark:text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{message.text}</span>
            </div>
            <button onClick={() => setMessage(null)} className="text-xs opacity-60 hover:opacity-100 cursor-pointer">✕</button>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>إدارة المستخدمين</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>هوية وألوان الموقع</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>الطلبات والمبيعات</span>
          </button>
        </div>

        {/* TAB 1: USERS */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">إجمالي المستخدمين</span>
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                  {stats?.totalUsers ?? '...'}
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">قاعدة بيانات كاملة</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">الحسابات النشطة</span>
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-600 mt-2">
                  {stats?.activeUsers ?? '...'}
                </div>
                <span className="text-[11px] text-slate-400 block mt-1">غير محظورة</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">الحسابات المحظورة</span>
                  <UserX className="w-5 h-5 text-rose-600" />
                </div>
                <div className="text-2xl font-black text-rose-600 mt-2">
                  {stats?.blockedUsers ?? '...'}
                </div>
                <span className="text-[11px] text-rose-500 font-semibold block mt-1">تم إيقاف دخولها</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">المدراء (Admins)</span>
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="text-2xl font-black text-indigo-600 mt-2">
                  {stats?.adminUsers ?? '...'}
                </div>
                <span className="text-[11px] text-indigo-500 block mt-1">صلاحيات كاملة</span>
              </div>
            </div>

            {/* Users Table Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">إدارة حسابات المستخدمين</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">البحث، تعديل الصلاحيات، وحظر الحسابات المسيئة</p>
                </div>

                <div className="relative max-w-xs w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ابحث بالاسم أو البريد..."
                    className="w-full pr-10 pl-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-bold">
                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> الفلاتر:
                </span>
                <button
                  onClick={() => { setFilterStatus('all'); setFilterRole('all'); }}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    filterStatus === 'all' && filterRole === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  الكل
                </button>
                <button
                  onClick={() => setFilterStatus('active')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    filterStatus === 'active'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  النشطين فقط
                </button>
                <button
                  onClick={() => setFilterStatus('blocked')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    filterStatus === 'blocked'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  المحظورين
                </button>
                <button
                  onClick={() => setFilterRole('admin')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    filterRole === 'admin'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  المدراء (Admins)
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                      <th className="py-3 px-3">المستخدم</th>
                      <th className="py-3 px-3">البريد الإلكتروني</th>
                      <th className="py-3 px-3">الصلاحية</th>
                      <th className="py-3 px-3">الحالة</th>
                      <th className="py-3 px-3">تاريخ الانضمام</th>
                      <th className="py-3 px-3 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3 flex items-center gap-2.5">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                              {u.firstName?.[0] || 'U'}
                            </div>
                          )}
                          <span className="font-bold text-slate-900 dark:text-white">{u.name}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-mono text-[11px]">{u.email}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            u.role === 'admin'
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}>
                            {u.role === 'admin' ? 'مدير عام' : 'مستخدم'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            u.isBlocked
                              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                              : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          }`}>
                            {u.isBlocked ? 'محظور' : 'نشط'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-400 text-[11px]">
                          {new Date(u.createdAt).toLocaleDateString('ar-EG')}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleToggleRole(u.id, u.role)}
                              disabled={actionLoading === `role-${u.id}`}
                              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                              title="تبديل الصلاحية"
                            >
                              {u.role === 'admin' ? 'تنزيل لمستخدم' : 'ترقية لمدير'}
                            </button>
                            <button
                              onClick={() => handleToggleBlock(u.id, u.isBlocked)}
                              disabled={actionLoading === `block-${u.id}`}
                              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                                u.isBlocked
                                  ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                  : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                              }`}
                              title={u.isBlocked ? 'فك الحظر' : 'حظر الحساب'}
                            >
                              {u.isBlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          لا توجد نتائج تطابق شروط البحث.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BRANDING & THEME SETTINGS */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Palette className="w-5 h-5 text-blue-600" />
                <span>إعدادات هوية وألوان الموقع (Branding & Theme)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                خصص ألوان موقع العميل، اسمه بالعربية والإنجليزية، وأرقام التواصل بضغطة زر.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-slate-100 dark:border-slate-800">
              
              {/* Site Name AR */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  اسم المنصة أو المتجر (بالعربية) *
                </label>
                <input
                  type="text"
                  value={siteSettings.siteName}
                  onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                />
              </div>

              {/* Site Name EN */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  اسم المنصة بالإنجليزية (English Name)
                </label>
                <input
                  type="text"
                  value={siteSettings.siteNameEn}
                  onChange={(e) => setSiteSettings({ ...siteSettings, siteNameEn: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  dir="ltr"
                />
              </div>

              {/* Primary Color Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>اللون الرئيسي للبراند (Primary Color) *</span>
                  <span className="font-mono text-[10px] text-slate-400">{siteSettings.primaryColor}</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={siteSettings.primaryColor}
                    onChange={(e) => setSiteSettings({ ...siteSettings, primaryColor: e.target.value })}
                    className="w-12 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={siteSettings.primaryColor}
                    onChange={(e) => setSiteSettings({ ...siteSettings, primaryColor: e.target.value })}
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                    dir="ltr"
                  />
                  <div 
                    className="w-10 h-10 rounded-xl shadow-xs border border-black/10 shrink-0" 
                    style={{ backgroundColor: siteSettings.primaryColor }}
                    title="معاينة اللون"
                  />
                </div>
              </div>

              {/* Secondary Color Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>اللون الثانوي (Secondary Color)</span>
                  <span className="font-mono text-[10px] text-slate-400">{siteSettings.secondaryColor}</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={siteSettings.secondaryColor}
                    onChange={(e) => setSiteSettings({ ...siteSettings, secondaryColor: e.target.value })}
                    className="w-12 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={siteSettings.secondaryColor}
                    onChange={(e) => setSiteSettings({ ...siteSettings, secondaryColor: e.target.value })}
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                    dir="ltr"
                  />
                  <div 
                    className="w-10 h-10 rounded-xl shadow-xs border border-black/10 shrink-0" 
                    style={{ backgroundColor: siteSettings.secondaryColor }}
                    title="معاينة اللون"
                  />
                </div>
              </div>

              {/* WhatsApp Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  رقم الواتساب للطلبات المباشرة (مع كود الدولة) *
                </label>
                <input
                  type="text"
                  value={siteSettings.whatsappNumber}
                  onChange={(e) => setSiteSettings({ ...siteSettings, whatsappNumber: e.target.value })}
                  placeholder="201096986091"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                  dir="ltr"
                />
              </div>

              {/* Default Currency */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  العملة الافتراضية
                </label>
                <select
                  value={siteSettings.currency}
                  onChange={(e) => setSiteSettings({ ...siteSettings, currency: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="ر.س">ريال سعودي (ر.س)</option>
                  <option value="ج.م">جنيه مصري (ج.م)</option>
                  <option value="د.إ">درهم إماراتي (د.إ)</option>
                  <option value="USD">دولار أمريكي (USD $)</option>
                  <option value="د.ك">دينار كويتي (د.ك)</option>
                </select>
              </div>

              {/* Contact Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  البريد الإلكتروني للدعم الفني
                </label>
                <input
                  type="email"
                  value={siteSettings.contactEmail}
                  onChange={(e) => setSiteSettings({ ...siteSettings, contactEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                  dir="ltr"
                />
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  رقم الهاتف المباشر
                </label>
                <input
                  type="text"
                  value={siteSettings.contactPhone}
                  onChange={(e) => setSiteSettings({ ...siteSettings, contactPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                  dir="ltr"
                />
              </div>

            </div>

            {/* Submit Button */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={settingsSaving}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{settingsSaving ? 'جاري حفظ الإعدادات...' : 'حفظ إعدادات الهوية والألوان'}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: ORDERS */}
        {activeTab === 'orders' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-600" />
                  <span>إدارة الطلبات والمبيعات (Orders)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  طلبات الشراء الواردة عبر المتجر والواتساب
                </p>
              </div>

              <button
                onClick={loadOrders}
                disabled={ordersLoading}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="تحديث الطلبات"
              >
                <RefreshCw className={`w-4 h-4 ${ordersLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                    <th className="py-3 px-3">رقم الطلب</th>
                    <th className="py-3 px-3">العميل</th>
                    <th className="py-3 px-3">الهاتف</th>
                    <th className="py-3 px-3">إجمالي الطلب</th>
                    <th className="py-3 px-3">طريقة الدفع</th>
                    <th className="py-3 px-3">حالة الطلب</th>
                    <th className="py-3 px-3">تاريخ الطلب</th>
                    <th className="py-3 px-3 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {orders.map((ord: any) => (
                    <tr key={ord._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                        #{ord.orderNumber}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                        {ord.customerName}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px]" dir="ltr">
                        {ord.customerPhone}
                      </td>
                      <td className="py-3 px-3 font-bold text-emerald-600">
                        {ord.total} {siteSettings.currency}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {ord.paymentMethod === 'whatsapp' ? 'واتساب' : ord.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        {new Date(ord.createdAt).toLocaleDateString('ar-EG')}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <a
                          href={`https://wa.me/${ord.customerPhone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>واتساب</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        لا توجد طلبات مسجلة بعد.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
