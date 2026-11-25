import mongoose, { Schema, Document } from 'mongoose';

export type ExpenseCategory =
  | 'rent' // إيجار
  | 'electricity' // كهرباء
  | 'water' // مياه
  | 'gas' // غاز
  | 'maintenance' // صيانة
  | 'hospitality' // بوفيه ومشروبات ونظافة
  | 'shipping' // شحن وتوصيل ونولون
  | 'marketing' // إعلانات وتسويق
  | 'other'; // أخرى

export interface IExpenseDocument extends Document {
  title: string;
  category: ExpenseCategory;
  categoryAr: string;
  amount: number;
  branch: string; // فرع الكورنيش، الرخاوي، ميني زيكو، المخزن المركزي، عام
  date: Date;
  paidBy?: string;
  receiptNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['rent', 'electricity', 'water', 'gas', 'maintenance', 'hospitality', 'shipping', 'marketing', 'other'],
      default: 'other',
    },
    categoryAr: { type: String, required: true, default: 'مصروفات أخرى' },
    amount: { type: Number, required: true },
    branch: { type: String, required: true, default: 'المخزن المركزي' },
    date: { type: Date, default: Date.now },
    paidBy: { type: String, default: 'إدارة زيكو ستور' },
    receiptNumber: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Expense ||
  mongoose.model<IExpenseDocument>('Expense', ExpenseSchema);
