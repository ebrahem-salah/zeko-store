import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import User from '@/models/User';
import { comparePassword, signToken, setAuthCookie } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { LoginSchema } from '@/lib/validations/auth';

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting Protection (5 attempts per minute per IP)
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(`login_${clientIp}`, {
      intervalMs: 60 * 1000,
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
    const parseResult = LoginSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, message: parseResult.error.issues[0]?.message || 'بيانات غير صالحة' },
        { status: 400 }
      );
    }

    const { email, password } = parseResult.data;

    await dbConnect();

    // Select password explicitly since select: false
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !user.password) {
      return NextResponse.json(
        { success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' },
        { status: 401 }
      );
    }

    if (user.isBlocked) {
      return NextResponse.json(
        { success: false, message: 'تم حظر هذا الحساب، يرجى التواصل مع الإدارة.' },
        { status: 403 }
      );
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' },
        { status: 401 }
      );
    }

    // Sign JWT & set secure cookie
    const token = signToken({
      userId: String((user as any)._id),
      email: user.email,
      role: user.role,
      name: `${user.firstName} ${user.lastName}`,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح!',
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في الخادم أثناء تسجيل الدخول.' },
      { status: 500 }
    );
  }
}
