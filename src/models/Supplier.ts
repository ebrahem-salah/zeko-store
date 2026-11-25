import mongoose, { Schema, Document } from 'mongoose';

export interface ISupplierDocument extends Document {
  name: string;
  company: string; // اسم المصنع / التوكيل
  phone: string;
  city?: string;
  category: string; // هوديز وملابس، أحذية وسنيكرز، شنط وكابات، مستلزمات تعبئة
  totalInvoiced: number; // إجمالي قيمة البضاعة الموردة
  totalPaid: number; // إجمالي المبالغ المسددة
  debtAmount: number; // المتبقي / المديونية المستحقة للمورد
  status: 'paid' | 'partial' | 'due'; // مسدد بالكامل، مسدد جزئياً، مستحق السداد
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    city: { type: String, default: 'القاهرة' },
    category: { type: String, required: true, default: 'ملابس وأزياء رجالي' },
    totalInvoiced: { type: Number, required: true, default: 0 },
    totalPaid: { type: Number, required: true, default: 0 },
    debtAmount: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ['paid', 'partial', 'due'],
      default: 'partial',
    },
    notes: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

// Calculate remaining debt automatically
SupplierSchema.pre('save', function (next) {
  const sup = this as any;
  sup.debtAmount = Math.max(0, (sup.totalInvoiced || 0) - (sup.totalPaid || 0));
  if (sup.debtAmount === 0) {
    sup.status = 'paid';
  } else if (sup.totalPaid > 0) {
    sup.status = 'partial';
  } else {
    sup.status = 'due';
  }
  next();
});

export default mongoose.models.Supplier ||
  mongoose.model<ISupplierDocument>('Supplier', SupplierSchema);
