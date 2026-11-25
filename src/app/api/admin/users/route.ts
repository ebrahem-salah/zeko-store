import { NextResponse } from 'next/server';
import { getSessionUser, hashPassword } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

// 1. GET: Fetch users list with search & filter
export async function GET(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || !['admin', 'manager'].includes(session.role)) {
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
        { phone: { $regex: search, $options: 'i' } },
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
        phone: u.phone || '',
        role: u.role,
        permissions: u.permissions || [],
        assignedWarehouse: u.assignedWarehouse || '',
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

// 2. POST: Create a new user / manager / admin directly from admin panel
export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'فقط المدير العام (Admin) يمكنه إضافة مستخدمين أو مشرفين جدد.' }, { status: 403 });
    }

    const body = await req.json();
    const { firstName, lastName, email, password, phone, role, permissions, assignedWarehouse } = body;

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ success: false, message: 'الاسم والبريد وكلمة المرور مطلوبة.' }, { status: 400 });
    }

    await dbConnect();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ success: false, message: 'البريد الإلكتروني مسجل بالفعل لمستخدم آخر.' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone || '',
      role: role && ['user', 'manager', 'admin'].includes(role) ? role : 'user',
      permissions: permissions || [],
      assignedWarehouse: assignedWarehouse || '',
      isBlocked: false,
    });

    return NextResponse.json({
      success: true,
      message: 'تم إضافة المستخدم / المشرف بنجاح.',
      user: {
        id: newUser._id,
        name: `${newUser.firstName} ${newUser.lastName}`,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error: any) {
    console.error('Admin create user error:', error);
    return NextResponse.json({ success: false, message: error.message || 'خطأ في إنشاء الحساب.' }, { status: 500 });
  }
}

// 3. PATCH: Update user role, permissions, assigned warehouse, or block status
export async function PATCH(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'غير مصرح لك بتعديل الصلاحيات.' }, { status: 403 });
    }

    const { userId, isBlocked, role, permissions, assignedWarehouse, phone } = await req.json();

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
    if (role && ['user', 'manager', 'admin'].includes(role)) updateData.role = role;
    if (Array.isArray(permissions)) updateData.permissions = permissions;
    if (assignedWarehouse !== undefined) updateData.assignedWarehouse = assignedWarehouse;
    if (phone !== undefined) updateData.phone = phone;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

    if (!updatedUser) {
      return NextResponse.json({ success: false, message: 'المستخدم غير موجود.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'تم تحديث بيانات وصلاحيات المستخدم بنجاح.',
      user: {
        id: updatedUser._id,
        name: `${updatedUser.firstName} ${updatedUser.lastName}`,
        email: updatedUser.email,
        role: updatedUser.role,
        permissions: updatedUser.permissions,
        assignedWarehouse: updatedUser.assignedWarehouse,
        isBlocked: updatedUser.isBlocked,
      },
    });
  } catch (error: any) {
    console.error('Admin update user error:', error);
    return NextResponse.json({ success: false, message: 'خطأ في تعديل المستخدم.' }, { status: 500 });
  }
}
