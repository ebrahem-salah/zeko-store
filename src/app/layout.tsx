import type { Metadata, Viewport } from 'next';
import './globals.css';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f4f5' },
    { media: '(prefers-color-scheme: dark)', color: '#121214' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://zeko.ebnywep.com'),
  title: 'زيكو ستور | ZeKo Store - برند الغلابة (السوق مش نايم.. انت اللي نايم)',
  description: 'المتجر الرسمي لـ زيكو ستور (ZeKo Store) - برند الغلابة. أحدث صيحات الموضة الرجالي، هوديز، سنيكرز ماستر كواليتي، شنط كروس، كابات، وجوارب قطن 100%. فروعنا بالسويس مع ميزة الاستبدال والاسترجاع في نفس اليوم.',
  keywords: ['زيكو ستور', 'ZeKo Store', 'السوق مش نايم انت اللي نايم', 'برند الغلابة', 'ملابس رجالي السويس', 'سنيكرز ماستر كواليتي', 'هوديز أوفر سايز', 'تسوق اونلاين'],
  manifest: '/manifest.webmanifest',
  openGraph: {
    title: 'زيكو ستور | ZeKo Store - برند الغلابة',
    description: 'السوق مش نايم.. انت اللي نايم 🫵🏻 أقوى كولكشن ملابس رجالي وسنيكرز مع استبدال واسترجاع في نفس اليوم.',
    url: 'https://zeko.ebnywep.com',
    siteName: 'ZeKo Store',
    images: [
      {
        url: '/images/cover.jpg',
        width: 1200,
        height: 630,
        alt: 'ZeKo Store - What Men Need',
      },
    ],
    locale: 'ar_EG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'زيكو ستور | ZeKo Store - برند الغلابة',
    description: 'السوق مش نايم.. انت اللي نايم 🫵🏻 أقوى كولكشن ملابس وسنيكرز.',
    images: ['/images/cover.jpg'],
  },
  icons: {
    icon: '/images/logo.jpg',
    apple: '/images/logo.jpg',
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
      <body className="bg-[#f4f4f5] text-zinc-900 dark:bg-[#121214] dark:text-zinc-100 font-sans antialiased selection:bg-zinc-800 selection:text-white dark:selection:bg-zinc-200 dark:selection:text-zinc-900">
        {children}
        <PWAInstallPrompt />
      </body>
    </html>
  );
}
