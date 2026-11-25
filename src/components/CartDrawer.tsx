'use client';

import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowLeft, Plus, Minus, Truck, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ICartItem, ICustomerOrder, getWhatsAppOrderLink } from '@/lib/storeHelpers';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: ICartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  storePhone?: string;
}

const EGYPTIAN_CITIES = [
  'السويس',
  'القاهرة',
  'الجيزة',
  'الإسكندرية',
  'الإسماعيلية',
  'بورسعيد',
  'الشرقية',
  'الدقهلية (المنصورة)',
  'الغربية (طنطا)',
  'القليوبية',
  'المنوفية',
  'البحيرة',
  'كفر الشيخ',
  'دمياط',
  'الفيوم',
  'بني سويف',
  'المنيا',
  'أسيوط',
  'سوهاج',
  'قنا',
  'الأقصر',
  'أسوان',
  'البحر الأحمر (الغردقة)',
  'جنوب سيناء (شرم الشيخ)',
  'شمال سيناء',
  'مطروح'
];

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  storePhone = '201070091692',
}: CartDrawerProps) {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('السويس');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [pickupBranch, setPickupBranch] = useState('فرع الكورنيش القديم (الرئيسي)');
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  if (!isOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 800;
  const STANDARD_SHIPPING = 50;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const isFreeShipping = deliveryMethod === 'pickup' || subtotal >= FREE_SHIPPING_THRESHOLD;
  const shipping = items.length === 0 || deliveryMethod === 'pickup' ? 0 : isFreeShipping ? 0 : STANDARD_SHIPPING;
  const total = subtotal + shipping;

  const progressPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const remainingForFree = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim() || (deliveryMethod === 'delivery' && !address.trim())) {
      alert('من فضلك أكمل بيانات الاسم ورقم الهاتف والعنوان لتأكيد الطلب');
      return;
    }

    const finalAddress = deliveryMethod === 'pickup' ? `استلام من فرع السويس: ${pickupBranch}` : address.trim();
    const finalCity = deliveryMethod === 'pickup' ? 'السويس (استلام من الفرع)' : city;
    const finalNotes = deliveryMethod === 'pickup' ? `[طلب استلام مباشر من: ${pickupBranch}] ${notes.trim()}` : notes.trim();

    const orderData: ICustomerOrder = {
      customerName: customerName.trim(),
      phone: phone.trim(),
      city: finalCity,
      address: finalAddress,
      notes: finalNotes,
      items: items.map(it => ({
        productTitle: it.product.title,
        productCode: it.product.code,
        size: it.selectedSize,
        color: it.selectedColor,
        quantity: it.quantity,
        price: it.product.price
      })),
      subtotal,
      shipping,
      total
    };

    setIsOrdering(true);
    const link = getWhatsAppOrderLink(storePhone, orderData);
    
    // Save to local storage for quick access
    try {
      localStorage.setItem('zeko_last_order', JSON.stringify({ ...orderData, date: new Date().toISOString() }));
    } catch (e) {}

    // Open WhatsApp in new tab
    window.open(link, '_blank');
    setIsOrdering(false);
    setOrderPlaced(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950/60">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-zinc-900 dark:text-white text-base">سلة التسوق</h3>
                <p className="text-xs text-zinc-500">{items.length} منتج في السلة</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition cursor-pointer"
              aria-label="إغلاق السلة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Alert Bar */}
          {items.length > 0 && (
            <div className="px-5 py-3 bg-zinc-100 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-700/80">
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200">
                  <Truck className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                  {isFreeShipping ? '🎉 شحن مجاني مفعّل لطلبك!' : `أضف بقيمة ${remainingForFree} ج.م واحصل على شحن مجاني!`}
                </span>
                <span className="text-zinc-700 dark:text-zinc-300 font-mono">{progressPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mx-auto">
                  <ShoppingBag className="w-8 h-8 stroke-1" />
                </div>
                <h4 className="font-bold text-zinc-800 dark:text-zinc-200 text-lg">سلتك فارغة الآن</h4>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                  تصفح أحدث كولكشن من ملابس رجالي، كوتشيات، شنط وإكسسوارات وأضف ما يعجبك.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-bold text-xs hover:opacity-90 transition cursor-pointer"
                >
                  ابدأ التسوق الآن
                </button>
              </div>
            ) : orderPlaced ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-black text-zinc-900 dark:text-white text-lg">تم تحويل طلبك للواتساب!</h4>
                <p className="text-xs text-zinc-500 leading-relaxed max-w-xs mx-auto">
                  تم تجهيز تفاصيل طلبك لفريق زيكو ستور. سنقوم بالتأكيد معك وتنسيق الاستلام مع ميزة الاستبدال في نفس اليوم.
                </p>
                <button
                  onClick={() => {
                    onClearCart();
                    setOrderPlaced(false);
                    onClose();
                  }}
                  className="px-6 py-2.5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-black text-xs hover:opacity-90 transition cursor-pointer"
                >
                  العودة للمتجر
                </button>
              </div>
            ) : (
              <>
                {/* Items List */}
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div
                      key={`${item.product.code}-${item.selectedSize}-${item.selectedColor}-${idx}`}
                      className="flex gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-800"
                    >
                      <img
                        src={item.product.images[0]}
                        alt={item.product.title}
                        className="w-18 h-20 object-cover rounded-xl shrink-0 bg-zinc-200 dark:bg-zinc-700"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <h5 className="font-bold text-xs text-zinc-900 dark:text-white line-clamp-1">
                              {item.product.title}
                            </h5>
                            <button
                              onClick={() => onRemoveItem(idx)}
                              className="text-zinc-400 hover:text-red-500 transition p-0.5 cursor-pointer"
                              title="حذف من السلة"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-[11px] text-zinc-500 mt-0.5">
                            مقاس: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{item.selectedSize}</span>
                            {item.selectedColor && (
                              <> | لون: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{item.selectedColor}</span></>
                            )}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <span className="font-black text-xs text-zinc-900 dark:text-white">
                            {item.product.price * item.quantity} <span className="text-zinc-500 font-normal">ج.م</span>
                          </span>
                          <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 px-2 py-0.5">
                            <button
                              onClick={() => onUpdateQuantity(idx, Math.max(1, item.quantity - 1))}
                              className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                            <button
                              onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                              className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Customer Checkout Form */}
                <form id="cart-checkout-form" onSubmit={handleCheckout} className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <span>بيانات الشحن والتوصيل</span>
                      <span className="text-[10px] bg-zinc-200/80 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 px-2 py-0.5 rounded-full font-medium">
                        دفع عند الاستلام
                      </span>
                    </h4>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                      طريقة الاستلام المفضلة
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('delivery')}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                          deliveryMethod === 'delivery'
                            ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 border-transparent shadow-xs'
                            : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                        }`}
                      >
                        🚚 توصيل للمنزل
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('pickup')}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                          deliveryMethod === 'pickup'
                            ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 border-transparent shadow-xs'
                            : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                        }`}
                      >
                        🏬 استلام من الفرع
                      </button>
                    </div>
                  </div>

                  {deliveryMethod === 'pickup' && (
                    <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 space-y-1.5 animate-in fade-in">
                      <label className="block text-[11px] font-bold text-zinc-800 dark:text-zinc-200">
                        📍 حدد فرع الاستلام المفضل بالسويس:
                      </label>
                      <select
                        value={pickupBranch}
                        onChange={(e) => setPickupBranch(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none text-zinc-900 dark:text-white font-bold"
                      >
                        <option value="فرع الكورنيش القديم (الرئيسي)">1. فرع الكورنيش القديم (الرئيسي - أمام نادي أبناء السويس)</option>
                        <option value="فرع شارع الرخاوي">2. فرع شارع الرخاوي الجديد (بجوار محل فيونكة)</option>
                        <option value="فرع ميني زيكو (MINI ZEKO)">3. فرع ميني زيكو (أول يمين من شارع الرخاوي الجديد)</option>
                      </select>
                      <p className="text-[10px] text-zinc-500 pt-0.5">
                        سيتم تجهيز الموديل في الفرع المختار واستلامه بدون أي مصاريف شحن.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      الاسم بالكامل *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: إبراهيم صلاح"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 text-zinc-900 dark:text-white transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                        رقم الهاتف (واتساب) *
                      </label>
                      <input
                        type="tel"
                        required
                        dir="ltr"
                        placeholder="01012345678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 text-xs text-right rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 text-zinc-900 dark:text-white transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                        المحافظة *
                      </label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 text-zinc-900 dark:text-white transition"
                      >
                        {EGYPTIAN_CITIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {deliveryMethod === 'delivery' && (
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                        العنوان بالتفصيل بالسويس *
                      </label>
                      <input
                        type="text"
                        required={deliveryMethod === 'delivery'}
                        placeholder="الشارع، رقم العمارة، الشقة، علامة مميزة"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 text-zinc-900 dark:text-white transition"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      ملاحظات أو مواعيد استلام مفضلة (اختياري)
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: الاتصال قبل الوصول"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 text-zinc-900 dark:text-white transition"
                    />
                  </div>
                </form>
              </>
            )}
          </div>

          {/* Footer & Totals */}
          {items.length > 0 && !orderPlaced && (
            <div className="p-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/80 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>المجموع الفرعي</span>
                  <span className="font-bold">{subtotal} ج.م</span>
                </div>
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>مصاريف الشحن</span>
                  <span className={`font-bold ${isFreeShipping ? 'text-emerald-500' : ''}`}>
                    {isFreeShipping ? 'مجاناً 🎁' : `${shipping} ج.م`}
                  </span>
                </div>
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-between text-zinc-900 dark:text-white text-sm font-black">
                  <span>الإجمالي (دفع عند الاستلام)</span>
                  <span className="text-zinc-950 dark:text-white text-base font-black">{total} ج.م</span>
                </div>
              </div>

              <button
                type="submit"
                form="cart-checkout-form"
                disabled={isOrdering}
                className="w-full py-3.5 px-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-zinc-900/10 transition active:scale-[0.99] cursor-pointer"
              >
                <span>🚀 تأكيد الطلب فوراً عبر الواتساب</span>
              </button>

              <div className="flex items-center justify-center gap-3 text-[10px] text-zinc-500">
                <span>دفع عند الاستلام</span>
                <span>•</span>
                <span>استبدال في نفس اليوم</span>
                <span>•</span>
                <span>3 فروع بالسويس</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
