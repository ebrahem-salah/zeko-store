import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import SiteSettings from '@/models/SiteSettings';

export async function GET() {
  try {
    await dbConnect();

    let settings: any = await SiteSettings.findOne().lean();

    if (!settings) {
      // Create initial default settings
      settings = await SiteSettings.create({
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
    }

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('Failed to fetch site settings:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'تعذر جلب إعدادات الموقع.',
        settings: {
          siteName: 'منصتي الذكية',
          siteNameEn: 'My SaaS Platform',
          primaryColor: '#2563eb',
          secondaryColor: '#4f46e5',
          currency: 'ر.س',
        },
      },
      { status: 500 }
    );
  }
}
