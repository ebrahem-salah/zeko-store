'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { Globe } from 'lucide-react';

export default function LanguageToggle() {
  const { lang, toggleLanguage } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
      title={lang === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
    >
      <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
    </button>
  );
}
