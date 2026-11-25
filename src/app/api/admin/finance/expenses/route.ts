import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Expense from '@/models/Expense';

const DEFAULT_EXPENSES = [
  {
    title: 'إيجار فرع الكورنيش القديم (الشهري)',
    category: 'rent',
    categoryAr: 'إيجار مقرات وفروع',
    amount: 14000,
    branch: 'فرع الكورنيش القديم (الرئيسي)',
    paidBy: 'إدارة زيكو ستور',
    receiptNumber: 'REC-KRN-101',
    notes: 'إيجار الشهر الحالي',
  },
  {
    title: 'إيجار فرع شارع الرخاوي',
    category: 'rent',
    categoryAr: 'إيجار مقرات وفروع',
    amount: 11000,
    branch: 'فرع شارع الرخاوي',
    paidBy: 'إدارة زيكو ستور',
    receiptNumber: 'REC-RKH-202',
    notes: 'إيجار فرع الرخاوي الجديد',
  },
  {
    title: 'إيجار فرع ميني زيكو',
    category: 'rent',
    categoryAr: 'إيجار مقرات وفروع',
    amount: 8500,
    branch: 'فرع ميني زيكو (MINI ZEKO)',
    paidBy: 'إدارة زيكو ستور',
    receiptNumber: 'REC-MNZ-303',
    notes: 'إيجار فرع ميني زيكو',
  },
  {
    title: 'إيجار المخزن المركزي الرئيسي بالسويس',
    category: 'rent',
    categoryAr: 'إيجار مقرات وفروع',
    amount: 9000,
    branch: 'المخزن المركزي الرئيسي',
    paidBy: 'إدارة زيكو ستور',
    receiptNumber: 'REC-WHS-404',
    notes: 'إيجار المخزن الرئيسي لتخزين البضاعة',
  },
  {
    title: 'فاتورة كهرباء فرع الكورنيش ومخزن البضاعة',
    category: 'electricity',
    categoryAr: 'فواتير كهرباء',
    amount: 3200,
    branch: 'فرع الكورنيش القديم (الرئيسي)',
    paidBy: 'كاشير الفرع',
    receiptNumber: 'ELEC-SUEZ-890',
    notes: 'إنارة الواجهة، التكييفات وشاشات العرض',
  },
  {
    title: 'فاتورة كهرباء فرع الرخاوي وميني زيكو',
    category: 'electricity',
    categoryAr: 'فواتير كهرباء',
    amount: 2400,
    branch: 'فرع شارع الرخاوي',
    paidBy: 'كاشير الفرع',
    receiptNumber: 'ELEC-SUEZ-891',
    notes: 'استهلاك التكييفات والإضاءة الليد',
  },
  {
    title: 'فاتورة مياه مجمعة للفروع والمخزن',
    category: 'water',
    categoryAr: 'فواتير مياه',
    amount: 650,
    branch: 'المخزن المركزي الرئيسي',
    paidBy: 'إدارة زيكو ستور',
    receiptNumber: 'WAT-2026',
    notes: 'استهلاك مياه الفروع للشهر الحالي',
  },
  {
    title: 'مستلزمات بوفيه وضيافة ومواد نظافة للفروع',
    category: 'hospitality',
    categoryAr: 'بوفيه ونظافة وضيافة',
    amount: 1800,
    branch: 'فرع الكورنيش القديم (الرئيسي)',
    paidBy: 'مسؤول المشتريات',
    receiptNumber: 'HOSP-441',
    notes: 'مناديل، مشروبات وضيافة العملاء، معقمات',
  },
  {
    title: 'نولون وشحن كراتين بضاعة من مصانع العاشر والعبور',
    category: 'shipping',
    categoryAr: 'شحن ونقل بضائع',
    amount: 2900,
    branch: 'المخزن المركزي الرئيسي',
    paidBy: 'أمين المخزن',
    receiptNumber: 'SHIP-909',
    notes: 'نقل شحنة الهوديز والسنيكرز الجديدة للمخزن',
  },
];

export async function GET(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || !['admin', 'manager'].includes(session.role)) {
      return NextResponse.json({ success: false, message: 'غير مصرح لك بالوصول.' }, { status: 403 });
    }

    await dbConnect();

    // Auto-seed default operational expenses if none exists
    const count = await Expense.countDocuments();
    if (count === 0) {
      await Expense.insertMany(DEFAULT_EXPENSES);
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const branch = searchParams.get('branch');

    const query: any = {};
    if (category && category !== 'all') query.category = category;
    if (branch && branch !== 'all') query.branch = branch;

    const expenses = await Expense.find(query).sort({ date: -1 });

    // Category breakdown totals
    const categoryTotals: Record<string, number> = {
      rent: 0,
      electricity: 0,
      water: 0,
      gas: 0,
      maintenance: 0,
      hospitality: 0,
      shipping: 0,
      other: 0,
    };

    let totalAmount = 0;
    expenses.forEach((e) => {
      totalAmount += e.amount || 0;
      if (categoryTotals[e.category] !== undefined) {
        categoryTotals[e.category] += e.amount || 0;
      } else {
        categoryTotals.other += e.amount || 0;
      }
    });

    return NextResponse.json({
      success: true,
      expenses,
      stats: {
        totalAmount,
        totalCount: expenses.length,
        categoryTotals,
      },
    });
  } catch (error: any) {
    console.error('Finance expenses error:', error);
    return NextResponse.json({ success: false, message: 'خطأ في جلب بيانات المصروفات.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || !['admin', 'manager'].includes(session.role)) {
      return NextResponse.json({ success: false, message: 'غير مصرح لك بتسجيل مصروفات.' }, { status: 403 });
    }

    const body = await req.json();
    const { title, category, amount, branch, paidBy, receiptNumber, notes } = body;

    if (!title || !amount) {
      return NextResponse.json({ success: false, message: 'عنوان المصروف والمبلغ مطلوبين.' }, { status: 400 });
    }

    await dbConnect();

    const categoryMap: Record<string, string> = {
      rent: 'إيجار مقرات وفروع',
      electricity: 'فواتير كهرباء',
      water: 'فواتير مياه',
      gas: 'فواتير غاز',
      maintenance: 'صيانة وتجهيزات',
      hospitality: 'بوفيه ونظافة وضيافة',
      shipping: 'شحن ونقل بضائع',
      marketing: 'إعلانات وتسويق',
      other: 'مصروفات تشغيلية أخرى',
    };

    const expense = await Expense.create({
      title: title.trim(),
      category: category || 'other',
      categoryAr: categoryMap[category] || 'مصروفات أخرى',
      amount: Number(amount),
      branch: branch || 'المخزن المركزي الرئيسي',
      paidBy: paidBy || session.name || 'إدارة زيكو ستور',
      receiptNumber: receiptNumber || '',
      notes: notes || '',
    });

    return NextResponse.json({
      success: true,
      message: 'تم تسجيل المصروف بنجاح.',
      expense,
    });
  } catch (error: any) {
    console.error('Create expense error:', error);
    return NextResponse.json({ success: false, message: 'خطأ في تسجيل المصروف.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'فقط المدير العام يمكنه حذف بند مصروفات.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'معرف المصروف مطلوب.' }, { status: 400 });
    }

    await dbConnect();
    await Expense.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'تم حذف المصروف بنجاح.' });
  } catch (error: any) {
    console.error('Delete expense error:', error);
    return NextResponse.json({ success: false, message: 'خطأ في حذف المصروف.' }, { status: 500 });
  }
}
