import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployeeDocument extends Document {
  name: string;
  phone: string;
  nationalId?: string;
  role: string; // بائع، كاشير، مسؤول مخزن، مندوب، مدير فرع
  branch: string; // فرع الكورنيش القديم، فرع شارع الرخاوي، فرع ميني زيكو، المخزن المركزي
  salary: number; // الراتب الأساسي الشهري
  incentives: number; // حوافز وبدلات
  deductions: number; // خصومات
  netSalary: number; // صافي الراتب المستحق
  paymentStatus: 'paid' | 'pending'; // حالة الصرف للشهر الحالي
  lastPaidDate?: Date;
  hireDate: Date;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    nationalId: { type: String, default: '' },
    role: { type: String, required: true, default: 'بائع بالفرع' },
    branch: { type: String, required: true, default: 'فرع الكورنيش القديم (الرئيسي)' },
    salary: { type: Number, required: true, default: 4000 },
    incentives: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    netSalary: { type: Number, required: true, default: 4000 },
    paymentStatus: { type: String, enum: ['paid', 'pending'], default: 'pending' },
    lastPaidDate: { type: Date },
    hireDate: { type: Date, default: Date.now },
    notes: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Auto-calculate net salary before saving
EmployeeSchema.pre('save', function (next) {
  const emp = this as any;
  emp.netSalary = (emp.salary || 0) + (emp.incentives || 0) - (emp.deductions || 0);
  next();
});

export default mongoose.models.Employee ||
  mongoose.model<IEmployeeDocument>('Employee', EmployeeSchema);
