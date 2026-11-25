'use client';

import React, { useState } from 'react';
import { ShoppingBag, Star, Eye, Check, MessageSquare, MapPin } from 'lucide-react';
import { IProduct, getSingleProductWhatsAppLink } from '@/lib/storeHelpers';

interface ProductCardProps {
  product: IProduct;
  onAddToCart: (product: IProduct, size: string, color: string) => void;
  onQuickView: (product: IProduct) => void;
  storePhone?: string;
}

export default function ProductCard({
  product,
  onAddToCart,
  onQuickView,
  storePhone = '201070091692',
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
    storePhone,
    product,
    selectedSize,
    selectedColor
  );

  return (
    <div className="bg-white dark:bg-zinc-900/90 rounded-3xl border border-zinc-200/90 dark:border-zinc-800/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-300 flex flex-col justify-between group">
      
      {/* Image & Badges */}
      <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-800/60">
        <img
          src={product.images[0]}
          alt={product.title}
          className={`w-full h-full object-cover object-center transition-all duration-500 ${
            product.images.length > 1
              ? 'group-hover:scale-105 group-hover:opacity-0'
              : 'group-hover:scale-105'
          }`}
          loading="lazy"
        />

        {product.images[1] && (
          <img
            src={product.images[1]}
            alt={`${product.title} - صورة 2`}
            className="w-full h-full object-cover object-center absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 scale-105"
            loading="lazy"
          />
        )}

        {/* Multiple images indicator badge */}
        {product.images.length > 1 && (
          <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-xs text-zinc-200 text-[10px] font-mono font-bold z-10 flex items-center gap-1">
            <span>📷</span>
            <span>{product.images.length} صور</span>
          </div>
        )}

        {/* Floating Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
          {discountPercent && (
            <span className="px-2.5 py-1 rounded-xl bg-rose-600 text-white text-[11px] font-black shadow-md">
              خصم {discountPercent}%
            </span>
          )}
          {product.bestseller && (
            <span className="px-2.5 py-1 rounded-xl bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-950 text-[10px] font-black shadow-md flex items-center gap-1 border border-zinc-700 dark:border-zinc-300">
              <span>🔥</span> الأكثر طلباً
            </span>
          )}
          {product.newArrival && (
            <span className="px-2.5 py-1 rounded-xl bg-zinc-800 text-zinc-100 text-[10px] font-bold shadow-md">
              وصل حديثاً ✨
            </span>
          )}
        </div>

        {/* Quick View Floating Button */}
        <button
          onClick={() => onQuickView(product)}
          className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md text-zinc-700 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
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
            <span className="text-zinc-500 dark:text-zinc-400 font-bold text-[11px]">
              {product.categoryAr}
            </span>
            <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 text-[11px]">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-zinc-900 dark:text-zinc-200">{product.rating}</span>
              <span>({product.reviewsCount})</span>
            </div>
          </div>

          {/* Title */}
          <h3
            onClick={() => onQuickView(product)}
            className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white line-clamp-2 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer transition-colors leading-snug mb-2"
          >
            {product.title}
          </h3>

          {/* Product Location & Available Branches */}
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 dark:text-zinc-400 py-1 px-2.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-800 mb-3">
            <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
            <span className="truncate">
              متوفر في: <strong className="text-zinc-800 dark:text-zinc-200 font-bold">
                {product.availableBranches && product.availableBranches.length > 0
                  ? product.availableBranches.join(' • ')
                  : product.warehouseStock && product.warehouseStock.length > 0
                  ? product.warehouseStock.filter((w) => w.quantity > 0).map((w) => w.warehouseName.replace('فرع ', '')).slice(0, 3).join(' • ')
                  : 'الكورنيش • الرخاوي • ميني زيكو'}
              </strong>
            </span>
          </div>

          {/* Size Selector */}
          {product.sizes.length > 0 && (
            <div className="mb-3">
              <span className="text-[11px] text-zinc-400 block mb-1">المقاس:</span>
              <div className="flex flex-wrap gap-1.5">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      selectedSize === s
                        ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
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
              <span className="text-[11px] text-zinc-400">اللون:</span>
              <div className="flex items-center gap-1.5">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setSelectedColor(c.name)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-4 h-4 rounded-full border border-zinc-300 dark:border-zinc-700 transition-transform ${
                      selectedColor === c.name ? 'ring-2 ring-zinc-900 dark:ring-zinc-100 scale-125' : 'opacity-80'
                    }`}
                    title={c.name}
                  />
                ))}
                <span className="text-[10px] text-zinc-500 font-medium mr-1">{selectedColor}</span>
              </div>
            </div>
          )}
        </div>

        {/* Pricing & Actions */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2.5">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-zinc-900 dark:text-white">
                {product.price} <span className="text-xs font-bold text-zinc-500">ج.م</span>
              </span>
              {product.oldPrice && product.oldPrice > product.price && (
                <span className="text-xs text-zinc-400 line-through">
                  {product.oldPrice} ج.م
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700">
              استبدال في نفس اليوم ⚡
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleAdd}
              className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 active:scale-95 shadow-xs'
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
