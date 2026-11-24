'use client';

import React from 'react';
import { RefreshCw, MapPin, Award, Zap } from 'lucide-react';

export default function TrustBadges() {
  const badges = [
    {
      icon: RefreshCw,
      title: 'استبدال واسترجاع في نفس اليوم',
      description: 'المقاس مش مظبوط؟ بنبدلك في نفس اليوم وبكل سهولة وبدون أي تعقيد.',
    },
    {
      icon: MapPin,
      title: '3 فروع في محافظة السويس',
      description: 'شرفنا بالزيارة في فروعنا بالكورنيش القديم وشارع الرخاوي وميني زيكو.',
    },
    {
      icon: Award,
      title: 'خامات وجودة مضمونة',
      description: 'أقطان مصرية 100%، تقفيل مستورد، وأحذية ماستر كواليتي مريحة للقدم.',
    },
    {
      icon: Zap,
      title: 'أفضل سعر في مصر',
      description: 'برند الغلابة - بنقدملك أعلى خامة وأحدث تريند بأقل وأفضل سعر ممكن.',
    }
  ];

  return (
    <section className="py-12 border-y border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-100/50 dark:bg-zinc-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {badges.map((b, i) => {
            const Icon = b.icon;
            return (
              <div
                key={i}
                className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:border-zinc-400 dark:hover:border-zinc-700 transition"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                    {b.title}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
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
