import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { dbConnect } from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ success: false, message: 'البريد الإلكتروني ورمز التحقق مطلوبان.' }, { status: 400 });
    }

    await dbConnect();

    const hashedOtp = crypto.createHash('sha256').update(otp.trim()).digest('hex');

    const user = await User.findOne({
      email: email.toLowerCase(),
      otpCode: hashedOtp,
      otpExpires: { $gt: new Date() },
    }).select('+otpCode +otpExpires');

    if (!user) {
      return NextResponse.json({ success: false, message: 'رمز التحقق غير صحيح أو انتهت صلاحيته.' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'تم التحقق من الرمز بنجاح. يمكنك الآن تعيين كلمة مرور جديدة.',
    });
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في الخادم أثناء التحقق.' }, { status: 500 });
  }
}
