import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { getSessionUser } from '@/lib/auth';
import SiteSettings from '@/models/SiteSettings';
import { z } from 'zod';

const UpdateSettingsSchema = z.object({
  siteName: z.string().trim().min(2),
  siteNameEn: z.string().trim().min(2).optional(),
  siteDescription: z.string().trim().optional(),
  siteDescriptionEn: z.string().trim().optional(),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'كود اللون غير صحيح'),
  secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'كود اللون غير صحيح').optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  whatsappNumber: z.string().optional(),
  facebookUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  currency: z.string().optional(),
  enableRegistration: z.boolean().optional(),
  enableGoogleAuth: z.boolean().optional(),
});

export async function PUT(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'غير مصرح لك بتعديل إعدادات الموقع.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = UpdateSettingsSchema.parse(body);

    await dbConnect();

    let settings = await SiteSettings.findOne();

    if (!settings) {
      settings = await SiteSettings.create(validatedData);
    } else {
      Object.assign(settings, validatedData);
      await settings.save();
    }

    return NextResponse.json({
      success: true,
      message: 'تم تحديث إعدادات وهوية الموقع بنجاح! ✨',
      settings,
    });
  } catch (error: any) {
    console.error('Failed to update settings:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.issues[0]?.message || 'بيانات غير صالحة' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'تعذر حفظ الإعدادات، يرجى المحاولة مرة أخرى.' },
      { status: 500 }
    );
  }
}
