import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { dbConnect } from '@/lib/dbConnect';
import User from '@/models/User';
import { hashPassword, validatePasswordStrength, signToken, setAuthCookie } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ success: false, message: 'جميع الحقول مطلوبة.' }, { status: 400 });
    }

    // 1. Password strength validation
    const strength = validatePasswordStrength(newPassword);
    if (!strength.isValid) {
      return NextResponse.json({ success: false, message: strength.message }, { status: 400 });
    }

    await dbConnect();

    const hashedOtp = crypto.createHash('sha256').update(otp.trim()).digest('hex');

    const user = await User.findOne({
      email: email.toLowerCase(),
      otpCode: hashedOtp,
      otpExpires: { $gt: new Date() },
    }).select('+password +otpCode +otpExpires');

    if (!user) {
      return NextResponse.json({ success: false, message: 'رمز التحقق غير صالح أو انتهت صلاحيته.' }, { status: 400 });
    }

    // 2. Hash new password and reset OTP
    user.password = await hashPassword(newPassword);
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    // 3. Auto login user with new session
    const token = signToken({
      userId: String((user as any)._id),
      email: user.email,
      role: user.role,
      name: `${user.firstName} ${user.lastName}`,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح وتم تسجيل دخولك تلقائياً!',
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في الخادم أثناء إعادة التعيين.' }, { status: 500 });
  }
}
