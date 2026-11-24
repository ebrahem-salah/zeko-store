import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import User from '@/models/User';
import { signToken, setAuthCookie } from '@/lib/auth';
import { OAuth2Client } from 'google-auth-library';

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const client = new OAuth2Client(googleClientId);

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json({ success: false, message: 'رمز Google ID Token غير موجود.' }, { status: 400 });
    }

    // Verify token with Google
    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: googleClientId,
      });
      payload = ticket.getPayload();
    } catch (e: any) {
      // In local dev without real google client id, allow mock or reject
      console.warn('Google verify warning:', e.message);
      return NextResponse.json({ success: false, message: 'فشل في التحقق من حساب Google.' }, { status: 401 });
    }

    if (!payload || !payload.email) {
      return NextResponse.json({ success: false, message: 'بيانات حساب Google غير مكتملة.' }, { status: 400 });
    }

    await dbConnect();

    // Find or create user
    let user = await User.findOne({ email: payload.email.toLowerCase() });

    if (!user) {
      const nameParts = (payload.name || 'مستخدم جديد').split(' ');
      const firstName = nameParts[0] || 'مستخدم';
      const lastName = nameParts.slice(1).join(' ') || 'Google';

      user = await User.create({
        firstName,
        lastName,
        email: payload.email.toLowerCase(),
        googleId: payload.sub,
        avatar: payload.picture || '',
        role: 'user',
      });
    }

    if (user.isBlocked) {
      return NextResponse.json({ success: false, message: 'هذا الحساب محظور.' }, { status: 403 });
    }

    const token = signToken({
      userId: String((user as any)._id),
      email: user.email,
      role: user.role,
      name: `${user.firstName} ${user.lastName}`,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      message: 'تم تسجيل الدخول بواسطة Google بنجاح!',
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Google Auth Error:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ أثناء الاتصال بجوجل.' }, { status: 500 });
  }
}
