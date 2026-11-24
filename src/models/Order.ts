import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrderItem {
  id: string;
  name: string;
  nameEn?: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  items: IOrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'whatsapp' | 'cod' | 'card' | 'bank_transfer';
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    nameEn: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    image: { type: String, default: '' },
  },
  { _id: false }
);

const OrderSchema: Schema<IOrder> = new Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    customerName: {
      type: String,
      required: [true, 'اسم العميل مطلوب'],
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, 'رقم هاتف العميل مطلوب'],
      trim: true,
    },
    customerEmail: {
      type: String,
      trim: true,
      default: '',
    },
    customerAddress: {
      type: String,
      trim: true,
      default: '',
    },
    items: [OrderItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['whatsapp', 'cod', 'card', 'bank_transfer'],
      default: 'whatsapp',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: ['new', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'new',
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Helper to format WhatsApp message
export function generateWhatsAppOrderLink(
  whatsappPhone: string,
  order: {
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    items: IOrderItem[];
    total: number;
    currency?: string;
  }
): string {
  const currency = order.currency || 'ر.س';
  const itemsText = order.items
    .map((item, index) => `${index + 1}. ${item.name} (${item.quantity}x ${item.price} ${currency})`)
    .join('\n');

  const text = encodeURIComponent(
    `*طلب جديد من المتجر* 🛒\n` +
    `*رقم الطلب:* #${order.orderNumber}\n` +
    `*الاسم:* ${order.customerName}\n` +
    `*الهاتف:* ${order.customerPhone}\n\n` +
    `*المنتجات المطلوبة:*\n${itemsText}\n\n` +
    `*الإجمالي:* ${order.total} ${currency}\n\n` +
    `أرجو تأكيد الطلب وتزويدي بتفاصيل التوصيل والدفع.`
  );

  return `https://wa.me/${whatsappPhone.replace(/[^0-9]/g, '')}?text=${text}`;
}

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
