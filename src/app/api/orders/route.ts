import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { getSessionUser } from '@/lib/auth';
import Order, { generateWhatsAppOrderLink } from '@/models/Order';
import SiteSettings from '@/models/SiteSettings';
import { z } from 'zod';

const CreateOrderSchema = z.object({
  customerName: z.string().trim().min(2, 'اسم العميل مطلوب'),
  customerPhone: z.string().trim().min(8, 'رقم الهاتف مطلوب'),
  customerEmail: z.string().email().optional().or(z.literal('')),
  customerAddress: z.string().optional(),
  items: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      nameEn: z.string().optional(),
      price: z.number().min(0),
      quantity: z.number().min(1),
      image: z.string().optional(),
    })
  ).min(1, 'يجب اختيار منتج واحد على الأقل'),
  notes: z.string().optional(),
  paymentMethod: z.enum(['whatsapp', 'cod', 'card', 'bank_transfer']).default('whatsapp'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = CreateOrderSchema.parse(body);

    await dbConnect();

    // 1. Calculate totals
    const subtotal = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal; // can apply discount here

    // 2. Generate unique human-readable order number
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    // Optional user attachment
    const session = await getSessionUser();

    // 3. Create Order
    const order = await Order.create({
      orderNumber,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail || '',
      customerAddress: data.customerAddress || '',
      items: data.items,
      subtotal,
      discount: 0,
      total,
      paymentMethod: data.paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'new',
      notes: data.notes || '',
      userId: session?.userId || null,
    });

    // 4. Get active site settings for WhatsApp number & currency
    const settings = await SiteSettings.findOne().lean();
    const whatsappPhone = settings?.whatsappNumber || '201096986091';
    const currency = settings?.currency || 'ر.س';

    // 5. Generate WhatsApp Direct Checkout Link
    const whatsappLink = generateWhatsAppOrderLink(whatsappPhone, {
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      items: order.items,
      total: order.total,
      currency,
    });

    return NextResponse.json({
      success: true,
      message: 'تم تسجيل طلبك بنجاح! 🚀',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        total: order.total,
        currency,
        status: order.orderStatus,
      },
      whatsappLink,
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.issues[0]?.message || 'بيانات الطلب غير صالحة' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'تعذر إنشاء الطلب حالياً.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'غير مصرح لك بعرض الطلبات.' },
        { status: 403 }
      );
    }

    await dbConnect();
    const orders = await Order.find().sort({ createdAt: -1 }).limit(100).lean();

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error('Fetch orders error:', error);
    return NextResponse.json(
      { success: false, message: 'تعذر جلب الطلبات.' },
      { status: 500 }
    );
  }
}
