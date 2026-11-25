import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Supplier from '@/models/Supplier';

const DEFAULT_SUPPLIERS = [
  {
    name: 'الحاج مجدي النمر',
    company: 'مصنع النمر للهوديز والملابس التريكو',
    phone: '01099887766',
    city: 'المحلة الكبرى',
    category: 'هوديز قطن 100% وبلوفرات وسويت شيرت',
    totalInvoiced: 125000,
    totalPaid: 95000,
    debtAmount: 30000,
    status: 'partial',
    notes: 'توريد كولكشن الشتاء وهوديز أوفر سايز',
  },
  {
    name: 'كابتن وليد الشناوي',
    company: 'شركة ماستر للاحذية والسنيكرز المستوردة',
    phone: '01122334455',
    city: 'القاهرة - العتبة',
    category: 'سنيكرز ماستر كواليتي (Nike, Adidas, Jordan)',
    totalInvoiced: 180000,
    totalPaid: 140000,
    debtAmount: 40000,
    status: 'partial',
    notes: 'توريد أحذية ماستر كواليتي أحدث إصدارات',
  },
  {
    name: 'مستر عماد فوزي',
    company: 'مصنع رويال كاب للمصنوعات الجلدية والشنط',
    phone: '01233445566',
    city: 'العاشر من رمضان',
    category: 'شنط كروس، كابات، ومحافظ جلدية',
    totalInvoiced: 65000,
    totalPaid: 50000,
    debtAmount: 15000,
    status: 'partial',
    notes: 'توريد إكسسوارات وشنط شبابي وكابات تطريز كمبيوتر',
  },
  {
    name: 'المهندس طارق منصور',
    company: 'شركة الأهرام للأقطان والملابس الداخلية والجوارب',
    phone: '01077889900',
    city: 'العبور',
    category: 'جوارب رياضية قطن 100% وملابس داخلية',
    totalInvoiced: 45000,
    totalPaid: 45000,
    debtAmount: 0,
    status: 'paid',
    notes: 'تم تصفية وسداد الحساب بالكامل',
  },
];

export async function GET(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || !['admin', 'manager'].includes(session.role)) {
      return NextResponse.json({ success: false, message: 'غير مصرح لك بالوصول.' }, { status: 403 });
    }

    await dbConnect();

    // Auto-seed default suppliers if none exists
    const count = await Supplier.countDocuments();
    if (count === 0) {
      await Supplier.insertMany(DEFAULT_SUPPLIERS);
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const query: any = {};
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const suppliers = await Supplier.find(query).sort({ debtAmount: -1 });

    // Financial Totals for Suppliers
    const totalInvoiced = suppliers.reduce((sum, s) => sum + (s.totalInvoiced || 0), 0);
    const totalPaid = suppliers.reduce((sum, s) => sum + (s.totalPaid || 0), 0);
    const totalDebt = suppliers.reduce((sum, s) => sum + (s.debtAmount || 0), 0);

    return NextResponse.json({
      success: true,
      suppliers,
      stats: {
        totalSuppliers: suppliers.length,
        totalInvoiced,
        totalPaid,
        totalDebt,
      },
    });
  } catch (error: any) {
    console.error('Finance suppliers error:', error);
    return NextResponse.json({ success: false, message: 'خطأ في جلب بيانات الموردين.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'فقط المدير العام يمكنه إضافة مورد جديد.' }, { status: 403 });
    }

    const body = await req.json();
    const { name, company, phone, city, category, totalInvoiced, totalPaid, notes } = body;

    if (!name || !company || !phone) {
      return NextResponse.json({ success: false, message: 'اسم المورد واسم المصنع ورقم الهاتف مطلوبين.' }, { status: 400 });
    }

    await dbConnect();

    const invoiced = Number(totalInvoiced) || 0;
    const paid = Number(totalPaid) || 0;
    const debtAmount = Math.max(0, invoiced - paid);
    const status = debtAmount === 0 ? 'paid' : paid > 0 ? 'partial' : 'due';

    const supplier = await Supplier.create({
      name: name.trim(),
      company: company.trim(),
      phone: phone.trim(),
      city: city || 'القاهرة',
      category: category || 'ملابس وأزياء رجالي',
      totalInvoiced: invoiced,
      totalPaid: paid,
      debtAmount,
      status,
      notes: notes || '',
    });

    return NextResponse.json({
      success: true,
      message: 'تم إضافة المورد بنجاح.',
      supplier,
    });
  } catch (error: any) {
    console.error('Create supplier error:', error);
    return NextResponse.json({ success: false, message: 'خطأ في إضافة المورد.' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || !['admin', 'manager'].includes(session.role)) {
      return NextResponse.json({ success: false, message: 'غير مصرح لك بالتعديل.' }, { status: 403 });
    }

    const body = await req.json();
    const { id, paymentAmount, totalInvoiced, totalPaid, notes } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'معرف المورد مطلوب.' }, { status: 400 });
    }

    await dbConnect();

    const supplier = await Supplier.findById(id);
    if (!supplier) {
      return NextResponse.json({ success: false, message: 'المورد غير موجود.' }, { status: 404 });
    }

    // If recording a new payment towards the supplier debt
    if (paymentAmount && Number(paymentAmount) > 0) {
      supplier.totalPaid = (supplier.totalPaid || 0) + Number(paymentAmount);
    }

    if (totalInvoiced !== undefined) supplier.totalInvoiced = Number(totalInvoiced);
    if (totalPaid !== undefined && !paymentAmount) supplier.totalPaid = Number(totalPaid);
    if (notes !== undefined) supplier.notes = notes;

    supplier.debtAmount = Math.max(0, (supplier.totalInvoiced || 0) - (supplier.totalPaid || 0));
    if (supplier.debtAmount === 0) {
      supplier.status = 'paid';
    } else if (supplier.totalPaid > 0) {
      supplier.status = 'partial';
    } else {
      supplier.status = 'due';
    }

    await supplier.save();

    return NextResponse.json({
      success: true,
      message: 'تم تسجيل الدفعة وتحديث حساب المورد والمديونية بنجاح.',
      supplier,
    });
  } catch (error: any) {
    console.error('Update supplier error:', error);
    return NextResponse.json({ success: false, message: 'خطأ في تحديث حساب المورد.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'فقط المدير العام يمكنه حذف مورد.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'معرف المورد مطلوب.' }, { status: 400 });
    }

    await dbConnect();
    await Supplier.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'تم حذف المورد بنجاح.' });
  } catch (error: any) {
    console.error('Delete supplier error:', error);
    return NextResponse.json({ success: false, message: 'خطأ في حذف المورد.' }, { status: 500 });
  }
}
