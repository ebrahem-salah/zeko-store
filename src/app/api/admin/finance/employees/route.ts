import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Employee from '@/models/Employee';

const DEFAULT_EMPLOYEES = [
  {
    name: 'أحمد محمود العطار',
    phone: '01011223344',
    role: 'مسؤول مبيعات وكاشير',
    branch: 'فرع الكورنيش القديم (الرئيسي)',
    salary: 5500,
    incentives: 500,
    deductions: 0,
    netSalary: 6000,
    paymentStatus: 'paid',
    notes: 'دوام كامل - فرع الكورنيش',
  },
  {
    name: 'كريم حسن إبراهيم',
    phone: '01022334455',
    role: 'بائع ملابس وأحذية',
    branch: 'فرع شارع الرخاوي',
    salary: 4800,
    incentives: 400,
    deductions: 200,
    netSalary: 5000,
    paymentStatus: 'paid',
    notes: 'مسؤول قسم السنيكرز والملابس بالرخاوي',
  },
  {
    name: 'عمر سيد الديب',
    phone: '01033445566',
    role: 'بائع ومسؤول فرع',
    branch: 'فرع ميني زيكو (MINI ZEKO)',
    salary: 4500,
    incentives: 300,
    deductions: 0,
    netSalary: 4800,
    paymentStatus: 'pending',
    notes: 'مسؤول فرع ميني زيكو الجديد',
  },
  {
    name: 'محمد عبد الله خليل',
    phone: '01044556677',
    role: 'أمين مخزن ومسؤول جرد',
    branch: 'المخزن المركزي الرئيسي',
    salary: 6000,
    incentives: 500,
    deductions: 0,
    netSalary: 6500,
    paymentStatus: 'paid',
    notes: 'إدارة التحويلات واستلام شحنات البضاعة',
  },
  {
    name: 'مصطفى رجب الشامي',
    phone: '01055667788',
    role: 'مندوب تسليم وتوصيل بالسويس',
    branch: 'المخزن المركزي الرئيسي',
    salary: 4200,
    incentives: 600,
    deductions: 0,
    netSalary: 4800,
    paymentStatus: 'pending',
    notes: 'توصيل الطلبات الفورية لمنازل السويس',
  },
];

export async function GET(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || !['admin', 'manager'].includes(session.role)) {
      return NextResponse.json({ success: false, message: 'غير مصرح لك بالوصول.' }, { status: 403 });
    }

    await dbConnect();

    // Auto-seed initial Suez branch staff if none exists
    const count = await Employee.countDocuments();
    if (count === 0) {
      await Employee.insertMany(DEFAULT_EMPLOYEES);
    }

    const { searchParams } = new URL(req.url);
    const branch = searchParams.get('branch');
    const status = searchParams.get('status');

    const query: any = {};
    if (branch && branch !== 'all') query.branch = branch;
    if (status && status !== 'all') query.paymentStatus = status;

    const employees = await Employee.find(query).sort({ createdAt: -1 });

    // Financial Totals
    const totalPayroll = employees.reduce((sum, e) => sum + (e.netSalary || 0), 0);
    const paidPayroll = employees.filter((e) => e.paymentStatus === 'paid').reduce((sum, e) => sum + (e.netSalary || 0), 0);
    const pendingPayroll = employees.filter((e) => e.paymentStatus === 'pending').reduce((sum, e) => sum + (e.netSalary || 0), 0);

    return NextResponse.json({
      success: true,
      employees,
      stats: {
        totalEmployees: employees.length,
        totalPayroll,
        paidPayroll,
        pendingPayroll,
      },
    });
  } catch (error: any) {
    console.error('Finance employees error:', error);
    return NextResponse.json({ success: false, message: 'خطأ في جلب بيانات العاملين.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'فقط المدير العام يمكنه إضافة موظفين.' }, { status: 403 });
    }

    const body = await req.json();
    const { name, phone, role, branch, salary, incentives, deductions, paymentStatus, notes } = body;

    if (!name || !phone || !salary) {
      return NextResponse.json({ success: false, message: 'الاسم ورقم الهاتف والراتب مطلوبين.' }, { status: 400 });
    }

    await dbConnect();

    const netSalary = Number(salary) + (Number(incentives) || 0) - (Number(deductions) || 0);

    const employee = await Employee.create({
      name: name.trim(),
      phone: phone.trim(),
      role: role || 'بائع بالفرع',
      branch: branch || 'فرع الكورنيش القديم (الرئيسي)',
      salary: Number(salary),
      incentives: Number(incentives) || 0,
      deductions: Number(deductions) || 0,
      netSalary,
      paymentStatus: paymentStatus || 'pending',
      notes: notes || '',
    });

    return NextResponse.json({
      success: true,
      message: 'تم إضافة الموظف بنجاح.',
      employee,
    });
  } catch (error: any) {
    console.error('Create employee error:', error);
    return NextResponse.json({ success: false, message: 'خطأ في إضافة الموظف.' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || !['admin', 'manager'].includes(session.role)) {
      return NextResponse.json({ success: false, message: 'غير مصرح لك بالتعديل.' }, { status: 403 });
    }

    const body = await req.json();
    const { id, salary, incentives, deductions, paymentStatus, role, branch, notes } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'معرف الموظف مطلوب.' }, { status: 400 });
    }

    await dbConnect();

    const employee = await Employee.findById(id);
    if (!employee) {
      return NextResponse.json({ success: false, message: 'الموظف غير موجود.' }, { status: 404 });
    }

    if (salary !== undefined) employee.salary = Number(salary);
    if (incentives !== undefined) employee.incentives = Number(incentives);
    if (deductions !== undefined) employee.deductions = Number(deductions);
    if (paymentStatus) {
      employee.paymentStatus = paymentStatus;
      if (paymentStatus === 'paid') employee.lastPaidDate = new Date();
    }
    if (role) employee.role = role;
    if (branch) employee.branch = branch;
    if (notes !== undefined) employee.notes = notes;

    employee.netSalary = (employee.salary || 0) + (employee.incentives || 0) - (employee.deductions || 0);

    await employee.save();

    return NextResponse.json({
      success: true,
      message: 'تم تحديث بيانات الموظف والراتب بنجاح.',
      employee,
    });
  } catch (error: any) {
    console.error('Update employee error:', error);
    return NextResponse.json({ success: false, message: 'خطأ في تحديث بيانات الموظف.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'فقط المدير العام يمكنه حذف موظف.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'معرف الموظف مطلوب.' }, { status: 400 });
    }

    await dbConnect();
    await Employee.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'تم حذف الموظف بنجاح.' });
  } catch (error: any) {
    console.error('Delete employee error:', error);
    return NextResponse.json({ success: false, message: 'خطأ في حذف الموظف.' }, { status: 500 });
  }
}
