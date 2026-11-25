'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
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
  SlidersHorizontal,
  MapPin,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  User,
  Shield
} from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import CartDrawer from '@/components/CartDrawer';
import QuickViewModal from '@/components/QuickViewModal';
import TrustBadges from '@/components/TrustBadges';
import ThemeToggle from '@/components/ThemeToggle';
import { IProduct, ICartItem } from '@/lib/storeHelpers';
import { INITIAL_PRODUCTS } from '@/lib/seedProducts';

const CATEGORIES = [
  { id: 'all', label: 'جميع المنتجات', icon: '🔥' },
  { id: 'clothing', label: 'ملابس رجالي', icon: '👕' },
  { id: 'sneakers', label: 'كوتشيات وسنيكرز', icon: '👟' },
  { id: 'bags', label: 'شنط ومحافظ', icon: '🎒' },
  { id: 'caps', label: 'كابات وإكسسوارات', icon: '🧢' },
  { id: 'socks', label: 'شرابات وجوارب', icon: '🧦' },
  { id: 'underwear', label: 'ملابس داخلية قطن', icon: '🩲' },
];

const STORE_BRANCHES = [
  {
    name: 'فرع الكورنيش القديم',
    address: 'الكورنيش القديم بجوار منتجع فينا، أمام نادي أبناء السويس',
    tag: 'الفرع الرئيسي'
  },
  {
    name: 'فرع شارع الرخاوي',
    address: 'السويس: شارع الرخاوي الجديد بجوار محل فيونكة',
    tag: 'فرع وسط البلد'
  },
  {
    name: 'فرع MINI ZEKO',
    address: 'السويس: أول يمين من شارع الرخاوي الجديد',
    tag: 'ميني زيكو'
  }
];

export default function HomePage() {
  const [products, setProducts] = useState<IProduct[]>(INITIAL_PRODUCTS);
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

  // Current logged in user (Customer or Admin)
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string } | null>(null);

  // Check Auth State on mount
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

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
    <div className="min-h-screen bg-[#f4f4f5] dark:bg-[#121214] text-zinc-900 dark:text-zinc-100 font-sans flex flex-col selection:bg-zinc-800 selection:text-white dark:selection:bg-zinc-200 dark:selection:text-zinc-900" dir="rtl">
      
      {/* Top Slogan & Alert Bar */}
      <div className="bg-zinc-900 text-zinc-200 font-medium text-xs py-2.5 px-4 text-center tracking-wide flex items-center justify-center gap-2 sm:gap-4 border-b border-zinc-800/80">
        <span className="flex items-center gap-1.5 font-bold text-zinc-100">
          <span>🔥</span>
          <span>السوق مش نايم.. انت اللي نايم 🫵🏻😂</span>
        </span>
        <span className="hidden md:inline text-zinc-600">|</span>
        <span className="hidden md:inline text-zinc-300 font-semibold">برند الغلابة - ZeKo Store</span>
        <span className="hidden sm:inline text-zinc-600">|</span>
        <span className="hidden sm:inline text-zinc-400">⚡ استبدال واسترجاع في نفس اليوم | 📍 3 فروع بالسويس</span>
      </div>

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-3 sm:gap-4">
            
            {/* Brand Logo & Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                aria-label="القائمة"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <a href="#" className="flex items-center gap-2.5 group">
                <div className="w-11 h-11 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700/80 shadow-sm group-hover:scale-105 transition-transform shrink-0 bg-white dark:bg-zinc-800">
                  <img
                    src="/images/logo.jpg"
                    alt="ZeKo Store Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="font-black text-lg sm:text-xl tracking-tight text-zinc-950 dark:text-white block leading-none">
                    زيكو ستور
                  </span>
                  <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">
                    ZEKO STORE • برند الغلابة
                  </span>
                </div>
              </a>
            </div>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="ابحث عن هودي، سنيكرز، شنطة كروس، كاب..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 text-xs focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 focus:bg-white dark:focus:bg-zinc-900 text-zinc-900 dark:text-white transition"
                />
                <Search className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Facebook Page Quick Link */}
              <a
                href="https://www.facebook.com/ZeKko17"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold transition"
                title="صفحة الفيسبوك الرسمية (81K متابع)"
              >
                <span>فيسبوك 81K</span>
                <ExternalLink className="w-3 h-3 text-zinc-400" />
              </a>

              {/* WhatsApp VIP Support (Management: Sayed Ward) */}
              <a
                href="https://wa.me/201070091692?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D8%B2%D9%8A%D9%83%D9%88%20%D8%B3%D8%AA%D9%88%D8%B1%D8%8C%20%D8%A3%D9%88%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%A7%D9%84%D9%85%D9%86%D8%AA%D8%AC%D8%A7%D8%AA"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition"
              >
                <MessageSquare className="w-4 h-4" />
                <span>واتساب زيكو ستور</span>
              </a>

              {/* Theme Toggle Button */}
              <ThemeToggle />

              {/* User / Admin / Login Button */}
              {currentUser ? (
                ['admin', 'manager'].includes(currentUser.role) ? (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold text-xs shadow-sm hover:opacity-90 transition"
                    title="الدخول إلى لوحة تحكم الإدارة والمخازن"
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
                    <span>لوحة الإدارة</span>
                  </Link>
                ) : (
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
                    title="حسابي والطلبات"
                  >
                    <User className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="hidden sm:inline max-w-[80px] truncate">{currentUser.name || 'حسابي'}</span>
                  </Link>
                )
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-bold transition"
                  title="تسجيل الدخول / لوحة الإدارة"
                >
                  <User className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="hidden sm:inline">دخول</span>
                </Link>
              )}

              {/* Cart Drawer Trigger */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 sm:px-4 sm:py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 font-bold shadow-sm transition active:scale-95 flex items-center gap-2 cursor-pointer"
                aria-label="عرض سلة التسوق"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline text-xs font-bold">السلة</span>
                {totalCartCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-zinc-100 text-zinc-950 dark:bg-zinc-900 dark:text-zinc-100 text-[11px] font-black flex items-center justify-center">
                    {totalCartCount}
                  </span>
                )}
              </button>
            </div>

          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden pb-3">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="ابحث عن هودي، سنيكرز، شنطة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 text-xs focus:outline-none focus:border-zinc-900 text-zinc-900 dark:text-white"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-zinc-950 text-white py-14 sm:py-20 border-b border-zinc-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-5 text-center lg:text-right">
              
              {/* Authentic Catchphrase Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-800/90 border border-zinc-700 text-zinc-200 text-xs font-bold shadow-sm">
                <span>🔥</span>
                <span>السوق مش نايم.. انت اللي نايم 🫵🏻😂</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
                استايلك يبدأ من{' '}
                <span className="text-white block sm:inline">
                  زيكو ستور
                </span>
                <span className="block text-xl sm:text-2xl lg:text-3xl font-bold text-zinc-400 mt-2">
                  برند الغلابة • What Men Need
                </span>
              </h1>

              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto lg:mx-0">
                تشكيلة حصرية من الهوديز، التيشيرتات الأوفر سايز، السنيكرز المستوردة ماستر كواليتي، والشنط الكروس والكابات والجوارب والملابس الداخلية القطنية 100%. خامات فاخرة، فروعنا بالسويس، مع استبدال واسترجاع في نفس اليوم!
              </p>

              {/* Quick action buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <a
                  href="#products-section"
                  className="px-6 py-3.5 rounded-2xl bg-zinc-100 hover:bg-white text-zinc-950 font-black text-xs sm:text-sm shadow-md transition active:scale-95"
                >
                  تصفح المنتجات الآن 🔥
                </a>
                
                <a
                  href="https://wa.me/201070091692?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D8%B2%D9%8A%D9%83%D9%88%20%D8%B3%D8%AA%D9%88%D8%B1%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%AA%D9%88%D8%A7%D8%B5%D9%84%20%D9%85%D8%B9%20%D8%A7%D9%84%D8%A5%D8%AF%D8%A7%D8%B1%D8%A9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold text-xs sm:text-sm transition flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>تواصل عبر الواتساب</span>
                </a>

                <a
                  href="https://www.facebook.com/ZeKko17"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3.5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-semibold text-xs sm:text-sm transition flex items-center gap-1.5"
                >
                  <span>صفحتنا على الفيس</span>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                </a>
              </div>

              {/* Trust highlights */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-zinc-800/80 max-w-md mx-auto lg:mx-0 text-center">
                <div>
                  <div className="font-black text-lg text-zinc-100">100%</div>
                  <div className="text-[11px] text-zinc-400">قطن وخامات أصلية</div>
                </div>
                <div>
                  <div className="font-black text-lg text-zinc-100">3 فروع</div>
                  <div className="text-[11px] text-zinc-400">في محافظة السويس</div>
                </div>
                <div>
                  <div className="font-black text-lg text-zinc-100">نفس اليوم</div>
                  <div className="text-[11px] text-zinc-400">استبدال واسترجاع في نفس اليوم</div>
                </div>
              </div>
            </div>

            {/* Hero Visual Card (Official Facebook Cover) */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-900 group">
                <img
                  src="/images/cover.jpg"
                  alt="ZeKo Store - What Men Need"
                  className="w-full h-80 sm:h-96 object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                
                {/* Floating Bottom Card */}
                <div className="absolute bottom-4 right-4 left-4 p-4 rounded-2xl bg-zinc-900/90 backdrop-blur-md border border-zinc-700 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      السوق مش نايم انت الي نايم 🫵🏻
                    </span>
                    <h3 className="font-black text-sm text-white mt-0.5">ZeKo Store • What Men Need</h3>
                    <p className="text-[11px] text-zinc-400">السويس: الكورنيش القديم • شارع الرخاوي • ميني زيكو</p>
                  </div>
                  <a
                    href="https://www.facebook.com/ZeKko17"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition flex items-center gap-1 shrink-0"
                  >
                    81K متابع
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Store Branches Ribbon */}
      <section className="bg-zinc-100 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800/80 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 shrink-0">
              <MapPin className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
              <span>فروع زيكو ستور في السويس:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full md:w-auto text-xs">
              {STORE_BRANCHES.map((b, i) => (
                <div
                  key={i}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-300 flex items-center justify-between gap-2 shadow-2xs"
                >
                  <span className="font-bold text-[11px]">{b.name}:</span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">{b.address}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills Navigation */}
      <section className="sticky top-20 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-sm scale-[1.02]'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
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
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
                <span>{CATEGORIES.find(c => c.id === activeCategory)?.label || 'المنتجات'}</span>
                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 bg-zinc-200/80 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full">
                  {filteredProducts.length} منتج
                </span>
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                أقوى كولكشن ملابس وسنيكرز في السويس مع ميزة الاستبدال والاسترجاع في نفس اليوم
              </p>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-zinc-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 cursor-pointer"
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
              <p className="text-base font-bold text-zinc-600 dark:text-zinc-400">
                لا توجد منتجات تطابق بحثك حالياً
              </p>
              <button
                onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-xs font-bold cursor-pointer"
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
                  storePhone="201070091692"
                />
              ))}
            </div>
          )}

        </div>
      </section>

      {/* Trust Badges */}
      <TrustBadges />

      {/* WhatsApp Custom Order Banner */}
      <section className="py-12 bg-zinc-900 text-white border-t border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-zinc-200 border border-zinc-700 flex items-center justify-center mx-auto">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black">
            بتدور على مقاس معين أو موديل مش لاقيه؟
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            ابعتلنا صورة الموديل أو المقاس المطلوب على الواتساب وفريق زيكو ستور هيوفرهولك بأحسن سعر وتوصيل لحد باب بيتك!
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://wa.me/201070091692?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D8%B2%D9%8A%D9%83%D9%88%20%D8%B3%D8%AA%D9%88%D8%B1%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%B7%D9%84%D8%A8%20%D9%85%D8%AE%D8%B5%D8%B5"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md"
            >
              <MessageSquare className="w-4 h-4" />
              <span>واتساب زيكو ستور (01070091692)</span>
            </a>
            
            <a
              href="https://www.facebook.com/ZeKko17"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-bold text-xs transition"
            >
              <ExternalLink className="w-4 h-4" />
              <span>زيارة صفحة الفيسبوك</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 text-zinc-400 pt-12 pb-8 border-t border-zinc-900 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Store Bio */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 text-white">
                <div className="w-9 h-9 rounded-xl overflow-hidden border border-zinc-800 bg-white">
                  <img src="/images/logo.webp" alt="Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="font-black text-base block">زيكو ستور | ZeKo Store</span>
                  <span className="text-[10px] text-zinc-500">برند الغلابة • السوق مش نايم انت الي نايم 🫵🏻</span>
                </div>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                براند أزياء شبابي مصري يقدم أرقى كولكشن ملابس رجالي، أحذية وسنيكرز ماستر كواليتي، شنط، كابات، جوارب وملابس داخلية قطنية 100%. خامات فاخرة مع استبدال واسترجاع في نفس اليوم.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <a
                  href="https://www.facebook.com/ZeKko17"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold flex items-center gap-1.5"
                >
                  <span>صفحة الفيسبوك (81K)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Important Pages & Policy Links */}
            <div className="space-y-2">
              <h4 className="text-white font-bold text-sm">عن المتجر والسياسات</h4>
              <ul className="space-y-2 text-zinc-400">
                <li>
                  <Link href="/about" className="hover:text-white transition flex items-center gap-1.5">
                    <span>←</span>
                    <span>من نحن (قصة زيكو ستور)</span>
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition flex items-center gap-1.5">
                    <span>←</span>
                    <span>سياسة الخصوصية وحماية البيانات</span>
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition flex items-center gap-1.5">
                    <span>←</span>
                    <span>الشروط وسياسة الاستبدال في نفس اليوم</span>
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition flex items-center gap-1.5 font-bold text-zinc-300">
                    <span>←</span>
                    <span>تسجيل الدخول / لوحة الإدارة</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Branches list */}
            <div className="space-y-2">
              <h4 className="text-white font-bold text-sm">فروعنا في السويس</h4>
              <ul className="space-y-2 text-zinc-400">
                <li className="space-y-0.5">
                  <span className="font-bold text-zinc-200 block">1. فرع الكورنيش القديم:</span>
                  <span className="text-[11px] text-zinc-400">جنب منتجع فينا، أمام نادي أبناء السويس</span>
                </li>
                <li className="space-y-0.5">
                  <span className="font-bold text-zinc-200 block">2. فرع شارع الرخاوي:</span>
                  <span className="text-[11px] text-zinc-400">شارع الرخاوي الجديد، جنب محل فيونكة</span>
                </li>
                <li className="space-y-0.5">
                  <span className="font-bold text-zinc-200 block">3. فرع ميني زيكو (MINI ZEKO):</span>
                  <span className="text-[11px] text-zinc-400">أول يمين من شارع الرخاوي الجديد</span>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
              <h4 className="text-white font-bold text-sm">التواصل وخدمة العملاء</h4>
              <ul className="space-y-2.5 text-zinc-400">
                <li className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>واتساب وطلب أوردرات: <span className="font-mono text-zinc-200">01070091692</span></span>
                </li>
                <li className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span>خدمة العملاء والاتصال: <span className="font-mono text-zinc-200">01096986091</span></span>
                </li>
                <li className="text-[11px] text-zinc-500 pt-1">
                  متاحين طوال أيام الأسبوع لخدمتكم واستبدال فوري في نفس اليوم.
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright & Branding */}
          <div className="pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
            <div>
              جميع الحقوق محفوظة © {new Date().getFullYear()} متجر زيكو ستور (ZeKo Store) - برند الغلابة.
            </div>
            <div>
              <span>تم التصميم والإنشاء بواسطة </span>
              <a
                href="https://ebnywep.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-300 hover:text-white font-bold underline underline-offset-4 transition-colors"
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
        storePhone="201070091692"
      />

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        storePhone="201070091692"
      />

    </div>
  );
}
