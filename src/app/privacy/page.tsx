'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, EyeOff, Server, ArrowRight, CheckCircle2 } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function PrivacyPolicyPage() {
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
              <span className="text-[10px] text-zinc-400">سياسة الخصوصية والأمان</span>
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
            <ShieldCheck className="w-4 h-4" />
            <span>بياناتك في أمان تام بنسبة 100%</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white">سياسة الخصوصية وحماية البيانات</h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            آخر تحديث: {new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-4">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-zinc-300" />
            <span>1. التزامنا بحماية خصوصيتك</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            في متجر <strong>زيكو ستور (ZeKo Store)</strong>، ندرك تماماً أهمية خصوصية وسرية بيانات عملائنا. نحرص على تطبيق أعلى المعايير الأمنية لضمان حماية معلوماتك الشخصية وسرية تعاملاتك معنا.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <EyeOff className="w-5 h-5 text-zinc-300" />
            <span>2. البيانات التي نقوم بجمعها</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            نقوم بجمع البيانات الضرورية فقط واللازمة لإتمام عملية الشراء وتوصيل الطلبات إليك بدقة:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-zinc-300 list-disc list-inside mr-2">
            <li><strong>الاسم ورقم الهاتف:</strong> للتواصل وتأكيد موعد استلام الشحنة وتتبع الأوردر.</li>
            <li><strong>العنوان والمدينة:</strong> لتسليم المنتجات إلى باب منزلك أو تحديد الفرع الأنسب للاستلام.</li>
            <li><strong>تفاصيل الطلب:</strong> الموديلات، المقاسات، والألوان المطلوبة لتجهيزها من المخازن.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-zinc-300" />
            <span>3. أمان السيرفر وتشفير الاتصال</span>
          </h2>
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>تشفير كامل للاتصال بنظام SSL / HTTPS</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              جميع الاتصالات مع موقع <code>zeko.ebnywep.com</code> مشفرة بواسطة أحدث شهادات الأمان (HTTPS / TLS 1.3). كما نستخدم جدران حماية برمجية وخوارزميات أمان دقيقة تمنع أي وصول غير مصرح به أو استنزاف لموارد الخادم.
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-4">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-zinc-300" />
            <span>4. عدم مشاركة البيانات مع أطراف ثالثة</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            نلتزم بشكل قاطع بعدم بيع، تأجير، أو مشاركة بياناتك أو رقم هاتفك مع أي شركات تسويق، أو أطراف إعلانية خارجية. يتم استخدام بياناتك حصرياً داخل فريق عمل زيكو ستور لخدمتك وإتمام طلباتك.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-4">
          <h2 className="text-lg font-black text-white">5. الدفع عند الاستلام والمعاينة</h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            نحن لا نطلب منك أي أرقام بطاقات ائتمانية أو بيانات بنكية حساسة عبر الموقع. الدفع يتم بنظام <strong>الدفع عند الاستلام (Cash on Delivery)</strong> بعد معاينة المنتج وفحصه للتأكد من المقاس والجودة.
          </p>
        </section>

        {/* Contact info */}
        <section className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-3">
          <h3 className="font-bold text-white text-sm">لديك استفسار حول الخصوصية؟</h3>
          <p className="text-xs text-zinc-400">
            يمكنك التواصل مباشرة مع إدارة زيكو ستور عبر الواتساب على الرقم: <span className="font-mono text-zinc-200 font-bold">01070091692</span> أو الاتصال بخدمة العملاء: <span className="font-mono text-zinc-200 font-bold">01096986091</span>.
          </p>
        </section>

      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-zinc-900 text-center text-xs text-zinc-500">
        جميع الحقوق محفوظة © {new Date().getFullYear()} متجر زيكو ستور (ZeKo Store) - برند الغلابة.
      </footer>

    </div>
  );
}
