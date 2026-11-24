'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Language = 'ar' | 'en';

export const translations = {
  ar: {
    common: {
      siteTitle: 'منصتي الذكية',
      login: 'تسجيل الدخول',
      signup: 'إنشاء حساب جديد',
      logout: 'تسجيل الخروج',
      dashboard: 'لوحة التحكم',
      adminPanel: 'لوحة الإدارة',
      settings: 'الإعدادات',
      save: 'حفظ التغييرات',
      saving: 'جاري الحفظ...',
      cancel: 'إلغاء',
      delete: 'حذف',
      edit: 'تعديل',
      search: 'بحث...',
      loading: 'جاري التحميل...',
      actions: 'الإجراءات',
      status: 'الحالة',
      active: 'نشط',
      blocked: 'محظور',
      email: 'البريد الإلكتروني',
      phone: 'رقم الهاتف',
      name: 'الاسم',
      password: 'كلمة المرور',
      whatsapp: 'واتساب',
      orderNow: 'طلب الآن عبر واتساب',
    },
    hero: {
      badge: 'القالب الموحد والمعتمد لمشاريع الـ SaaS',
      title: 'قالب البداية السريع لمشاريع الويب الحديثة',
      subtitle: 'كل أدوات المصادقة، الأمان، رفع الملفات، الإدارة، والدفع السريع مجهزة لتنطلق فوراً.',
      getStarted: 'ابدأ الآن مجاناً',
      browseFeatures: 'استعرض الميزات',
    },
    admin: {
      title: 'لوحة تحكم الإدارة العامة',
      subtitle: 'إدارة المستخدمين، إحصائيات النظام، وضبط هوية وألوان الموقع.',
      tabUsers: 'إدارة المستخدمين',
      tabSettings: 'إعدادات وهوية الموقع',
      tabOrders: 'إدارة الطلبات والمبيعات',
      primaryColor: 'اللون الرئيسي للبراند',
      secondaryColor: 'اللون الثانوي',
      siteNameAr: 'اسم الموقع بالعربية',
      siteNameEn: 'اسم الموقع بالإنجليزية',
      currency: 'العملة الافتراضية',
    },
    orders: {
      newOrder: 'طلب جديد',
      orderNumber: 'رقم الطلب',
      total: 'المجموع',
      customer: 'العميل',
      paymentMethod: 'طريقة الدفع',
      confirmOnWhatsApp: 'تأكيد الطلب على واتساب',
    },
  },
  en: {
    common: {
      siteTitle: 'My SaaS Platform',
      login: 'Sign In',
      signup: 'Create Account',
      logout: 'Sign Out',
      dashboard: 'Dashboard',
      adminPanel: 'Admin Panel',
      settings: 'Settings',
      save: 'Save Changes',
      saving: 'Saving...',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      search: 'Search...',
      loading: 'Loading...',
      actions: 'Actions',
      status: 'Status',
      active: 'Active',
      blocked: 'Blocked',
      email: 'Email Address',
      phone: 'Phone Number',
      name: 'Name',
      password: 'Password',
      whatsapp: 'WhatsApp',
      orderNow: 'Order via WhatsApp',
    },
    hero: {
      badge: 'The Standard Enterprise SaaS Starter Template',
      title: 'Fast Boilerplate for Modern Web Projects',
      subtitle: 'Complete auth, security, cloud uploads, admin panel, and instant checkout ready to scale.',
      getStarted: 'Get Started Free',
      browseFeatures: 'Browse Features',
    },
    admin: {
      title: 'Global Administration Panel',
      subtitle: 'Manage users, track analytics, and customize branding & theme colors.',
      tabUsers: 'Users Management',
      tabSettings: 'Branding & Theme Settings',
      tabOrders: 'Orders & Sales',
      primaryColor: 'Brand Primary Color',
      secondaryColor: 'Secondary Accent Color',
      siteNameAr: 'Site Name (Arabic)',
      siteNameEn: 'Site Name (English)',
      currency: 'Default Currency',
    },
    orders: {
      newOrder: 'New Order',
      orderNumber: 'Order #',
      total: 'Total',
      customer: 'Customer',
      paymentMethod: 'Payment Method',
      confirmOnWhatsApp: 'Confirm Order on WhatsApp',
    },
  },
};

interface LanguageContextType {
  lang: Language;
  dir: 'rtl' | 'ltr';
  t: any;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'ar',
  dir: 'rtl',
  t: translations.ar,
  setLanguage: () => {},
  toggleLanguage: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('ar');

  useEffect(() => {
    const saved = localStorage.getItem('app_lang') as Language;
    if (saved && (saved === 'ar' || saved === 'en')) {
      setLang(saved);
      document.documentElement.lang = saved;
      document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr';
    }
  }, []);

  const setLanguage = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('app_lang', newLang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLang;
      document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    }
  };

  const toggleLanguage = () => {
    setLanguage(lang === 'ar' ? 'en' : 'ar');
  };

  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const t = translations[lang] || translations.ar;

  return (
    <LanguageContext.Provider value={{ lang, dir, t, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
