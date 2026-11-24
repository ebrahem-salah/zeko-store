import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import User from '@/models/User';
import { hashPassword, signToken, setAuthCookie } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/email';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { SignupSchema } from '@/lib/validations/auth';

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting Protection (5 signups per 10 mins per IP)
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(`signup_${clientIp}`, {
      intervalMs: 10 * 60 * 1000,
      maxRequests: 5,
    });

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `تجاوزت الحد المسموح من المحاولات. يرجى الانتظار ${rateCheck.resetInSeconds} ثانية قبل المحاولة مجدداً.`,
        },
        { status: 429 }
      );
    }

    // 2. Input Validation with Zod
    const body = await req.json();
    const parseResult = SignupSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, message: parseResult.error.issues[0]?.message || 'بيانات التسجيل غير صالحة' },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, password } = parseResult.data;

    // 3. Connect DB
    await dbConnect();

    // 4. Check existing user
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'هذا البريد الإلكتروني مسجل بالفعل.' },
        { status: 400 }
      );
    }

    // 5. Hash password & create user
    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: 'user',
    });

    // 6. Send welcome email in background
    sendWelcomeEmail(user.email, `${user.firstName} ${user.lastName}`).catch(console.error);

    // 7. Sign JWT & Set HTTP-Only Cookie
    const token = signToken({
      userId: String((user as any)._id),
      email: user.email,
      role: user.role,
      name: `${user.firstName} ${user.lastName}`,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح! مرحباً بك 🚀',
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في الخادم أثناء إنشاء الحساب.' },
      { status: 500 }
    );
  }
}
