import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import StockMovement from '@/models/StockMovement';
import Warehouse from '@/models/Warehouse';

export async function GET(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || !['admin', 'manager'].includes(session.role)) {
      return NextResponse.json({ success: false, message: 'غير مصرح لك بالوصول.' }, { status: 403 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const warehouseCode = searchParams.get('warehouse');
    const lowStockOnly = searchParams.get('lowStock') === 'true';
    const search = searchParams.get('search') || '';

    const filter: any = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { categoryAr: { $regex: search, $options: 'i' } },
      ];
    }

    if (lowStockOnly) {
      filter.totalStock = { $lte: 10 };
    }

    const products = await Product.find(filter).sort({ totalStock: 1 });
    const warehouses = await Warehouse.find({ isActive: true });
    const recentMovements = await StockMovement.find({}).sort({ createdAt: -1 }).limit(20);

    // Calculate aggregated inventory stats
    const totalInventoryPieces = products.reduce((acc, p) => acc + (p.totalStock || 0), 0);
    const lowStockCount = products.filter((p) => (p.totalStock || 0) <= (p.minStockAlert || 5)).length;

    return NextResponse.json({
      success: true,
      stats: {
        totalProducts: products.length,
        totalPieces: totalInventoryPieces,
        lowStockCount,
        warehousesCount: warehouses.length,
      },
      products: products.map((p) => ({
        id: p._id,
        code: p.code,
        title: p.title,
        categoryAr: p.categoryAr,
        price: p.price,
        image: p.images[0] || '',
        totalStock: p.totalStock || 40,
        minStockAlert: p.minStockAlert || 5,
        inStock: p.inStock,
        warehouseStock: p.warehouseStock || [],
      })),
      recentMovements,
    });
  } catch (error: any) {
    console.error('Fetch inventory error:', error);
    return NextResponse.json({ success: false, message: 'خطأ في جلب بيانات المخزون والجرد.' }, { status: 500 });
  }
}

// Adjust or Add stock (توريد بضاعة أو تسوية جرد)
export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || !['admin', 'manager'].includes(session.role)) {
      return NextResponse.json({ success: false, message: 'غير مصرح لك بتعديل المخزون.' }, { status: 403 });
    }

    const body = await req.json();
    const { productCode, warehouseCode, quantity, type, reason } = body;

    if (!productCode || !warehouseCode || !quantity) {
      return NextResponse.json({ success: false, message: 'بيانات العملية غير مكتملة.' }, { status: 400 });
    }

    await dbConnect();

    const product = await Product.findOne({ code: productCode });
    if (!product) {
      return NextResponse.json({ success: false, message: 'المنتج غير موجود.' }, { status: 404 });
    }

    const warehouse = await Warehouse.findOne({ code: warehouseCode });
    const warehouseName = warehouse ? warehouse.name : warehouseCode;

    // Find warehouse stock index or push new
    if (!product.warehouseStock) product.warehouseStock = [];
    const whIndex = product.warehouseStock.findIndex((w: any) => w.warehouseCode === warehouseCode);

    const changeQty = Number(quantity);

    if (type === 'in') {
      if (whIndex > -1) {
        product.warehouseStock[whIndex].quantity += changeQty;
      } else {
        product.warehouseStock.push({ warehouseCode, warehouseName, quantity: changeQty });
      }
      product.totalStock = (product.totalStock || 0) + changeQty;
    } else if (type === 'out') {
      if (whIndex > -1) {
        if (product.warehouseStock[whIndex].quantity < changeQty) {
          return NextResponse.json({ success: false, message: 'الكمية المطلوبة أكبر من الرصيد المتوفر في هذا المخزن.' }, { status: 400 });
        }
        product.warehouseStock[whIndex].quantity -= changeQty;
      } else {
        return NextResponse.json({ success: false, message: 'لا يوجد رصيد لهذا المنتج في هذا المخزن.' }, { status: 400 });
      }
      product.totalStock = Math.max(0, (product.totalStock || 0) - changeQty);
    } else {
      // adjustment: set exact quantity
      if (whIndex > -1) {
        product.warehouseStock[whIndex].quantity = changeQty;
      } else {
        product.warehouseStock.push({ warehouseCode, warehouseName, quantity: changeQty });
      }
      // recalculate total
      product.totalStock = product.warehouseStock.reduce((acc: number, w: any) => acc + (w.quantity || 0), 0);
    }

    product.inStock = (product.totalStock || 0) > 0;
    await product.save();

    // Log movement
    await StockMovement.create({
      type: type || 'adjustment',
      productCode: product.code,
      productTitle: product.title,
      toWarehouse: warehouseName,
      quantity: changeQty,
      reason: reason || (type === 'in' ? 'توريد بضاعة جديدة' : 'صرف / تسوية جرد'),
      performedBy: session.name || session.email || 'مسؤول المخزن',
    });

    return NextResponse.json({
      success: true,
      message: 'تم تحديث رصيد المخزن وتسجيل الحركة بنجاح.',
      product: {
        code: product.code,
        totalStock: product.totalStock,
        warehouseStock: product.warehouseStock,
      },
    });
  } catch (error: any) {
    console.error('Adjust stock error:', error);
    return NextResponse.json({ success: false, message: error.message || 'خطأ في تعديل المخزون.' }, { status: 500 });
  }
}
