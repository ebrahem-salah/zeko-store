import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { dbConnect } from '@/lib/dbConnect';
import User from '@/models/User';

// 1. GET: Fetch users list with search & filter
export async function GET(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'غير مصرح لك بالوصول.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role');
    const status = searchParams.get('status');

    await dbConnect();

    const query: any = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role && role !== 'all') {
      query.role = role;
    }

    if (status === 'blocked') {
      query.isBlocked = true;
    } else if (status === 'active') {
      query.isBlocked = false;
    }

    const users = await User.find(query).sort({ createdAt: -1 }).limit(100);

    return NextResponse.json({
      success: true,
      users: users.map((u) => ({
        id: u._id,
        name: `${u.firstName} ${u.lastName}`,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        role: u.role,
        isBlocked: u.isBlocked,
        avatar: u.avatar,
        createdAt: u.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Admin users error:', error);
    return NextResponse.json({ success: false, message: 'خطأ في جلب المستخدمين.' }, { status: 500 });
  }
}

// 2. PATCH: Update user role or toggle block status
export async function PATCH(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'غير مصرح لك بالوصول.' }, { status: 403 });
    }

    const { userId, isBlocked, role } = await req.json();

    if (!userId) {
      return NextResponse.json({ success: false, message: 'معرف المستخدم مطلوب.' }, { status: 400 });
    }

    // Protect self-block / self-demotion
    if (userId === session.userId && isBlocked === true) {
      return NextResponse.json({ success: false, message: 'لا يمكنك حظر حسابك الشخصي الحالي.' }, { status: 400 });
    }

    await dbConnect();

    const updateData: any = {};
    if (typeof isBlocked === 'boolean') updateData.isBlocked = isBlocked;
    if (role && ['user', 'admin'].includes(role)) updateData.role = role;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

    if (!updatedUser) {
      return NextResponse.json({ success: false, message: 'المستخدم غير موجود.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'تم تحديث بيانات المستخدم بنجاح.',
      user: {
        id: updatedUser._id,
        name: `${updatedUser.firstName} ${updatedUser.lastName}`,
        role: updatedUser.role,
        isBlocked: updatedUser.isBlocked,
      },
    });
  } catch (error: any) {
    console.error('Admin update user error:', error);
    return NextResponse.json({ success: false, message: 'خطأ في تعديل المستخدم.' }, { status: 500 });
  }
}
