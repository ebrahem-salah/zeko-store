'use client';

import React from 'react';
import { ShieldCheck, RefreshCw, Truck, Award } from 'lucide-react';

export default function TrustBadges() {
  const badges = [
    {
      icon: ShieldCheck,
      title: 'معاينة قبل الدفع',
      description: 'افتح الشحنة وقيس وعاين منتجك مع المندوب قبل دفع أي مليم.',
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
    },
    {
      icon: RefreshCw,
      title: 'استبدال واسترجاع 14 يوم',
      description: 'المقاس مش مظبوط؟ بنبدلك في أسرع وقت وبكل سهولة.',
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20'
    },
    {
      icon: Truck,
      title: 'شحن سريع لجميع المحافظات',
      description: 'توصيل لباب بيتك أينما كنت في مصر مع شحن مجاني للطلبات فوق 800 ج.م.',
      color: 'text-sky-500 bg-sky-500/10 border-sky-500/20'
    },
    {
      icon: Award,
      title: 'خامات وجودة مضمونة',
      description: 'أقطان مصرية 100%، تقفيل مستورد، وأحذية ماستر كواليتي مريحة للقدم.',
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20'
    }
  ];

  return (
    <section className="py-12 border-y border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {badges.map((b, i) => {
            const Icon = b.icon;
            return (
              <div
                key={i}
                className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${b.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {b.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {b.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
