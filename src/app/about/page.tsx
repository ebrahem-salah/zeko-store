'use client';

import React from 'react';
import Link from 'next/link';
import { Store, ShieldCheck, MapPin, Award, RefreshCw, ArrowRight, Phone, MessageSquare, ExternalLink } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-zinc-800 selection:text-white">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-zinc-800 bg-white">
              <img src="/images/logo.webp" alt="ZeKo Store" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="font-black text-sm block tracking-wide">زيكو ستور | ZeKo</span>
              <span className="text-[10px] text-zinc-400">برند الغلابة • السويس</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-zinc-300 transition"
            >
              <span>الرئيسية</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 border-b border-zinc-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-bold shadow-sm">
            <span>🔥</span>
            <span>السوق مش نايم.. انت اللي نايم 🫵🏻😂</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            قصة <span className="text-zinc-100">زيكو ستور</span>
            <span className="block text-xl sm:text-2xl font-bold text-zinc-400 mt-2">
              برند الغلابة • أحدث تريندات الموضة بأعلى خامة وأعدل سعر
            </span>
          </h1>

          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            انطلقنا من قلب محافظة السويس الباسلة برؤية واضحة: تقديم ملابس رجالية وسنيكرز مستوردة ماستر كواليتي وإكسسوارات شبابية تجمع بين الفخامة والراحة والسعر العادل في متناول الجميع، بدون مبالغة أو استغلال.
          </p>
        </div>
      </section>

      {/* Pillars Grid */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-3xl bg-zinc-900/70 border border-zinc-800/80 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-200 border border-zinc-700">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-white">خامات أصلية 100%</h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              نختار خاماتنا بعناية فائقة: أقطان مصرية فاخرة بنسبة 100% للملابس والملابس الداخلية، تقفيل خياطة متين، وسنيكرز مريحة وعالية التحمل تناسب الاستخدام اليومي الشاق.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-zinc-900/70 border border-zinc-800/80 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-200 border border-zinc-700">
              <RefreshCw className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-lg font-black text-white">استبدال واسترجاع في نفس اليوم</h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              المقاس مش مظبوط أو حابب تبدل لون؟ نوفر لك أسهل وأسرع سياسة استبدال واسترجاع فورية في نفس اليوم بدون أي تعقيدات أو إجراءات روتينية.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-zinc-900/70 border border-zinc-800/80 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-200 border border-zinc-700">
              <Store className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-lg font-black text-white">فروع على أرض الواقع</h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              لسنا مجرد متجر إلكتروني، بل نتواجد على أرض الواقع بـ 3 فروع رئيسية في محافظة السويس تتيح لك المعاينة والتجربة والاستلام المباشر بكل ثقة.
            </p>
          </div>

        </div>
      </section>

      {/* Branches Locations */}
      <section className="py-12 bg-zinc-900/50 border-y border-zinc-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-white">فروعنا الرسمية في محافظة السويس</h2>
            <p className="text-xs text-zinc-400 mt-1">نسعد باستقبالكم يومياً من الساعة 12 ظهراً وحتى 12 منتصف الليل</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-white font-black text-sm">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>فرع الكورنيش القديم</span>
              </div>
              <p className="text-xs text-zinc-400">
                بجوار منتجع فينا، أمام نادي أبناء السويس مباشرة.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-white font-black text-sm">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>فرع شارع الرخاوي</span>
              </div>
              <p className="text-xs text-zinc-400">
                شارع الرخاوي الجديد، بجوار محل فيونكة.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-white font-black text-sm">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>فرع ميني زيكو (MINI ZEKO)</span>
              </div>
              <p className="text-xs text-zinc-400">
                أول يمين من شارع الرخاوي الجديد.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Official Links & CTA */}
      <section className="py-16 text-center max-w-4xl mx-auto px-4">
        <h3 className="text-xl sm:text-2xl font-black text-white mb-3">
          عايز تسأل عن أي موديل أو تطلب أوردر؟
        </h3>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto mb-6">
          فريق خدمة العملاء والإدارة في زيكو ستور متاح طوال أيام الأسبوع للرد السريع عبر الواتساب ومتابعة طلبك خطوة بخطوة.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="https://wa.me/201070091692"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-md transition"
          >
            <MessageSquare className="w-4 h-4" />
            <span>تواصل عبر الواتساب (01070091692)</span>
          </a>

          <a
            href="https://www.facebook.com/ZeKko17"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold text-xs sm:text-sm transition"
          >
            <ExternalLink className="w-4 h-4" />
            <span>صفحة الفيسبوك (81K متابع)</span>
          </a>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-6 border-t border-zinc-900 text-center text-xs text-zinc-500">
        جميع الحقوق محفوظة © {new Date().getFullYear()} متجر زيكو ستور (ZeKo Store) - برند الغلابة.
      </footer>

    </div>
  );
}
