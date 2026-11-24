'use client';

import React, { useState } from 'react';
import { X, Star, ShoppingBag, MessageSquare, Check, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { IProduct, getSingleProductWhatsAppLink } from '@/lib/storeHelpers';

interface QuickViewModalProps {
  product: IProduct | null;
  onClose: () => void;
  onAddToCart: (product: IProduct, size: string, color: string) => void;
  storePhone?: string;
}

export default function QuickViewModal({
  product,
  onClose,
  onAddToCart,
  storePhone = '201096986091',
}: QuickViewModalProps) {
  if (!product) return null;

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'Standard');
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || '');
  const [added, setAdded] = useState(false);

  const discountPercent =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

  const handleAdd = () => {
    onAddToCart(product, selectedSize, selectedColor);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const whatsappLink = getSingleProductWhatsAppLink(
    storePhone,
    product,
    selectedSize,
    selectedColor
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-sans flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-20 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition"
          aria-label="إغلاق النافذة"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Images Section */}
          <div className="p-6 bg-slate-50 dark:bg-slate-950/60 flex flex-col justify-between">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
              <img
                src={product.images[selectedImage] || product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover object-center"
              />
              {discountPercent && (
                <div className="absolute top-3 right-3 bg-red-600 text-white font-black text-xs px-2.5 py-1 rounded-full shadow-md">
                  خصم {discountPercent}%
                </div>
              )}
            </div>

            {/* Thumbnail list */}
            {product.images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                      selectedImage === i
                        ? 'border-amber-500 scale-105'
                        : 'border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-5">
            <div>
              {/* Category & Code */}
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                  {product.categoryAr}
                </span>
                <span>كود: #{product.code}</span>
              </div>

              {/* Title */}
              <h2 className="text-xl font-black text-slate-900 dark:text-white leading-snug">
                {product.title}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center text-amber-500">
                  <Star className="w-4 h-4 fill-amber-500" />
                  <span className="text-xs font-bold mr-1 text-slate-800 dark:text-slate-200">
                    {product.rating}
                  </span>
                </div>
                <span className="text-xs text-slate-400">({product.reviewsCount} تقييم حقيقي)</span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mr-auto">
                  ✓ متوفر بالمخزن
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mt-4">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {product.price} ج.م
                </span>
                {product.oldPrice && (
                  <span className="text-sm text-slate-400 line-through">
                    {product.oldPrice} ج.م
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
                {product.description}
              </p>

              {/* Size Selector */}
              {product.sizes.length > 0 && (
                <div className="mt-4">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    المقاس المتاح:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition ${
                          selectedSize === s
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selector */}
              {product.colors.length > 0 && (
                <div className="mt-4">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    اللون: <span className="font-normal text-slate-500">{selectedColor}</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {product.colors.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColor(c.name)}
                        className={`w-7 h-7 rounded-full border-2 transition p-0.5 ${
                          selectedColor === c.name
                            ? 'border-amber-500 scale-110 shadow-xs'
                            : 'border-transparent opacity-80 hover:opacity-100'
                        }`}
                        title={c.name}
                      >
                        <span
                          className="w-full h-full rounded-full block border border-black/10"
                          style={{ backgroundColor: c.hex }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                    added
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 text-white shadow-md'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>تمت الإضافة للسلة!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>إضافة إلى سلة التسوق</span>
                    </>
                  )}
                </button>

                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                  title="طلب سريع عبر الواتساب"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">طلب واتساب</span>
                </a>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] text-slate-500">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>معاينة قبل الدفع</span>
                </div>
                <div className="flex items-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>استبدال 14 يوم</span>
                </div>
                <div className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                  <span>شحن سريع لجميع مصر</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
