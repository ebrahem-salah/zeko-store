import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { dbConnect } from '@/lib/dbConnect';
import User from '@/models/User';
import { uploadFile } from '@/lib/storage';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
];

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'يجب تسجيل الدخول لرفع الملفات.' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const isAvatar = formData.get('isAvatar') === 'true';

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'لم يتم اختيار أي ملف للرفع.' },
        { status: 400 }
      );
    }

    // 1. Validate File Size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: 'حجم الملف يتجاوز الحد المسموح (5 ميجابايت كحد أقصى).' },
        { status: 400 }
      );
    }

    // 2. Validate MIME Type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'نوع الملف غير مدعوم. يرجى اختيار صورة (JPG, PNG, WebP) أو مستند PDF.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. Upload via Storage Adapter (Cloudinary or Local)
    const result = await uploadFile(buffer, file.name, file.type, isAvatar ? 'avatars' : 'uploads');

    // 4. If avatar upload, update user profile in DB
    if (isAvatar && session.userId) {
      await dbConnect();
      await User.findByIdAndUpdate(session.userId, { avatar: result.url });
    }

    return NextResponse.json({
      success: true,
      message: 'تم رفع الملف بنجاح! ✨',
      url: result.url,
      fileName: result.filename,
      size: result.size,
      mimeType: file.type,
      provider: result.provider,
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في الخادم أثناء رفع الملف.' },
      { status: 500 }
    );
  }
}
