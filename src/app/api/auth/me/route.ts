import { NextResponse } from 'next/server';
import { getSessionUser, hashPassword } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();

    // Auto-seed default Super Admin if none exists in database
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      const hashedPassword = await hashPassword('Admin@123456');
      await User.create({
        firstName: 'إبراهيم',
        lastName: 'زيكو',
        email: 'admin@zeko.com',
        password: hashedPassword,
        phone: '01070091692',
        role: 'admin',
        permissions: ['all', 'manage_warehouses', 'manage_inventory', 'manage_orders', 'manage_users', 'manage_products'],
        isBlocked: false,
      });
      console.log('Default super admin created: admin@zeko.com / Admin@123456');
    }

    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const user = await User.findById(session.userId);

    if (!user || user.isBlocked) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        permissions: user.permissions || [],
        assignedWarehouse: user.assignedWarehouse || '',
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Auth me error:', error);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}
