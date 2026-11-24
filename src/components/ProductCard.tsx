'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ShoppingBag, Star, Zap, Eye, Check, MessageSquare } from 'lucide-react';
import { IProduct, getSingleProductWhatsAppLink } from '@/lib/storeHelpers';

interface ProductCardProps {
  product: IProduct;
  onAddToCart: (product: IProduct, size: string, color: string) => void;
  onQuickView: (product: IProduct) => void;
}

export default function ProductCard({
  product,
  onAddToCart,
  onQuickView,
}: ProductCardProps) {
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
    '201096986091',
    product,
    selectedSize,
    selectedColor
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-xl hover:border-amber-500/50 transition-all duration-300 flex flex-col justify-between group">
      
      {/* Image & Badges */}
      <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Floating Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
          {discountPercent && (
            <span className="px-2.5 py-1 rounded-xl bg-rose-600 text-white text-[11px] font-black shadow-md">
              خصم {discountPercent}%
            </span>
          )}
          {product.bestseller && (
            <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-slate-950 text-[10px] font-black shadow-md flex items-center gap-1">
              <span>🔥</span> الأكثر طلباً
            </span>
          )}
          {product.newArrival && (
            <span className="px-2.5 py-1 rounded-xl bg-blue-600 text-white text-[10px] font-bold shadow-md">
              وصل حديثاً ✨
            </span>
          )}
        </div>

        {/* Quick View Floating Button */}
        <button
          onClick={() => onQuickView(product)}
          className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-700 dark:text-slate-200 hover:text-amber-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
          title="معاينة سريعة"
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* Code pill */}
        <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono">
          #{product.code}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-amber-600 dark:text-amber-400 font-bold text-[11px]">
              {product.categoryAr}
            </span>
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[11px]">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold">{product.rating}</span>
              <span>({product.reviewsCount})</span>
            </div>
          </div>

          {/* Title */}
          <h3
            onClick={() => onQuickView(product)}
            className="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-2 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-colors leading-snug mb-3"
          >
            {product.title}
          </h3>

          {/* Size Selector */}
          {product.sizes.length > 0 && (
            <div className="mb-3">
              <span className="text-[11px] text-slate-400 block mb-1">المقاس:</span>
              <div className="flex flex-wrap gap-1.5">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                      selectedSize === s
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
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
            <div className="mb-4 flex items-center gap-2">
              <span className="text-[11px] text-slate-400">اللون:</span>
              <div className="flex items-center gap-1.5">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setSelectedColor(c.name)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 transition-transform ${
                      selectedColor === c.name ? 'ring-2 ring-amber-500 scale-125' : 'opacity-80'
                    }`}
                    title={c.name}
                  />
                ))}
                <span className="text-[10px] text-slate-500 font-medium mr-1">{selectedColor}</span>
              </div>
            </div>
          )}
        </div>

        {/* Pricing & Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-slate-900 dark:text-white">
                {product.price} <span className="text-xs font-bold text-amber-600">ج.م</span>
              </span>
              {product.oldPrice && product.oldPrice > product.price && (
                <span className="text-xs text-slate-400 line-through">
                  {product.oldPrice} ج.م
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
              متوفر فوري ⚡
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleAdd}
              className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white active:scale-95'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>تمت الإضافة!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>أضف للسلة</span>
                </>
              )}
            </button>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>طلب واتساب</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
