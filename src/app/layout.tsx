import type { Metadata, Viewport } from 'next';
import './globals.css';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f59e0b' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'متجر زيكو ستور | ZeKo Store - ملابس رجالي، كوتشيات، شنط وإكسسوارات',
  description: 'المتجر الإلكتروني لـ زيكو ستور (ZeKo Store) - أحدث صيحات الموضة الرجالي، هوديز، سنيكرز ماستر كواليتي، شنط كروس، كابات، وجوارب وملابس داخلية قطن 100%. معاينة قبل الدفع وشحن لجميع محافظات مصر.',
  keywords: ['زيكو ستور', 'ZeKo Store', 'ملابس رجالي', 'كوتشيات', 'سنيكرز', 'شنط رجالي', 'كابات', 'شربات', 'ملابس داخلية قطن', 'تسوق اونلاين مصر'],
  manifest: '/manifest.webmanifest',
  openGraph: {
    title: 'متجر زيكو ستور | ZeKo Store',
    description: 'أقوى كولكشن ملابس رجالي، سنيكرز، شنط وإكسسوارات مع معاينة قبل الاستلام وشحن سريع.',
    url: 'https://zeko.ebnywep.com',
    siteName: 'ZeKo Store',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=1200&h=630&fit=crop&q=80',
        width: 1200,
        height: 630,
        alt: 'ZeKo Store Fashion Collection',
      },
    ],
    locale: 'ar_EG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'متجر زيكو ستور | ZeKo Store',
    description: 'أقوى كولكشن ملابس رجالي وسنيكرز في مصر.',
    images: ['https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=1200&h=630&fit=crop&q=80'],
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans antialiased selection:bg-amber-500 selection:text-slate-950">
        {children}
        <PWAInstallPrompt />
      </body>
    </html>
  );
}
