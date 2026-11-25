import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { dbConnect } from '@/lib/dbConnect';
import User from '@/models/User';
import { uploadFile } from '@/lib/storage';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB - Strict DoS / server overload prevention
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'يجب تسجيل الدخول لرفع الصور.' },
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

    // 1. Strict File Type Validation (Images ONLY - NO videos, NO documents)
    const fileNameLower = file.name.toLowerCase();
    const fileExtension = fileNameLower.substring(fileNameLower.lastIndexOf('.'));
    const isMimeAllowed = ALLOWED_MIME_TYPES.includes(file.type.toLowerCase());
    const isExtAllowed = ALLOWED_EXTENSIONS.includes(fileExtension);

    if (file.type.startsWith('video/') || fileNameLower.match(/\.(mp4|mov|avi|mkv|webm|wmv|flv|3gp)$/)) {
      return NextResponse.json(
        {
          success: false,
          message: '⛔ ممنوع رفع الفيديوهات نهائياً لحماية سيرفر المتجر وسرعة التصفح. مسموح برفع صور المنتجات فقط (JPG, PNG, WebP).',
        },
        { status: 400 }
      );
    }

    if (!isMimeAllowed || !isExtAllowed) {
      return NextResponse.json(
        {
          success: false,
          message: '⛔ نوع الملف غير مدعوم! مسموح برفع الصور فقط (JPG, PNG, WebP) بحد أقصى 5 ميجابايت، وممنوع رفع أي مستندات أو فيديوهات.',
        },
        { status: 400 }
      );
    }

    // 2. Strict File Size Validation (Max 5MB to prevent server memory exhaustion)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: `⛔ حجم الصورة كبير جداً (${(file.size / (1024 * 1024)).toFixed(1)} ميجابايت). الحد الأقصى المسموح به هو 5 ميجابايت لحماية موارد السيرفر.`,
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. Upload via Storage Adapter (Converts to WebP with Sharp)
    const result = await uploadFile(buffer, file.name, file.type, isAvatar ? 'avatars' : 'uploads');

    // 4. If avatar upload, update user profile in DB
    if (isAvatar && session.userId) {
      await dbConnect();
      await User.findByIdAndUpdate(session.userId, { avatar: result.url });
    }

    return NextResponse.json({
      success: true,
      message: 'تم رفع الصورة وتحويلها تلقائياً إلى صيغة WebP فائقة الخفة والسرعة! ✨',
      url: result.url,
      fileName: result.filename,
      size: result.size,
      mimeType: 'image/webp',
      format: 'webp',
      provider: result.provider,
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'حدث خطأ في الخادم أثناء رفع الملف.' },
      { status: 500 }
    );
  }
}
