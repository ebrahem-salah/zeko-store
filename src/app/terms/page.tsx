'use client';

import React from 'react';
import Link from 'next/link';
import { RefreshCw, FileText, CheckCircle2, AlertTriangle, ArrowRight, Truck } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function TermsAndReturnsPage() {
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
              <span className="text-[10px] text-zinc-400">الشروط وسياسة الاستبدال</span>
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

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
        
        <div className="space-y-3 border-b border-zinc-800 pb-8 text-center sm:text-right">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            <RefreshCw className="w-4 h-4" />
            <span>استبدال واسترجاع في نفس اليوم</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white">الشروط والأحكام وسياسة الاستبدال والاسترجاع</h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            أنت في زيكو ستور في أمان تام • المعاينة وحق التبديل مكفولان لك بكل سهولة وبدون أي تعقيد.
          </p>
        </div>

        {/* Section 1: Exchange & Return Policy */}
        <section className="space-y-4">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-emerald-400" />
            <span>1. سياسة الاستبدال والاسترجاع (في نفس اليوم)</span>
          </h2>
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              إذا استلمت المنتج ووجدت أن المقاس غير مضبوط، أو أردت استبدال اللون أو الموديل، يمكنك الاستبدال في نفس اليوم عبر:
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-zinc-400 list-disc list-inside mr-2">
              <li><strong>الاستبدال المباشر من الفروع:</strong> شرفنا بزيارة أي من فروعنا الـ 3 بمحافظة السويس (الكورنيش القديم، شارع الرخاوي، ميني زيكو) مع إحضار الفاتورة أو رقم الأوردر، وسيتم استبدال المقاس فوراً في ثوانٍ معدودة.</li>
              <li><strong>الاستبدال عبر مندوب الشحن:</strong> تواصل معنا عبر الواتساب وسنقوم بإرسال المندوب بالمقاس البديل في أسرع وقت.</li>
            </ul>
          </div>
        </section>

        {/* Section 2: Inspection before payment */}
        <section className="space-y-4">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-zinc-300" />
            <span>2. المعاينة وفحص المنتج قبل الدفع</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            من حقك الكامل عند وصول مندوب التوصيل أن تقوم بفتح الشحنة وفحص المنتج والتأكد من مطابقة الخامة والموديل للصور المعروضة قبل دفع قيمة الأوردر، وذلك لضمان راحة بالك وثقتك التامة في ما تشتريه من زيكو ستور.
          </p>
        </section>

        {/* Section 3: Conditions for Return */}
        <section className="space-y-4">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>3. شروط قبول الاستبدال والاسترجاع</span>
          </h2>
          <ul className="space-y-2 text-xs sm:text-sm text-zinc-300 list-disc list-inside mr-2">
            <li>أن يكون المنتج في حالته الأصلية الجديدة تماماً وغير مستعمل.</li>
            <li>وجود تيكت المنتج والغلاف الأصلي سليمين.</li>
            <li>الملابس الداخلية والجوارب غير قابلة للاسترجاع أو الاستبدال بعد فتح غلافها حرصاً على الصحة والسلامة العامة للجميع وفقاً للمعايير الصحية.</li>
          </ul>
        </section>

        {/* Section 4: Prices & Orders */}
        <section className="space-y-4">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-zinc-300" />
            <span>4. وضوح الأسعار والطلبات</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            جميع الأسعار المعروضة على المتجر واضحة بالجنيه المصري (ج.م) وشاملة لكافة التفاصيل دون أي مصاريف خفية. نحن نرفع شعار <strong>"برند الغلابة"</strong> ملتزمين بتقديم أرقى الموديلات العالمية بأعدل وأنسب سعر في السوق المصري.
          </p>
        </section>

        {/* Support Banner */}
        <section className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-white text-sm">محتاج مساعدة فورية بخصوص أوردرك؟</h4>
            <p className="text-xs text-zinc-400 mt-1">تواصل مباشرة مع خدمة العملاء والإدارة</p>
          </div>
          <a
            href="https://wa.me/201070091692"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shrink-0"
          >
            تواصل على الواتساب (01070091692)
          </a>
        </section>

      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-zinc-900 text-center text-xs text-zinc-500">
        جميع الحقوق محفوظة © {new Date().getFullYear()} متجر زيكو ستور (ZeKo Store) - برند الغلابة.
      </footer>

    </div>
  );
}
