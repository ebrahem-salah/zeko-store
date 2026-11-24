import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { dbConnect } from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'غير مصرح لك بالوصول (يتطلب صلاحية مدير).' }, { status: 403 });
    }

    await dbConnect();

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isBlocked: false });
    const blockedUsers = await User.countDocuments({ isBlocked: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });

    // Users joined in last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        blockedUsers,
        adminUsers,
        newUsers,
      },
    });
  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ success: false, message: 'خطأ في جلب الإحصائيات.' }, { status: 500 });
  }
}
