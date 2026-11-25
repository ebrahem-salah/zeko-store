import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Product from '@/models/Product';
import Warehouse from '@/models/Warehouse';
import Order from '@/models/Order';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || !['admin', 'manager'].includes(session.role)) {
      return NextResponse.json({ success: false, message: 'غير مصرح لك بالوصول (يتطلب صلاحية مدير أو مشرف).' }, { status: 403 });
    }

    await dbConnect();

    const [
      totalUsers,
      activeUsers,
      blockedUsers,
      adminUsers,
      managerUsers,
      totalProducts,
      totalWarehouses,
      totalOrders,
      products,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isBlocked: false }),
      User.countDocuments({ isBlocked: true }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'manager' }),
      Product.countDocuments(),
      Warehouse.countDocuments(),
      Order.countDocuments().catch(() => 0),
      Product.find({}, 'totalStock minStockAlert'),
    ]);

    const totalStockPieces = products.reduce((acc, p) => acc + (p.totalStock || 0), 0);
    const lowStockCount = products.filter((p) => (p.totalStock || 0) <= (p.minStockAlert || 5)).length;

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
        managerUsers,
        newUsers,
        totalProducts,
        totalWarehouses,
        totalStockPieces,
        lowStockCount,
        totalOrders,
      },
    });
  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ success: false, message: 'خطأ في جلب الإحصائيات.' }, { status: 500 });
  }
}
