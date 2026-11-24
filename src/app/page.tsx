'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  ShoppingBag,
  Search,
  Filter,
  MessageSquare,
  Sparkles,
  Flame,
  ChevronDown,
  Menu,
  X,
  PhoneCall,
  SlidersHorizontal
} from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import CartDrawer from '@/components/CartDrawer';
import QuickViewModal from '@/components/QuickViewModal';
import TrustBadges from '@/components/TrustBadges';
import { IProduct, ICartItem } from '@/lib/storeHelpers';
import { SEED_PRODUCTS } from '@/lib/seedProducts';

const CATEGORIES = [
  { id: 'all', label: 'جميع المنتجات', icon: '🔥' },
  { id: 'clothing', label: 'ملابس رجالي', icon: '👕' },
  { id: 'sneakers', label: 'كوتشيات وسنيكرز', icon: '👟' },
  { id: 'bags', label: 'شنط ومحافظ', icon: '🎒' },
  { id: 'caps', label: 'كابات وإكسسوارات', icon: '🧢' },
  { id: 'socks', label: 'شرابات وجوارب', icon: '🧦' },
  { id: 'underwear', label: 'ملابس داخلية قطن', icon: '🩲' },
];

export default function HomePage() {
  const [products, setProducts] = useState<IProduct[]>(SEED_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  
  // Cart state
  const [cartItems, setCartItems] = useState<ICartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Quick View state
  const [quickViewProduct, setQuickViewProduct] = useState<IProduct | null>(null);

  // Mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('zeko_store_cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (e) {}
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('zeko_store_cart', JSON.stringify(cartItems));
    } catch (e) {}
  }, [cartItems]);

  // Fetch products from API (falls back gracefully to seed catalog)
  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.products) && data.products.length > 0) {
            setProducts(data.products);
          }
        }
      } catch (err) {
        console.error('Using local seed catalog fallback', err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Cart operations
  const handleAddToCart = (product: IProduct, size: string, color: string) => {
    setCartItems(prev => {
      const existingIdx = prev.findIndex(
        item => item.product.code === product.code && item.selectedSize === size && item.selectedColor === color
      );
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += 1;
        return updated;
      }
      return [...prev, { product, selectedSize: size, selectedColor: color, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (index: number, newQty: number) => {
    setCartItems(prev => {
      const updated = [...prev];
      updated[index].quantity = newQty;
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const totalCartCount = cartItems.reduce((acc, it) => acc + it.quantity, 0);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
        const matchesSearch =
          !searchQuery.trim() ||
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.code.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [products, activeCategory, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col selection:bg-amber-500 selection:text-slate-950" dir="rtl">
      
      {/* Top Alert Bar */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 font-black text-xs py-2 px-4 text-center tracking-wide flex items-center justify-center gap-3">
        <span className="flex items-center gap-1">
          <Flame className="w-4 h-4 fill-slate-950" />
          كولكشن الشتاء والتريند وصل!
        </span>
        <span className="hidden sm:inline opacity-50">|</span>
        <span className="hidden sm:inline">🚚 شحن مجاني للطلبات فوق 800 ج.م</span>
        <span className="opacity-50">|</span>
        <span>✨ معاينة واستلام قبل الدفع</span>
      </div>

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            
            {/* Brand Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="القائمة"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <a href="#" className="flex items-center gap-2 group">
                <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-amber-500/25 group-hover:scale-105 transition">
                  Z
                </div>
                <div>
                  <span className="font-black text-xl tracking-tight text-slate-950 dark:text-white block leading-none">
                    زيكو ستور
                  </span>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 tracking-wider">
                    ZEKO STORE • FASHION
                  </span>
                </div>
              </a>
            </div>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-6">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="ابحث عن هودي، كوتشي، شنطة، كاب..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs focus:outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white transition"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-3">
              {/* WhatsApp VIP Support */}
              <a
                href="https://wa.me/201096986091?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D8%B2%D9%8A%D9%83%D9%88%20%D8%B3%D8%AA%D9%88%D8%B1%D8%8C%20%D8%A3%D9%88%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%A7%D9%84%D9%85%D9%86%D8%AA%D8%AC%D8%A7%D8%AA"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition"
              >
                <MessageSquare className="w-4 h-4" />
                <span>واتساب مباشر</span>
              </a>

              {/* Cart Drawer Trigger */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/20 transition active:scale-95 flex items-center gap-2 cursor-pointer"
                aria-label="عرض سلة التسوق"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="hidden sm:inline text-xs font-black">السلة</span>
                {totalCartCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-slate-950 text-amber-400 text-[11px] font-black flex items-center justify-center">
                    {totalCartCount}
                  </span>
                )}
              </button>
            </div>

          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden pb-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="ابحث عن هودي، كوتشي، شنطة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs focus:outline-none focus:border-amber-500 text-slate-900 dark:text-white"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white py-16 sm:py-24 border-b border-slate-800">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-6 text-center lg:text-right">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                <Sparkles className="w-4 h-4" />
                <span>أقوى كولكشن ملابس رجالي وتريندات الشارع 2026</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
                استايلك يبدأ من{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">
                  زيكو ستور
                </span>
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
                تشكيلة حصرية من الهوديز، التيشيرتات الأوفر سايز، السنيكرز المستوردة، والشنط الكروس والكابات والجوارب والملابس الداخلية القطنية 100%. خامات فاخرة، وتوصيل سريع مع ميزة المعاينة قبل الدفع.
              </p>

              {/* Quick action buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <a
                  href="#products-section"
                  className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 transition active:scale-95"
                >
                  تصفح المنتجات الآن 🔥
                </a>
                <a
                  href="https://wa.me/201096986091"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-sm transition"
                >
                  تواصل عبر الواتساب
                </a>
              </div>

              {/* Trust highlights */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800/80 max-w-md mx-auto lg:mx-0 text-center">
                <div>
                  <div className="font-black text-lg text-amber-400">100%</div>
                  <div className="text-[11px] text-slate-400">قطن وخامات أصلية</div>
                </div>
                <div>
                  <div className="font-black text-lg text-amber-400">مجاناً</div>
                  <div className="text-[11px] text-slate-400">شحن فوق 800 ج.م</div>
                </div>
                <div>
                  <div className="font-black text-lg text-amber-400">14 يوم</div>
                  <div className="text-[11px] text-slate-400">استبدال واسترجاع</div>
                </div>
              </div>
            </div>

            {/* Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 group">
                <img
                  src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&auto=format&fit=crop&q=80"
                  alt="ZeKo Store Fashion"
                  className="w-full h-80 sm:h-96 object-cover object-top group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-5 right-5 left-5 p-4 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                      وصل حديثاً
                    </span>
                    <h3 className="font-black text-sm text-white">طقم هودي وسويت شيرت أوفر سايز</h3>
                    <p className="text-xs text-slate-400">قطن ميلتون 100% مبطن وبرة دافية</p>
                  </div>
                  <span className="font-black text-amber-400 text-sm">490 ج.م</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Category Pills Navigation */}
      <section className="sticky top-20 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-black shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-[1.02]'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Products Grid Section */}
      <section id="products-section" className="py-12 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>{CATEGORIES.find(c => c.id === activeCategory)?.label || 'المنتجات'}</span>
                <span className="text-xs font-bold text-slate-500 bg-slate-200/80 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                  {filteredProducts.length} منتج
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                معاينة قبل الاستلام والدفع عند الاستلام لجميع محافظات مصر
              </p>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-amber-500"
              >
                <option value="featured">المميز والأكثر طلباً</option>
                <option value="price-asc">السعر: من الأقل للأعلى</option>
                <option value="price-desc">السعر: من الأعلى للأقل</option>
                <option value="rating">الأعلى تقييماً</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <p className="text-base font-bold text-slate-600 dark:text-slate-400">
                لا توجد منتجات تطابق بحثك حالياً
              </p>
              <button
                onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold"
              >
                عرض جميع المنتجات
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.code}
                  product={prod}
                  onAddToCart={handleAddToCart}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          )}

        </div>
      </section>

      {/* Trust Badges */}
      <TrustBadges />

      {/* WhatsApp Custom Order Banner */}
      <section className="py-12 bg-slate-900 text-white border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black">
            بتدور على مقاس معين أو موديل مش موجود في الموقع؟
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            ابعتلنا صورة الموديل أو المقاس المطلوب على الواتساب وفريق خدمة عملاء زيكو ستور هيوفرهولك بأحسن سعر وتوصيل لحد باب بيتك!
          </p>
          <div className="pt-2">
            <a
              href="https://wa.me/201096986091?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D8%B2%D9%8A%D9%83%D9%88%20%D8%B3%D8%AA%D9%88%D8%B1%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%B7%D9%84%D8%A8%20%D9%85%D8%AE%D8%B5%D8%B5"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition shadow-lg shadow-emerald-600/30"
            >
              <MessageSquare className="w-4 h-4" />
              <span>تواصل مع خدمة العملاء (01096986091)</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 pt-12 pb-8 border-t border-slate-900 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Store Bio */}
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-2.5 text-white">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-lg">
                  Z
                </div>
                <span className="font-black text-base">زيكو ستور | ZeKo Store</span>
              </div>
              <p className="text-slate-400 leading-relaxed max-w-md">
                براند أزياء شبابي مصري يقدم أرقى كولكشن ملابس رجالي، أحذية وسنيكرز ماستر، شنط، كابات، جوارب وملابس داخلية قطنية 100%. نهتم بأدق تفاصيل الجودة والخامة، مع توفير تجربة شراء مضمونة مع المعاينة قبل الاستلام.
              </p>
            </div>

            {/* Quick links */}
            <div className="space-y-2">
              <h4 className="text-white font-bold text-sm">أقسام المتجر</h4>
              <ul className="space-y-1.5 text-slate-400">
                <li><button onClick={() => setActiveCategory('clothing')} className="hover:text-amber-400 transition">ملابس رجالي وهوديز</button></li>
                <li><button onClick={() => setActiveCategory('sneakers')} className="hover:text-amber-400 transition">كوتشيات وسنيكرز</button></li>
                <li><button onClick={() => setActiveCategory('bags')} className="hover:text-amber-400 transition">شنط ومحافظ جلد</button></li>
                <li><button onClick={() => setActiveCategory('caps')} className="hover:text-amber-400 transition">كابات وإكسسوارات</button></li>
                <li><button onClick={() => setActiveCategory('socks')} className="hover:text-amber-400 transition">جوارب رياضية</button></li>
                <li><button onClick={() => setActiveCategory('underwear')} className="hover:text-amber-400 transition">ملابس داخلية قطن</button></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
              <h4 className="text-white font-bold text-sm">خدمة العملاء</h4>
              <ul className="space-y-2 text-slate-400">
                <li className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-amber-500" />
                  <span>الهاتف: 01096986091</span>
                </li>
                <li className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-500" />
                  <span>واتساب: 201096986091+</span>
                </li>
                <li className="text-[11px] text-slate-500">
                  متاحين طوال أيام الأسبوع من 10 صباحاً حتى 11 مساءً.
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright & Mandatory Standalone Branding */}
          <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              جميع الحقوق محفوظة © {new Date().getFullYear()} متجر زيكو ستور (ZeKo Store).
            </div>
            <div>
              <span>تم التصميم والإنشاء بواسطة </span>
              <a
                href="https://ebnywep.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 font-bold underline underline-offset-4 transition-colors"
              >
                EbnyWep
              </a>
            </div>
          </div>

        </div>
      </footer>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
      />

    </div>
  );
}
