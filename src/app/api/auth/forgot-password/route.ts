import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { dbConnect } from '@/lib/dbConnect';
import User from '@/models/User';
import { sendOtpEmail } from '@/lib/email';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { ForgotPasswordSchema } from '@/lib/validations/auth';

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting Protection (3 OTP requests per 10 mins per IP)
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(`otp_${clientIp}`, {
      intervalMs: 10 * 60 * 1000,
      maxRequests: 3,
    });

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `تجاوزت الحد المسموح لطلب رمز التحقق. يرجى الانتظار ${rateCheck.resetInSeconds} ثانية قبل إعادة المحاولة.`,
        },
        { status: 429 }
      );
    }

    // 2. Input Validation with Zod
    const body = await req.json();
    const parseResult = ForgotPasswordSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, message: parseResult.error.issues[0]?.message || 'بريد إلكتروني غير صالح' },
        { status: 400 }
      );
    }

    const { email } = parseResult.data;

    await dbConnect();

    const user = await User.findOne({ email });
    if (!user) {
      // Don't leak whether user exists for security, return friendly message
      return NextResponse.json({
        success: true,
        message: 'إذا كان البريد الإلكتروني مسجلاً لدينا، فستصلك رسالة تحتوي على رمز التحقق خلال لحظات.',
      });
    }

    // Generate 6-digit numeric OTP
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash('sha256').update(rawOtp).digest('hex');

    // Save hashed OTP & 10 mins expiry to database
    user.otpCode = hashedOtp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save({ validateBeforeSave: false });

    // Send Email
    const emailResult = await sendOtpEmail(user.email, user.firstName, rawOtp);

    return NextResponse.json({
      success: true,
      message: 'تم إرسال رمز التحقق المكون من 6 أرقام إلى بريدك الإلكتروني بنجاح.',
      testOtp: emailResult.testMode ? rawOtp : undefined,
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في الخادم أثناء إرسال الرمز.' },
      { status: 500 }
    );
  }
}
