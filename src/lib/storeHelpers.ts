export interface IWarehouseItemStock {
  warehouseCode: string;
  warehouseName: string;
  quantity: number;
  shelfLocation?: string;
}

export interface IProduct {
  _id?: string;
  code: string;
  title: string;
  slug: string;
  category: 'clothing' | 'sneakers' | 'bags' | 'caps' | 'socks' | 'underwear';
  categoryAr: string;
  price: number;
  oldPrice?: number;
  images: string[];
  description: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  primaryLocation?: string;
  shelfLocation?: string;
  availableBranches?: string[];
  warehouseStock?: IWarehouseItemStock[];
  totalStock?: number;
  inStock: boolean;
  featured?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
  rating: number;
  reviewsCount: number;
}

export interface ICartItem {
  product: IProduct;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}

export interface ICustomerOrder {
  customerName: string;
  phone: string;
  city: string;
  address: string;
  notes?: string;
  items: {
    productTitle: string;
    productCode: string;
    size: string;
    color: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  shipping: number;
  total: number;
}

// Default store phone (Sayed Ward - ZeKo Store official management)
const DEFAULT_PHONE = process.env.NEXT_PUBLIC_STORE_PHONE || '201070091692';

// Generate direct WhatsApp checkout link
export function getWhatsAppOrderLink(
  storePhone: string = DEFAULT_PHONE,
  order: ICustomerOrder
): string {
  const cleanPhone = storePhone.replace(/[^0-9]/g, '');

  let itemsText = order.items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.productTitle}* (كود: #${item.productCode})\n   - المقاس: ${item.size} | اللون: ${item.color}\n   - الكمية: ${item.quantity} × ${item.price} ج.م = ${item.quantity * item.price} ج.م`
    )
    .join('\n\n');

  const message = `🛍️ *طلب أوردر جديد من متجر زيكو ستور (ZeKo Store)* 🛍️
──────────────────
👤 *بيانات العميل:*
• الاسم: ${order.customerName}
• الهاتف: ${order.phone}
• المحافظة والمدينة: ${order.city}
• العنوان بالتفصيل: ${order.address}
${order.notes ? `• ملاحظات إضافية: ${order.notes}\n` : ''}
📦 *المنتجات المطلوبة:*
${itemsText}

──────────────────
💵 *الحساب الإجمالي:*
• المجموع الفرعي: ${order.subtotal} ج.م
• مصاريف الشحن: ${order.shipping === 0 ? 'مجاناً 🎁' : `${order.shipping} ج.م`}
💰 *الإجمالي النهائي للدفع عند الاستلام:* ${order.total} ج.م
──────────────────
برجاء تأكيد حجز الأوردر وميعاد الشحن. شكراً لكم! ✨`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

// Quick 1-click single product WhatsApp order link
export function getSingleProductWhatsAppLink(
  storePhone: string = DEFAULT_PHONE,
  product: IProduct,
  size?: string,
  color?: string
): string {
  const cleanPhone = storePhone.replace(/[^0-9]/g, '');
  const sizeText = size ? `المقاس: ${size}` : 'المقاس: يحدد مع خدمة العملاء';
  const colorText = color ? `اللون: ${color}` : '';

  const message = `مرحباً زيكو ستور 👟👕
أود الاستفسار والطلب الفوري لهذا المنتج:
• *${product.title}*
• كود المنتج: #${product.code}
• السعر: ${product.price} ج.م
• ${sizeText} ${colorText}

هل متاح للاستلام من الفرع أو التوصيل الفوري؟`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
