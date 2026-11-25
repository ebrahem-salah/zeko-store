import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Warehouse from '@/models/Warehouse';

const DEFAULT_WAREHOUSES = [
  {
    code: 'WH-KORNEISH',
    name: 'مخزن فرع الكورنيش القديم (الرئيسي)',
    city: 'السويس',
    location: 'الكورنيش القديم بجوار منتجع فينا، أمام نادي أبناء السويس',
    managerName: 'إدارة الكورنيش',
    managerPhone: '01070091692',
    capacity: 2500,
    isActive: true,
    notes: 'الفرع الرئيسي والمخزن المباشر لمعاينة واستلام العملاء',
  },
  {
    code: 'WH-RAKHAWI',
    name: 'مخزن فرع شارع الرخاوي',
    city: 'السويس',
    location: 'السويس: شارع الرخاوي الجديد بجوار محل فيونكة',
    managerName: 'إدارة الرخاوي',
    managerPhone: '01070091692',
    capacity: 2000,
    isActive: true,
    notes: 'مخزن فرع شارع الرخاوي لخدمة عملاء وسط البلد',
  },
  {
    code: 'WH-MINI',
    name: 'مخزن فرع ميني زيكو (MINI ZEKO)',
    city: 'السويس',
    location: 'السويس: أول يمين من شارع الرخاوي الجديد',
    managerName: 'إدارة ميني زيكو',
    managerPhone: '01070091692',
    capacity: 1500,
    isActive: true,
    notes: 'مخزن مخصص للملابس الصيفية والكابات والإكسسوارات',
  },
  {
    code: 'WH-MAIN',
    name: 'المخزن المركزي الرئيسي - السويس',
    city: 'السويس',
    location: 'السويس - المنطقة الصناعية والتخزين المركزي',
    managerName: 'الإدارة العامة والمشتريات',
    managerPhone: '01096986091',
    capacity: 10000,
    isActive: true,
    notes: 'المستودع الرئيسي لاستقبال شحنات المصانع والمستوردين وتوزيعها على الفروع',
  },
];

export async function GET(req: Request) {
  try {
    const session = await getSessionUser();
    // Allow admin or manager
    if (!session || !['admin', 'manager'].includes(session.role)) {
      return NextResponse.json({ success: false, message: 'غير مصرح لك بالوصول.' }, { status: 403 });
    }

    await dbConnect();

    // Auto-seed if empty
    let count = await Warehouse.countDocuments();
    if (count === 0) {
      await Warehouse.insertMany(DEFAULT_WAREHOUSES);
    }

    const warehouses = await Warehouse.find({}).sort({ createdAt: 1 });

    return NextResponse.json({
      success: true,
      count: warehouses.length,
      warehouses,
    });
  } catch (error: any) {
    console.error('Fetch warehouses error:', error);
    return NextResponse.json({ success: false, message: 'خطأ في جلب بيانات المخازن.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || !['admin', 'manager'].includes(session.role)) {
      return NextResponse.json({ success: false, message: 'غير مصرح لك بإضافة مخزن.' }, { status: 403 });
    }

    const body = await req.json();
    const { code, name, city, location, managerName, managerPhone, capacity, notes } = body;

    if (!code || !name || !location) {
      return NextResponse.json({ success: false, message: 'كود المخزن واسمه وموقعه مطلوبين.' }, { status: 400 });
    }

    await dbConnect();

    const existing = await Warehouse.findOne({ code: code.toUpperCase().trim() });
    if (existing) {
      return NextResponse.json({ success: false, message: 'كود المخزن موجود مسبقاً.' }, { status: 400 });
    }

    const warehouse = await Warehouse.create({
      code: code.toUpperCase().trim(),
      name: name.trim(),
      city: city || 'السويس',
      location: location.trim(),
      managerName: managerName || '',
      managerPhone: managerPhone || '',
      capacity: capacity ? Number(capacity) : 1000,
      notes: notes || '',
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء المخزن بنجاح.',
      warehouse,
    });
  } catch (error: any) {
    console.error('Create warehouse error:', error);
    return NextResponse.json({ success: false, message: error.message || 'خطأ في إنشاء المخزن.' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || !['admin', 'manager'].includes(session.role)) {
      return NextResponse.json({ success: false, message: 'غير مصرح لك بتعديل المخزن.' }, { status: 403 });
    }

    const body = await req.json();
    const { id, name, location, managerName, managerPhone, capacity, notes, isActive } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'معرف المخزن مطلوب.' }, { status: 400 });
    }

    await dbConnect();

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (location) updateData.location = location.trim();
    if (managerName !== undefined) updateData.managerName = managerName.trim();
    if (managerPhone !== undefined) updateData.managerPhone = managerPhone.trim();
    if (capacity !== undefined) updateData.capacity = Number(capacity);
    if (notes !== undefined) updateData.notes = notes.trim();
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const warehouse = await Warehouse.findByIdAndUpdate(id, updateData, { new: true });
    if (!warehouse) {
      return NextResponse.json({ success: false, message: 'المخزن غير موجود.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'تم تحديث بيانات المخزن بنجاح.',
      warehouse,
    });
  } catch (error: any) {
    console.error('Update warehouse error:', error);
    return NextResponse.json({ success: false, message: 'خطأ في تحديث المخزن.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'فقط المدير العام (Admin) يمكنه حذف المخازن.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'معرف المخزن مطلوب.' }, { status: 400 });
    }

    await dbConnect();
    await Warehouse.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'تم حذف المخزن بنجاح.',
    });
  } catch (error: any) {
    console.error('Delete warehouse error:', error);
    return NextResponse.json({ success: false, message: 'خطأ في حذف المخزن.' }, { status: 500 });
  }
}
