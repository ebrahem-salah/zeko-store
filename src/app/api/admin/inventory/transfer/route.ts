import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import StockMovement from '@/models/StockMovement';
import Warehouse from '@/models/Warehouse';

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || !['admin', 'manager'].includes(session.role)) {
      return NextResponse.json({ success: false, message: 'غير مصرح لك بنقل البضاعة بين المخازن.' }, { status: 403 });
    }

    const body = await req.json();
    const { productCode, fromWarehouseCode, toWarehouseCode, quantity, reason } = body;

    if (!productCode || !fromWarehouseCode || !toWarehouseCode || !quantity) {
      return NextResponse.json({ success: false, message: 'يرجى اختيار المنتج والمخزن المصدر والمخزن المحول إليه والكمية.' }, { status: 400 });
    }

    if (fromWarehouseCode === toWarehouseCode) {
      return NextResponse.json({ success: false, message: 'لا يمكن التحويل لنفس المخزن.' }, { status: 400 });
    }

    const transferQty = Number(quantity);
    if (isNaN(transferQty) || transferQty <= 0) {
      return NextResponse.json({ success: false, message: 'الكمية المحولة يجب أن تكون رقماً موجباً.' }, { status: 400 });
    }

    await dbConnect();

    const product = await Product.findOne({ code: productCode });
    if (!product) {
      return NextResponse.json({ success: false, message: 'المنتج غير موجود.' }, { status: 404 });
    }

    const [fromWh, toWh] = await Promise.all([
      Warehouse.findOne({ code: fromWarehouseCode }),
      Warehouse.findOne({ code: toWarehouseCode }),
    ]);

    const fromName = fromWh ? fromWh.name : fromWarehouseCode;
    const toName = toWh ? toWh.name : toWarehouseCode;

    if (!product.warehouseStock) product.warehouseStock = [];

    // Check source warehouse stock
    const fromIndex = product.warehouseStock.findIndex((w: any) => w.warehouseCode === fromWarehouseCode);
    if (fromIndex === -1 || product.warehouseStock[fromIndex].quantity < transferQty) {
      const currentAvailable = fromIndex > -1 ? product.warehouseStock[fromIndex].quantity : 0;
      return NextResponse.json({
        success: false,
        message: `الكمية المتوفرة في (${fromName}) هي ${currentAvailable} قطعة فقط، ولا تكفي لتحويل ${transferQty} قطعة.`,
      }, { status: 400 });
    }

    // Deduct from source
    product.warehouseStock[fromIndex].quantity -= transferQty;

    // Add to destination
    const toIndex = product.warehouseStock.findIndex((w: any) => w.warehouseCode === toWarehouseCode);
    if (toIndex > -1) {
      product.warehouseStock[toIndex].quantity += transferQty;
    } else {
      product.warehouseStock.push({
        warehouseCode: toWarehouseCode,
        warehouseName: toName,
        quantity: transferQty,
      });
    }

    await product.save();

    // Log the transfer movement
    await StockMovement.create({
      type: 'transfer',
      productCode: product.code,
      productTitle: product.title,
      fromWarehouse: fromName,
      toWarehouse: toName,
      quantity: transferQty,
      reason: reason || `تحويل بضاعة من ${fromName} إلى ${toName}`,
      performedBy: session.name || session.email || 'مسؤول الحركة المخزنية',
    });

    return NextResponse.json({
      success: true,
      message: `تم تحويل ${transferQty} قطعة من (${fromName}) إلى (${toName}) بنجاح.`,
      product: {
        code: product.code,
        warehouseStock: product.warehouseStock,
      },
    });
  } catch (error: any) {
    console.error('Transfer stock error:', error);
    return NextResponse.json({ success: false, message: error.message || 'خطأ في عملية التحويل المخزني.' }, { status: 500 });
  }
}
