'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Warehouse,
  Boxes,
  ArrowLeftRight,
  PackagePlus,
  PackageMinus,
  PackageCheck,
  Truck,
  Building2,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  LogOut,
  Eye,
  RefreshCw,
  Store,
  Layers,
  DollarSign,
  ShoppingBag,
  X,
  ChevronDown,
  Check,
  MapPin,
  Phone,
  ShieldAlert,
  ArrowUpRight,
  ExternalLink,
  History,
  Tag
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

// Interfaces
interface IAdminUser {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'user' | 'manager' | 'admin';
  permissions: string[];
  assignedWarehouse?: string;
  isBlocked: boolean;
  avatar?: string;
  createdAt: string;
}

interface IWarehouseItem {
  _id: string;
  code: string;
  name: string;
  city: string;
  location: string;
  managerName?: string;
  managerPhone?: string;
  capacity?: number;
  isActive: boolean;
  notes?: string;
}

interface IStockMovement {
  _id: string;
  type: 'in' | 'out' | 'transfer' | 'adjustment';
  productCode: string;
  productTitle: string;
  warehouseCode?: string;
  warehouseName?: string;
  fromWarehouseCode?: string;
  fromWarehouseName?: string;
  toWarehouseCode?: string;
  toWarehouseName?: string;
  quantity: number;
  previousQuantity?: number;
  newQuantity?: number;
  performedByName: string;
  reason?: string;
  notes?: string;
  createdAt: string;
}

interface IAdminProduct {
  _id: string;
  code: string;
  title: string;
  category: string;
  categoryAr?: string;
  price: number;
  oldPrice?: number;
  images: string[];
  totalStock?: number;
  primaryLocation?: string;
  shelfLocation?: string;
  availableBranches?: string[];
  warehouseStock?: { warehouseCode: string; warehouseName: string; quantity: number; shelfLocation?: string }[];
  inStock: boolean;
  featured?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
}

interface IAdminOrder {
  _id: string;
  orderNumber?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  city: string;
  address: string;
  items: {
    product: string;
    productTitle: string;
    productCode?: string;
    price: number;
    quantity: number;
    selectedSize?: string;
    selectedColor?: string;
  }[];
  totalPrice: number;
  orderStatus: 'pending' | 'confirmed' | 'processing_in_warehouse' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid';
  warehouseNotes?: string;
  createdAt: string;
}

export default function AdminPage() {
  const router = useRouter();

  // Authentication & Current User
  const [currentUser, setCurrentUser] = useState<IAdminUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'warehouses' | 'inventory' | 'products' | 'orders' | 'users'>('overview');

  // Global Toast Message
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ===================== DATA STATES =====================
  // Warehouses
  const [warehouses, setWarehouses] = useState<IWarehouseItem[]>([]);
  const [warehousesLoading, setWarehousesLoading] = useState(false);

  // Inventory & Movements
  const [inventoryProducts, setInventoryProducts] = useState<IAdminProduct[]>([]);
  const [movements, setMovements] = useState<IStockMovement[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState<string>('all');
  const [lowStockOnly, setLowStockOnly] = useState<boolean>(false);
  const [inventorySearch, setInventorySearch] = useState<string>('');

  // Products
  const [products, setProducts] = useState<IAdminProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');

  // Orders
  const [orders, setOrders] = useState<IAdminOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Users
  const [users, setUsers] = useState<IAdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  // Stats
  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    totalWarehouses: 4,
    totalProducts: 105,
    totalStockPieces: 0,
    lowStockCount: 0,
    totalOrders: 0,
  });

  // ===================== MODALS STATE =====================
  // 1. Warehouse Modal (Add / Edit)
  const [warehouseModalOpen, setWarehouseModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<IWarehouseItem | null>(null);
  const [warehouseForm, setWarehouseForm] = useState({
    code: '',
    name: '',
    city: 'السويس',
    location: '',
    managerName: '',
    managerPhone: '',
    capacity: 1000,
    isActive: true,
    notes: '',
  });

  // 2. Stock Transfer Modal
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferForm, setTransferForm] = useState({
    productId: '',
    fromWarehouseCode: 'WH-MAIN-CENTRAL',
    toWarehouseCode: 'WH-KORNISH',
    quantity: 1,
    reason: 'تغذية فرع السويس بالبضاعة المطلوبة',
    notes: '',
  });
  const [transferSubmitting, setTransferSubmitting] = useState(false);

  // 3. Stock Adjustment / In / Out Modal
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjustForm, setAdjustForm] = useState({
    productId: '',
    warehouseCode: 'WH-MAIN-CENTRAL',
    type: 'in' as 'in' | 'out' | 'adjustment',
    quantity: 10,
    reason: 'استلام شحنة جديدة من المصنع',
    notes: '',
  });
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);

  // 4. User Role & Permissions Modal
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<IAdminUser | null>(null);
  const [userRoleForm, setUserRoleForm] = useState({
    role: 'user' as 'user' | 'manager' | 'admin',
    assignedWarehouse: '',
    permissions: [] as string[],
    isBlocked: false,
  });
  const [userSubmitting, setUserSubmitting] = useState(false);

  // 5. Create User / Manager Modal
  const [createUserModalOpen, setCreateUserModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'manager' as 'user' | 'manager' | 'admin',
    assignedWarehouse: 'WH-KORNISH',
    permissions: ['manage_inventory', 'manage_orders'],
  });
  const [createUserSubmitting, setCreateUserSubmitting] = useState(false);

  // 6. Quick Edit Product Modal
  const [editProductModalOpen, setEditProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<IAdminProduct | null>(null);
  const [productForm, setProductForm] = useState({
    price: 0,
    oldPrice: 0,
    totalStock: 0,
    primaryLocation: 'المخزن المركزي',
    shelfLocation: 'الرف A-01',
    inStock: true,
    featured: false,
    bestseller: false,
  });
  const [productSubmitting, setProductSubmitting] = useState(false);

  // ===================== AUTHENTICATION CHECK =====================
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated || !['admin', 'manager'].includes(data.user?.role)) {
          router.push('/login');
        } else {
          setCurrentUser(data.user);
          fetchAllData();
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setAuthLoading(false));
  }, [router]);

  // Fetch all dashboard data
  const fetchAllData = () => {
    fetchWarehouses();
    fetchInventory();
    fetchProducts();
    fetchOrders();
    fetchUsers();
    fetchStats();
  };

  // 1. Fetch Warehouses
  const fetchWarehouses = async () => {
    try {
      setWarehousesLoading(true);
      const res = await fetch('/api/admin/warehouses');
      const data = await res.json();
      if (data.success) {
        setWarehouses(data.warehouses);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setWarehousesLoading(false);
    }
  };

  // 2. Fetch Inventory
  const fetchInventory = async () => {
    try {
      setInventoryLoading(true);
      const params = new URLSearchParams();
      if (selectedWarehouseFilter !== 'all') params.append('warehouse', selectedWarehouseFilter);
      if (lowStockOnly) params.append('lowStock', 'true');
      if (inventorySearch) params.append('search', inventorySearch);

      const res = await fetch(`/api/admin/inventory?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setInventoryProducts(data.products || []);
        setMovements(data.recentMovements || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setInventoryLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchInventory();
    }
  }, [selectedWarehouseFilter, lowStockOnly]);

  // 3. Fetch Products
  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProductsLoading(false);
    }
  };

  // 4. Fetch Orders
  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setOrdersLoading(false);
    }
  };

  // 5. Fetch Users
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(userSearch)}&role=${userRoleFilter}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUsersLoading(false);
    }
  };

  // 6. Fetch Stats
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ===================== ACTIONS HANDLERS =====================

  // Save / Update Warehouse
  const handleSaveWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingWarehouse ? 'PATCH' : 'POST';
      const body = editingWarehouse ? { id: editingWarehouse._id, ...warehouseForm } : warehouseForm;

      const res = await fetch('/api/admin/warehouses', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        showToast(editingWarehouse ? 'تم تحديث بيانات المخزن بنجاح' : 'تم إضافة المخزن الجديد بنجاح');
        setWarehouseModalOpen(false);
        setEditingWarehouse(null);
        fetchWarehouses();
        fetchStats();
      } else {
        showToast(data.message || 'حدث خطأ', 'error');
      }
    } catch (err: any) {
      showToast('خطأ في الاتصال بالخادم', 'error');
    }
  };

  // Delete Warehouse
  const handleDeleteWarehouse = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف ${name}؟`)) return;
    try {
      const res = await fetch(`/api/admin/warehouses?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('تم حذف المخزن بنجاح');
        fetchWarehouses();
        fetchStats();
      } else {
        showToast(data.message || 'فشل حذف المخزن', 'error');
      }
    } catch (e) {
      showToast('خطأ في الاتصال بالخادم', 'error');
    }
  };

  // Execute Stock Transfer
  const handleStockTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (transferForm.fromWarehouseCode === transferForm.toWarehouseCode) {
      showToast('لا يمكن التحويل لنفس المخزن!', 'error');
      return;
    }
    setTransferSubmitting(true);
    try {
      const res = await fetch('/api/admin/inventory/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transferForm),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`تم تحويل ${transferForm.quantity} قطعة بنجاح!`);
        setTransferModalOpen(false);
        fetchInventory();
        fetchStats();
      } else {
        showToast(data.message || 'فشل التحويل المخزني', 'error');
      }
    } catch (err: any) {
      showToast('خطأ أثناء تنفيذ التحويل', 'error');
    } finally {
      setTransferSubmitting(false);
    }
  };

  // Execute Stock In/Out/Adjustment
  const handleStockAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdjustSubmitting(true);
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adjustForm),
      });
      const data = await res.json();
      if (data.success) {
        showToast('تم تسجيل الحركة المخزنية وتحديث الرصيد بنجاح!');
        setAdjustModalOpen(false);
        fetchInventory();
        fetchStats();
      } else {
        showToast(data.message || 'فشل تسجيل الحركة', 'error');
      }
    } catch (err: any) {
      showToast('خطأ أثناء تسجيل الحركة', 'error');
    } finally {
      setAdjustSubmitting(false);
    }
  };

  // Update User Role & Permissions
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setUserSubmitting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingUser.id,
          role: userRoleForm.role,
          assignedWarehouse: userRoleForm.assignedWarehouse,
          permissions: userRoleForm.permissions,
          isBlocked: userRoleForm.isBlocked,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('تم تحديث صلاحيات ورتبة المستخدم بنجاح');
        setUserModalOpen(false);
        setEditingUser(null);
        fetchUsers();
      } else {
        showToast(data.message || 'فشل التحديث', 'error');
      }
    } catch (err: any) {
      showToast('خطأ في الاتصال بالخادم', 'error');
    } finally {
      setUserSubmitting(false);
    }
  };

  // Create New User / Manager
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateUserSubmitting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserForm),
      });
      const data = await res.json();
      if (data.success) {
        showToast('تم إنشاء الحساب وتعيين الصلاحيات بنجاح!');
        setCreateUserModalOpen(false);
        setNewUserForm({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          phone: '',
          role: 'manager',
          assignedWarehouse: 'WH-KORNISH',
          permissions: ['manage_inventory', 'manage_orders'],
        });
        fetchUsers();
      } else {
        showToast(data.message || 'فشل إنشاء الحساب', 'error');
      }
    } catch (err: any) {
      showToast('خطأ في الاتصال بالخادم', 'error');
    } finally {
      setCreateUserSubmitting(false);
    }
  };

  // Update Product Price / Stock
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setProductSubmitting(true);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingProduct._id,
          price: productForm.price,
          oldPrice: productForm.oldPrice,
          totalStock: productForm.totalStock,
          primaryLocation: productForm.primaryLocation,
          shelfLocation: productForm.shelfLocation,
          inStock: productForm.inStock,
          featured: productForm.featured,
          bestseller: productForm.bestseller,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('تم تحديث بيانات المنتج بنجاح');
        setEditProductModalOpen(false);
        setEditingProduct(null);
        fetchProducts();
        fetchInventory();
      } else {
        showToast(data.message || 'فشل تحديث المنتج', 'error');
      }
    } catch (err: any) {
      showToast('خطأ في الاتصال بالخادم', 'error');
    } finally {
      setProductSubmitting(false);
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, orderStatus: string, paymentStatus?: string) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, orderStatus, paymentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('تم تحديث حالة الطلب بنجاح');
        fetchOrders();
      } else {
        showToast(data.message || 'فشل تحديث حالة الطلب', 'error');
      }
    } catch (e) {
      showToast('خطأ في الاتصال بالخادم', 'error');
    }
  };

  // Logout
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  // Filtered Products for Products Tab
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.code.toLowerCase().includes(productSearch.toLowerCase());
      const matchesCategory =
        productCategoryFilter === 'all' || p.category === productCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, productSearch, productCategoryFilter]);

  // Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 border-4 border-zinc-700 border-t-white rounded-full animate-spin" />
        <p className="text-zinc-400 font-bold text-sm tracking-wide">جاري التحقق من صلاحيات الإدارة...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-zinc-800 selection:text-white" dir="rtl">
      
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 left-6 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border text-sm font-bold animate-in fade-in slide-in-from-bottom-5 ${
            toast.type === 'success'
              ? 'bg-zinc-900 border-emerald-500/50 text-emerald-400 shadow-emerald-950/40'
              : 'bg-zinc-900 border-rose-500/50 text-rose-400 shadow-rose-950/40'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            
            {/* Logo & Platform Info */}
            <div className="flex items-center gap-3.5">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-2xl overflow-hidden border border-zinc-700 bg-white shadow-sm group-hover:scale-105 transition-transform shrink-0">
                  <img src="/images/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg text-white">زيكو ستور</span>
                    <span className="text-[10px] bg-zinc-800 text-zinc-300 font-mono px-2 py-0.5 rounded-full border border-zinc-700">
                      ADMIN
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 font-medium hidden sm:block">
                    إدارة المخازن والفروع وحركات البضاعة بالسويس
                  </span>
                </div>
              </Link>
            </div>

            {/* User Profile & Actions */}
            <div className="flex items-center gap-3">
              <Link
                href="/"
                target="_blank"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 border border-zinc-700/80 transition"
              >
                <span>معاينة المتجر</span>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
              </Link>

              {/* Current User Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-800/80 border border-zinc-700/80 text-xs">
                <div className="w-6 h-6 rounded-lg bg-zinc-700 flex items-center justify-center font-bold text-white text-[11px]">
                  {currentUser?.name?.slice(0, 1) || 'Z'}
                </div>
                <div className="text-right">
                  <span className="font-bold text-white block leading-tight">{currentUser?.name}</span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {currentUser?.role === 'admin' ? '👑 مدير عام (Admin)' : `مشرف (${currentUser?.assignedWarehouse || 'فرع'})`}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-zinc-800/60 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400 border border-zinc-700/60 transition cursor-pointer"
                title="تسجيل الخروج"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Navigation Tabs Bar */}
          <div className="flex items-center gap-1 overflow-x-auto py-2.5 scrollbar-none border-t border-zinc-800/80 text-xs font-bold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition cursor-pointer shrink-0 ${
                activeTab === 'overview'
                  ? 'bg-zinc-100 text-zinc-950 shadow-md font-black'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>نظرة عامة وإحصائيات</span>
            </button>

            <button
              onClick={() => setActiveTab('warehouses')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition cursor-pointer shrink-0 ${
                activeTab === 'warehouses'
                  ? 'bg-zinc-100 text-zinc-950 shadow-md font-black'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <Warehouse className="w-4 h-4" />
              <span>إدارة المخازن والفروع ({warehouses.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition cursor-pointer shrink-0 ${
                activeTab === 'inventory'
                  ? 'bg-zinc-100 text-zinc-950 shadow-md font-black'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>الجرد والتحويل المخزني</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition cursor-pointer shrink-0 ${
                activeTab === 'products'
                  ? 'bg-zinc-100 text-zinc-950 shadow-md font-black'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>المنتجات والأسعار ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition cursor-pointer shrink-0 ${
                activeTab === 'orders'
                  ? 'bg-zinc-100 text-zinc-950 shadow-md font-black'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>إدارة الطلبات ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition cursor-pointer shrink-0 ${
                activeTab === 'users'
                  ? 'bg-zinc-100 text-zinc-950 shadow-md font-black'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>المستخدمين والصلاحيات ({users.length})</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* ========================================================
            TAB 1: OVERVIEW (نظرة عامة)
        ======================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm space-y-2">
                <div className="w-9 h-9 rounded-xl bg-zinc-800 text-zinc-300 flex items-center justify-center">
                  <Warehouse className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-zinc-400 font-bold block">فروع ومخازن السويس</span>
                  <span className="text-xl font-black text-white">{warehouses.length || 4}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm space-y-2">
                <div className="w-9 h-9 rounded-xl bg-zinc-800 text-zinc-300 flex items-center justify-center">
                  <Boxes className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-zinc-400 font-bold block">إجمالي قطع البضاعة</span>
                  <span className="text-xl font-black text-white">{stats.totalStockPieces || '3,150'}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm space-y-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-zinc-400 font-bold block">تنبيهات نواقص المخزون</span>
                  <span className="text-xl font-black text-amber-400">{stats.lowStockCount || 0}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm space-y-2">
                <div className="w-9 h-9 rounded-xl bg-zinc-800 text-zinc-300 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-zinc-400 font-bold block">المنتجات في الكتالوج</span>
                  <span className="text-xl font-black text-white">{products.length || 105}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm space-y-2">
                <div className="w-9 h-9 rounded-xl bg-zinc-800 text-zinc-300 flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-zinc-400 font-bold block">إجمالي الطلبات</span>
                  <span className="text-xl font-black text-white">{orders.length}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm space-y-2">
                <div className="w-9 h-9 rounded-xl bg-zinc-800 text-zinc-300 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-zinc-400 font-bold block">المستخدمين والمشرفين</span>
                  <span className="text-xl font-black text-white">{users.length}</span>
                </div>
              </div>

            </div>

            {/* Quick Action Shortcuts */}
            <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
              <h3 className="font-black text-sm text-white flex items-center gap-2">
                <ZapIcon className="w-4 h-4 text-zinc-400" />
                <span>إجراءات سريعة لإدارة المتجر والمخازن</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  onClick={() => setTransferModalOpen(true)}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 text-right transition cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-zinc-700 flex items-center justify-center text-white shrink-0">
                    <ArrowLeftRight className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">تحويل بضاعة بين المخازن</h4>
                    <p className="text-[10px] text-zinc-400">نقل كميات من المركزي للفروع</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setEditingWarehouse(null);
                    setWarehouseForm({
                      code: `WH-SUEZ-${Date.now().toString().slice(-3)}`,
                      name: '',
                      city: 'السويس',
                      location: '',
                      managerName: '',
                      managerPhone: '',
                      capacity: 1000,
                      isActive: true,
                      notes: '',
                    });
                    setWarehouseModalOpen(true);
                  }}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 text-right transition cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-zinc-700 flex items-center justify-center text-white shrink-0">
                    <Warehouse className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">إضافة فرع / مخزن جديد</h4>
                    <p className="text-[10px] text-zinc-400">إضافة نقطة بيع أو مخزن جديد</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setAdjustForm({
                      productId: products[0]?._id || '',
                      warehouseCode: 'WH-MAIN-CENTRAL',
                      type: 'in',
                      quantity: 20,
                      reason: 'توريد بضاعة جديدة من المصنع',
                      notes: '',
                    });
                    setAdjustModalOpen(true);
                  }}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 text-right transition cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-zinc-700 flex items-center justify-center text-white shrink-0">
                    <PackagePlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">إذن استلام بضاعة جديدة</h4>
                    <p className="text-[10px] text-zinc-400">إضافة كميات للمخزن المركزي</p>
                  </div>
                </button>

                <button
                  onClick={() => setCreateUserModalOpen(true)}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 text-right transition cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-zinc-700 flex items-center justify-center text-white shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">إضافة مشرف فرع جديد</h4>
                    <p className="text-[10px] text-zinc-400">منح صلاحيات لإدارة فرع معين</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Branches Status Overview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-zinc-400" />
                  <span>فروع زيكو ستور والمخزن المركزي في السويس</span>
                </h3>
                <button
                  onClick={() => setActiveTab('warehouses')}
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition"
                >
                  <span>عرض التفاصيل الكاملة</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {warehouses.map((wh) => (
                  <div
                    key={wh._id}
                    className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {wh.code}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          wh.isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        {wh.isActive ? 'نشط ويعمل' : 'معطل'}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-white">{wh.name}</h4>
                      <p className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
                        <span>{wh.location || 'السويس'}</span>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                      <span>المسؤول: {wh.managerName || 'فريق زيكو'}</span>
                      <span className="font-mono text-zinc-300">{wh.managerPhone || '01070091692'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Movements Log Preview */}
            <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-zinc-400" />
                  <span>آخر حركات المخازن والتحويلات المكتملة</span>
                </h3>
                <button
                  onClick={() => setActiveTab('inventory')}
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition"
                >
                  <span>عرض سجل الجرد الكامل</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {movements.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 text-xs">
                  لا توجد حركات مخزنية حديثة مسجلة. قم بتجربة التحويل أو إضافة بضاعة.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-400">
                        <th className="py-2.5 px-3">نوع الحركة</th>
                        <th className="py-2.5 px-3">المنتج</th>
                        <th className="py-2.5 px-3">الكمية</th>
                        <th className="py-2.5 px-3">من مخزن</th>
                        <th className="py-2.5 px-3">إلى مخزن</th>
                        <th className="py-2.5 px-3">المسؤول</th>
                        <th className="py-2.5 px-3">التاريخ والوقت</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {movements.slice(0, 5).map((m) => (
                        <tr key={m._id} className="hover:bg-zinc-800/30">
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                m.type === 'transfer'
                                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                  : m.type === 'in'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}
                            >
                              {m.type === 'transfer' ? 'تحويل بين مخازن' : m.type === 'in' ? 'إذن إضافة' : 'تسوية'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-bold text-white">{m.productTitle}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-zinc-200">{m.quantity} قطعة</td>
                          <td className="py-2.5 px-3 text-zinc-400">{m.fromWarehouseName || m.warehouseName || '-'}</td>
                          <td className="py-2.5 px-3 text-zinc-400">{m.toWarehouseName || '-'}</td>
                          <td className="py-2.5 px-3 text-zinc-300">{m.performedByName}</td>
                          <td className="py-2.5 px-3 text-zinc-500 font-mono">
                            {new Date(m.createdAt).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ========================================================
            TAB 2: WAREHOUSES (إدارة المخازن والفروع)
        ======================================================== */}
        {activeTab === 'warehouses' && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white">إدارة الفروع والمخازن بالسويس</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  توزيع نقاط البيع والمخازن التابعة لمتجر زيكو ستور (فروع السويس والمخزن المركزي)
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingWarehouse(null);
                  setWarehouseForm({
                    code: `WH-SUEZ-${Date.now().toString().slice(-3)}`,
                    name: '',
                    city: 'السويس',
                    location: '',
                    managerName: '',
                    managerPhone: '',
                    capacity: 1000,
                    isActive: true,
                    notes: '',
                  });
                  setWarehouseModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-black transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة فرع / مخزن جديد</span>
              </button>
            </div>

            {warehousesLoading ? (
              <div className="py-12 text-center text-zinc-500 text-xs">جاري تحميل الفروع والمخازن...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {warehouses.map((wh) => (
                  <div
                    key={wh._id}
                    className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {wh.code}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            wh.isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-zinc-800 text-zinc-500'
                          }`}
                        >
                          {wh.isActive ? 'نشط' : 'غير نشط'}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-black text-sm text-white">{wh.name}</h3>
                        <p className="text-xs text-zinc-400 mt-1 flex items-start gap-1.5 leading-relaxed">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-zinc-500 mt-0.5" />
                          <span>{wh.location || 'محافظة السويس'}</span>
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-zinc-800 text-xs text-zinc-400">
                        <div className="flex items-center justify-between">
                          <span>المسؤول:</span>
                          <span className="font-bold text-zinc-200">{wh.managerName || 'فريق زيكو ستور'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>رقم الهاتف:</span>
                          <span className="font-mono text-zinc-200">{wh.managerPhone || '01070091692'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>السعة الاستيعابية:</span>
                          <span className="font-mono text-zinc-200">{wh.capacity || 1000} قطعة</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingWarehouse(wh);
                          setWarehouseForm({
                            code: wh.code,
                            name: wh.name,
                            city: wh.city,
                            location: wh.location,
                            managerName: wh.managerName || '',
                            managerPhone: wh.managerPhone || '',
                            capacity: wh.capacity || 1000,
                            isActive: wh.isActive,
                            notes: wh.notes || '',
                          });
                          setWarehouseModalOpen(true);
                        }}
                        className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition cursor-pointer"
                        title="تعديل بيانات المخزن"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteWarehouse(wh._id, wh.name)}
                        className="p-2 rounded-xl bg-zinc-800 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400 text-xs font-bold transition cursor-pointer"
                        title="حذف المخزن"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* ========================================================
            TAB 3: INVENTORY & TRANSFERS (الجرد والتحويل المخزني)
        ======================================================== */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white">الجرد والتحويلات المخزنية</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  مراقبة أرصدة القطع وتوزيعها على الفروع والمخزن المركزي مع إمكانية التحويل اللحظي
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setAdjustForm({
                      productId: products[0]?._id || '',
                      warehouseCode: 'WH-MAIN-CENTRAL',
                      type: 'in',
                      quantity: 10,
                      reason: 'توريد بضاعة جديدة',
                      notes: '',
                    });
                    setAdjustModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-bold transition cursor-pointer"
                >
                  <PackagePlus className="w-4 h-4" />
                  <span>إذن إضافة / صرف</span>
                </button>

                <button
                  onClick={() => setTransferModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-black transition cursor-pointer"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>تحويل بضاعة بين المخازن</span>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
              
              <div className="flex flex-wrap items-center gap-3 flex-1">
                {/* Search Product */}
                <div className="relative min-w-[240px] flex-1">
                  <Search className="w-4 h-4 text-zinc-500 absolute right-3 top-3" />
                  <input
                    type="text"
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchInventory()}
                    placeholder="ابحث باسم المنتج أو الكود في المخازن..."
                    className="w-full pr-9 pl-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                  />
                </div>

                {/* Warehouse Dropdown */}
                <select
                  value={selectedWarehouseFilter}
                  onChange={(e) => setSelectedWarehouseFilter(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2 focus:outline-none"
                >
                  <option value="all">كل الفروع والمخازن</option>
                  {warehouses.map((w) => (
                    <option key={w.code} value={w.code}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>

                {/* Low Stock Toggle */}
                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300 select-none px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800">
                  <input
                    type="checkbox"
                    checked={lowStockOnly}
                    onChange={(e) => setLowStockOnly(e.target.checked)}
                    className="rounded bg-zinc-800 border-zinc-700 text-zinc-100"
                  />
                  <span>عرض النواقص فقط (أقل من 5 قطع)</span>
                </label>
              </div>

              <button
                onClick={fetchInventory}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition cursor-pointer"
                title="تحديث البيانات"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

            </div>

            {/* Inventory Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-zinc-950/60 border-b border-zinc-800 text-zinc-400 font-bold">
                      <th className="py-3 px-4">كود المنتج</th>
                      <th className="py-3 px-4">صورة واسم الموديل</th>
                      <th className="py-3 px-4">الفئة</th>
                      <th className="py-3 px-4">توزيع الكميات بالفروع (السويس)</th>
                      <th className="py-3 px-4">إجمالي الرصيد</th>
                      <th className="py-3 px-4">الحالة</th>
                      <th className="py-3 px-4 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {inventoryProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-zinc-500">
                          لا توجد منتجات مطابقة لخيارات البحث أو الفلتر المحددة.
                        </td>
                      </tr>
                    ) : (
                      inventoryProducts.map((p) => {
                        const totalStock = p.totalStock ?? 30;
                        const isLow = totalStock <= 5;
                        return (
                          <tr key={p._id} className="hover:bg-zinc-800/40 transition">
                            <td className="py-3 px-4 font-mono font-bold text-zinc-300">{p.code}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700 shrink-0">
                                  <img
                                    src={p.images?.[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=100'}
                                    alt={p.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <span className="font-bold text-white max-w-[220px] truncate block">{p.title}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-zinc-400">{p.categoryAr || p.category}</td>
                            <td className="py-3 px-4">
                              <div className="flex flex-wrap gap-1.5">
                                {(p.warehouseStock && p.warehouseStock.length > 0
                                  ? p.warehouseStock
                                  : [
                                      { warehouseName: 'المركزي', quantity: Math.floor(totalStock * 0.4) },
                                      { warehouseName: 'الكورنيش', quantity: Math.floor(totalStock * 0.25) },
                                      { warehouseName: 'الرخاوي', quantity: Math.floor(totalStock * 0.2) },
                                      { warehouseName: 'ميني زيكو', quantity: Math.floor(totalStock * 0.15) },
                                    ]
                                ).map((ws: any, idx: number) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-300"
                                  >
                                    {ws.warehouseName.replace('فرع ', '')}: <strong className="text-white font-mono">{ws.quantity}</strong>
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono font-black text-sm text-white">
                              {totalStock} قطعة
                            </td>
                            <td className="py-3 px-4">
                              {isLow ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                  نواقص (أقل من 5)
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  متوفر بالرصيد
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => {
                                  setTransferForm((prev) => ({
                                    ...prev,
                                    productId: p._id,
                                  }));
                                  setTransferModalOpen(true);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition cursor-pointer"
                              >
                                تحويل
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Audit Movement History Table */}
            <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
              <h3 className="font-black text-sm text-white flex items-center gap-2">
                <History className="w-4 h-4 text-zinc-400" />
                <span>سجل حركة المخازن والتحويلات المعتمدة (Audit Log)</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400">
                      <th className="py-2.5 px-3">نوع الحركة</th>
                      <th className="py-2.5 px-3">المنتج</th>
                      <th className="py-2.5 px-3">الكمية</th>
                      <th className="py-2.5 px-3">المخزن المنقول منه</th>
                      <th className="py-2.5 px-3">المخزن المستلم</th>
                      <th className="py-2.5 px-3">السبب / الملاحظات</th>
                      <th className="py-2.5 px-3">المشرف المسؤول</th>
                      <th className="py-2.5 px-3">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {movements.map((m) => (
                      <tr key={m._id} className="hover:bg-zinc-800/30">
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              m.type === 'transfer'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : m.type === 'in'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {m.type === 'transfer' ? 'تحويل بين مخازن' : m.type === 'in' ? 'إذن إضافة' : 'تسوية'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-white">{m.productTitle}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-zinc-200">{m.quantity}</td>
                        <td className="py-2.5 px-3 text-zinc-400">{m.fromWarehouseName || m.warehouseName || '-'}</td>
                        <td className="py-2.5 px-3 text-zinc-400">{m.toWarehouseName || '-'}</td>
                        <td className="py-2.5 px-3 text-zinc-400">{m.reason || '-'}</td>
                        <td className="py-2.5 px-3 text-zinc-300 font-bold">{m.performedByName}</td>
                        <td className="py-2.5 px-3 text-zinc-500 font-mono">
                          {new Date(m.createdAt).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================
            TAB 4: PRODUCTS (إدارة المنتجات)
        ======================================================== */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white">إدارة المنتجات والأسعار</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  إجمالي {products.length} موديل من أقوى براندات الملابس والأحذية (Nike, Adidas, Zara, Essentials)
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="ابحث باسم الموديل أو الكود..."
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 min-w-[200px]"
                />

                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2 focus:outline-none"
                >
                  <option value="all">كل الفئات</option>
                  <option value="hoodies">هوديز وتريكات</option>
                  <option value="jackets">جواكت وسويت شيرت</option>
                  <option value="oversize">تيشيرتات أوفر سايز</option>
                  <option value="pants">بناطيل وجينز وكارجو</option>
                  <option value="sneakers">أحذية وسنيكرز</option>
                  <option value="crossbags">شنط كروس</option>
                  <option value="caps">كابات وإكسسوارات</option>
                  <option value="underwear">ملابس داخلية وجوارب</option>
                </select>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-zinc-950/60 border-b border-zinc-800 text-zinc-400 font-bold">
                      <th className="py-3 px-4">الصورة</th>
                      <th className="py-3 px-4">كود الموديل</th>
                      <th className="py-3 px-4">اسم المنتج</th>
                      <th className="py-3 px-4">الفئة</th>
                      <th className="py-3 px-4">مكان التخزين والرف</th>
                      <th className="py-3 px-4">السعر الحالي</th>
                      <th className="py-3 px-4">قبل الخصم</th>
                      <th className="py-3 px-4">إجمالي الرصيد</th>
                      <th className="py-3 px-4">حالة التوفر</th>
                      <th className="py-3 px-4 text-center">تعديل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {filteredProducts.map((p) => (
                      <tr key={p._id} className="hover:bg-zinc-800/40 transition">
                        <td className="py-2.5 px-4">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700">
                            <img
                              src={p.images?.[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=100'}
                              alt={p.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </td>
                        <td className="py-2.5 px-4 font-mono font-bold text-zinc-300">{p.code}</td>
                        <td className="py-2.5 px-4 font-bold text-white max-w-[240px] truncate">{p.title}</td>
                        <td className="py-2.5 px-4 text-zinc-400">{p.categoryAr || p.category}</td>
                        <td className="py-2.5 px-4">
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-zinc-200 text-xs flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span>{p.primaryLocation || 'المخزن المركزي'}</span>
                            </span>
                            <span className="font-mono text-[10px] text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded-md border border-zinc-800 w-fit">
                              {p.shelfLocation || 'الرف A-01'}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 font-black font-mono text-zinc-100">{p.price} ج.م</td>
                        <td className="py-2.5 px-4 font-mono text-zinc-500 line-through">
                          {p.oldPrice ? `${p.oldPrice} ج.م` : '-'}
                        </td>
                        <td className="py-2.5 px-4 font-mono font-bold text-zinc-200">
                          {p.totalStock ?? 30} قطعة
                        </td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.inStock
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {p.inStock ? 'متوفر للطلب' : 'نفد'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setProductForm({
                                price: p.price,
                                oldPrice: p.oldPrice || 0,
                                totalStock: p.totalStock ?? 30,
                                primaryLocation: p.primaryLocation || 'المخزن المركزي',
                                shelfLocation: p.shelfLocation || 'الرف A-01',
                                inStock: p.inStock,
                                featured: !!p.featured,
                                bestseller: !!p.bestseller,
                              });
                              setEditProductModalOpen(true);
                            }}
                            className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition cursor-pointer"
                            title="تعديل السعر والمخزون ومكان التخزين"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================
            TAB 5: ORDERS (إدارة الطلبات)
        ======================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white">إدارة طلبات المتجر</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  متابعة وتجهيز الأوردرات الصادرة من المتجر وحالات الشحن والتسليم
                </p>
              </div>

              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2 focus:outline-none"
              >
                <option value="all">كل الحالات</option>
                <option value="pending">قيد المراجعة</option>
                <option value="confirmed">مؤكد</option>
                <option value="processing_in_warehouse">قيد التجهيز بالمخزن</option>
                <option value="shipped">تم الشحن</option>
                <option value="delivered">تم التوصيل</option>
                <option value="cancelled">ملغي</option>
              </select>
            </div>

            {orders.length === 0 ? (
              <div className="py-16 text-center text-zinc-500 text-xs bg-zinc-900 rounded-3xl border border-zinc-800">
                لا توجد طلبات جديدة حالياً. الأوردرات الجديدة ستظهر فور إرسالها من العملاء.
              </div>
            ) : (
              <div className="space-y-4">
                {orders
                  .filter((o) => orderStatusFilter === 'all' || o.orderStatus === orderStatusFilter)
                  .map((order) => (
                    <div
                      key={order._id}
                      className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                            {order.orderNumber || order._id.slice(-6)}
                          </span>
                          <span className="font-black text-sm text-white">{order.customerName}</span>
                          <span className="text-xs text-zinc-400 font-mono">({order.customerPhone})</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Payment status badge */}
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              order.paymentStatus === 'paid'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {order.paymentStatus === 'paid' ? 'مدفوع' : 'دفع عند الاستلام'}
                          </span>

                          {/* Status Select */}
                          <select
                            value={order.orderStatus}
                            onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                            className="bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs rounded-xl px-2.5 py-1 focus:outline-none font-bold"
                          >
                            <option value="pending">قيد المراجعة</option>
                            <option value="confirmed">مؤكد</option>
                            <option value="processing_in_warehouse">قيد التجهيز بالمخزن</option>
                            <option value="shipped">تم الشحن والتسليم للمندوب</option>
                            <option value="delivered">تم التوصيل بنجاح</option>
                            <option value="cancelled">ملغي</option>
                          </select>
                        </div>
                      </div>

                      {/* Items details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1.5">
                          <span className="font-bold text-zinc-400 block">المنتجات المطلوبة:</span>
                          <div className="space-y-1">
                            {order.items?.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-zinc-950/60 p-2 rounded-xl border border-zinc-800/60">
                                <span className="font-bold text-zinc-200">
                                  {item.productTitle}{' '}
                                  {item.selectedSize && <span className="text-zinc-400 text-[11px]">({item.selectedSize})</span>}
                                </span>
                                <span className="font-mono text-zinc-300">
                                  {item.quantity} × {item.price} ج.م
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2 bg-zinc-950/40 p-3 rounded-2xl border border-zinc-800/60 flex flex-col justify-between">
                          <div className="space-y-1">
                            <div className="text-zinc-400">
                              العنوان:{' '}
                              <strong className="text-zinc-200">
                                {order.city} - {order.address}
                              </strong>
                            </div>
                            <div className="text-zinc-500 text-[11px] font-mono">
                              تاريخ الطلب: {new Date(order.createdAt).toLocaleString('ar-EG')}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-sm">
                            <span className="font-bold text-zinc-300">إجمالي الطلب:</span>
                            <span className="font-black font-mono text-white text-base">
                              {order.totalPrice} ج.م
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

          </div>
        )}

        {/* ========================================================
            TAB 6: USERS & ROLES (المستخدمين والصلاحيات)
        ======================================================== */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white">إدارة المستخدمين والصلاحيات</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  التحكم في أدوار المشرفين وتعيين كل مشرف على فرع أو مخزن مع تحديد الصلاحيات
                </p>
              </div>

              <button
                onClick={() => setCreateUserModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-black transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة مستخدم أو مشرف جديد</span>
              </button>
            </div>

            {/* Filter Bar */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative min-w-[240px] flex-1">
                  <Search className="w-4 h-4 text-zinc-500 absolute right-3 top-3" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                    placeholder="ابحث بالاسم، البريد أو الهاتف..."
                    className="w-full pr-9 pl-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2 focus:outline-none"
                >
                  <option value="all">كل الرتب</option>
                  <option value="admin">مدير عام (Admin)</option>
                  <option value="manager">مشرف مخزن / فرع (Manager)</option>
                  <option value="user">عميل / مستخدم (User)</option>
                </select>
              </div>

              <button
                onClick={fetchUsers}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition cursor-pointer"
                title="تحديث القائمة"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Users Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-zinc-950/60 border-b border-zinc-800 text-zinc-400 font-bold">
                      <th className="py-3 px-4">المستخدم</th>
                      <th className="py-3 px-4">البريد الإلكتروني</th>
                      <th className="py-3 px-4">الهاتف</th>
                      <th className="py-3 px-4">الرتبة</th>
                      <th className="py-3 px-4">الفرع المخصص</th>
                      <th className="py-3 px-4">الصلاحيات</th>
                      <th className="py-3 px-4">الحالة</th>
                      <th className="py-3 px-4 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-zinc-800/40 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-white text-xs">
                              {u.name?.slice(0, 1) || 'U'}
                            </div>
                            <span className="font-bold text-white">{u.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-zinc-300">{u.email}</td>
                        <td className="py-3 px-4 font-mono text-zinc-400">{u.phone || '-'}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              u.role === 'admin'
                                ? 'bg-zinc-100 text-zinc-950 font-black'
                                : u.role === 'manager'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {u.role === 'admin' ? 'مدير عام' : u.role === 'manager' ? 'مشرف مخزن' : 'عميل'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-zinc-300 font-mono">
                          {u.assignedWarehouse ? (
                            <span className="px-2 py-0.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[10px]">
                              {u.assignedWarehouse}
                            </span>
                          ) : (
                            <span className="text-zinc-500">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {u.role === 'admin' ? (
                              <span className="text-[10px] text-zinc-400 font-bold">صلاحيات كاملة (Super Admin)</span>
                            ) : u.permissions && u.permissions.length > 0 ? (
                              u.permissions.map((p, i) => (
                                <span key={i} className="text-[9px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">
                                  {p.replace('manage_', '')}
                                </span>
                              ))
                            ) : (
                              <span className="text-zinc-500 text-[10px]">بدون صلاحيات إضافية</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.isBlocked
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {u.isBlocked ? 'محظور' : 'نشط'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => {
                              setEditingUser(u);
                              setUserRoleForm({
                                role: u.role,
                                assignedWarehouse: u.assignedWarehouse || '',
                                permissions: u.permissions || [],
                                isBlocked: u.isBlocked,
                              });
                              setUserModalOpen(true);
                            }}
                            className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition cursor-pointer"
                            title="تعديل الصلاحيات والرتبة"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* ========================================================
          MODAL 1: ADD / EDIT WAREHOUSE
      ======================================================== */}
      {warehouseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-black text-sm text-white">
                {editingWarehouse ? 'تعديل بيانات الفرع / المخزن' : 'إضافة فرع أو مخزن جديد بالسويس'}
              </h3>
              <button
                onClick={() => setWarehouseModalOpen(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWarehouse} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">كود المخزن / الفرع</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingWarehouse}
                    value={warehouseForm.code}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, code: e.target.value })}
                    placeholder="WH-KORNISH"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">اسم الفرع / المخزن</label>
                  <input
                    type="text"
                    required
                    value={warehouseForm.name}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, name: e.target.value })}
                    placeholder="فرع الكورنيش القديم"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">العنوان التفصيلي</label>
                <input
                  type="text"
                  required
                  value={warehouseForm.location}
                  onChange={(e) => setWarehouseForm({ ...warehouseForm, location: e.target.value })}
                  placeholder="شارع الرخاوي الجديد، جنب محل فيونكة، السويس"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">اسم المشرف المسؤول</label>
                  <input
                    type="text"
                    value={warehouseForm.managerName}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, managerName: e.target.value })}
                    placeholder="كابتن زيكو"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">رقم هاتف المشرف</label>
                  <input
                    type="text"
                    value={warehouseForm.managerPhone}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, managerPhone: e.target.value })}
                    placeholder="01070091692"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">السعة الاستيعابية (قطع)</label>
                  <input
                    type="number"
                    value={warehouseForm.capacity}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-zinc-200">
                    <input
                      type="checkbox"
                      checked={warehouseForm.isActive}
                      onChange={(e) => setWarehouseForm({ ...warehouseForm, isActive: e.target.checked })}
                      className="rounded bg-zinc-800 border-zinc-700"
                    />
                    <span>الفرع نشط ويستقبل بضاعة</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setWarehouseModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-black cursor-pointer shadow-md"
                >
                  حفظ البيانات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: STOCK TRANSFER (تحويل بضاعة بين المخازن)
      ======================================================== */}
      {transferModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-black text-sm text-white flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-zinc-400" />
                <span>إذن تحويل بضاعة بين المخازن والفروع</span>
              </h3>
              <button onClick={() => setTransferModalOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStockTransfer} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-300 mb-1">اختر الموديل المراد تحويله</label>
                <select
                  required
                  value={transferForm.productId}
                  onChange={(e) => setTransferForm({ ...transferForm, productId: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-bold"
                >
                  <option value="">-- اضغط لاختيار الموديل --</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.code} - {p.title} (الرصيد الكلي: {p.totalStock ?? 30})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">من مخزن / فرع</label>
                  <select
                    value={transferForm.fromWarehouseCode}
                    onChange={(e) => setTransferForm({ ...transferForm, fromWarehouseCode: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white"
                  >
                    {warehouses.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.name} ({w.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-300 mb-1">إلى مخزن / فرع</label>
                  <select
                    value={transferForm.toWarehouseCode}
                    onChange={(e) => setTransferForm({ ...transferForm, toWarehouseCode: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white"
                  >
                    {warehouses.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.name} ({w.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">الكمية المراد نقلها (بالقطعة)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={transferForm.quantity}
                  onChange={(e) => setTransferForm({ ...transferForm, quantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">سبب التحويل</label>
                <input
                  type="text"
                  value={transferForm.reason}
                  onChange={(e) => setTransferForm({ ...transferForm, reason: e.target.value })}
                  placeholder="تغذية فرع السويس قبل الموسم"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white"
                />
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTransferModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={transferSubmitting || !transferForm.productId}
                  className="px-5 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-black cursor-pointer shadow-md disabled:opacity-50"
                >
                  {transferSubmitting ? 'جاري التحويل...' : 'تأكيد التحويل الآن'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: STOCK IN / OUT / ADJUSTMENT
      ======================================================== */}
      {adjustModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-black text-sm text-white">إذن استلام / صرف / تسوية رصيد مخزني</h3>
              <button onClick={() => setAdjustModalOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStockAdjust} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-300 mb-1">نوع الإذن</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustForm({ ...adjustForm, type: 'in' })}
                    className={`p-2 rounded-xl font-bold border transition cursor-pointer text-center ${
                      adjustForm.type === 'in'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    إضافة بضاعة (In)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustForm({ ...adjustForm, type: 'out' })}
                    className={`p-2 rounded-xl font-bold border transition cursor-pointer text-center ${
                      adjustForm.type === 'out'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    صرف بضاعة (Out)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustForm({ ...adjustForm, type: 'adjustment' })}
                    className={`p-2 rounded-xl font-bold border transition cursor-pointer text-center ${
                      adjustForm.type === 'adjustment'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    تسوية جرد
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">اختر الموديل</label>
                <select
                  required
                  value={adjustForm.productId}
                  onChange={(e) => setAdjustForm({ ...adjustForm, productId: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-bold"
                >
                  <option value="">-- اختر المنتج --</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.code} - {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">المخزن المستهدف</label>
                  <select
                    value={adjustForm.warehouseCode}
                    onChange={(e) => setAdjustForm({ ...adjustForm, warehouseCode: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white"
                  >
                    {warehouses.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.name} ({w.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-300 mb-1">الكمية (قطع)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={adjustForm.quantity}
                    onChange={(e) => setAdjustForm({ ...adjustForm, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">البيان / السبب</label>
                <input
                  type="text"
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                  placeholder="استلام شحنة جديدة أو تسوية عجز"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white"
                />
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={adjustSubmitting || !adjustForm.productId}
                  className="px-5 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-black cursor-pointer shadow-md disabled:opacity-50"
                >
                  {adjustSubmitting ? 'جاري الحفظ...' : 'تأكيد الإذن المخزني'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 4: EDIT USER ROLE & PERMISSIONS
      ======================================================== */}
      {userModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-black text-sm text-white">تعديل صلاحيات ورتبة المستخدم</h3>
                <span className="text-[11px] text-zinc-400 font-mono">{editingUser.email}</span>
              </div>
              <button onClick={() => setUserModalOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-300 mb-1">الرتبة في النظام</label>
                <select
                  value={userRoleForm.role}
                  onChange={(e: any) => setUserRoleForm({ ...userRoleForm, role: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-bold"
                >
                  <option value="user">عميل عادي (User)</option>
                  <option value="manager">مشرف مخزن / فرع (Manager)</option>
                  <option value="admin">مدير عام للنظام بالكامل (Admin)</option>
                </select>
              </div>

              {userRoleForm.role === 'manager' && (
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">الفرع أو المخزن المخصص للمشرف</label>
                  <select
                    value={userRoleForm.assignedWarehouse}
                    onChange={(e) => setUserRoleForm({ ...userRoleForm, assignedWarehouse: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white"
                  >
                    <option value="">-- بدون تخصيص فرع محدد --</option>
                    {warehouses.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.name} ({w.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-zinc-300 mb-2">الصلاحيات الممنوحة</label>
                <div className="space-y-2 p-3 bg-zinc-950 rounded-2xl border border-zinc-800">
                  {[
                    { id: 'manage_warehouses', label: 'إدارة المخازن والفروع (إضافة وتعديل)' },
                    { id: 'manage_inventory', label: 'إدارة المخزون، الجرد والتحويل بين الفروع' },
                    { id: 'manage_orders', label: 'إدارة وتحديث حالات طلبات العملاء' },
                    { id: 'manage_products', label: 'تعديل أسعار ورصيد المنتجات' },
                    { id: 'manage_users', label: 'إدارة المستخدمين والمشرفين' },
                  ].map((perm) => (
                    <label key={perm.id} className="flex items-center gap-2 cursor-pointer text-zinc-300">
                      <input
                        type="checkbox"
                        checked={userRoleForm.permissions.includes(perm.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setUserRoleForm({ ...userRoleForm, permissions: [...userRoleForm.permissions, perm.id] });
                          } else {
                            setUserRoleForm({
                              ...userRoleForm,
                              permissions: userRoleForm.permissions.filter((p) => p !== perm.id),
                            });
                          }
                        }}
                        className="rounded bg-zinc-800 border-zinc-700"
                      />
                      <span>{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-rose-400">
                  <input
                    type="checkbox"
                    checked={userRoleForm.isBlocked}
                    onChange={(e) => setUserRoleForm({ ...userRoleForm, isBlocked: e.target.checked })}
                    className="rounded bg-zinc-800 border-zinc-700"
                  />
                  <span>حظر المستخدم ومنعه من تسجيل الدخول</span>
                </label>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={userSubmitting}
                  className="px-5 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-black cursor-pointer shadow-md disabled:opacity-50"
                >
                  {userSubmitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 5: CREATE USER / MANAGER
      ======================================================== */}
      {createUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-black text-sm text-white">إضافة مستخدم أو مشرف فرع جديد</h3>
              <button onClick={() => setCreateUserModalOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">الاسم الأول</label>
                  <input
                    type="text"
                    required
                    value={newUserForm.firstName}
                    onChange={(e) => setNewUserForm({ ...newUserForm, firstName: e.target.value })}
                    placeholder="محمد"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">اسم العائلة</label>
                  <input
                    type="text"
                    required
                    value={newUserForm.lastName}
                    onChange={(e) => setNewUserForm({ ...newUserForm, lastName: e.target.value })}
                    placeholder="علي"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    required
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    placeholder="manager@zeko.com"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    value={newUserForm.phone}
                    onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                    placeholder="01070091692"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">كلمة المرور المؤقتة</label>
                <input
                  type="password"
                  required
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  placeholder="كلمة مرور قوية (مثال: Manager@123456)"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">الرتبة</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e: any) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-bold"
                  >
                    <option value="manager">مشرف مخزن / فرع</option>
                    <option value="admin">مدير عام (Admin)</option>
                    <option value="user">عميل (User)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-300 mb-1">تخصيص الفرع</label>
                  <select
                    value={newUserForm.assignedWarehouse}
                    onChange={(e) => setNewUserForm({ ...newUserForm, assignedWarehouse: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white"
                  >
                    {warehouses.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={createUserSubmitting}
                  className="px-5 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-black cursor-pointer shadow-md disabled:opacity-50"
                >
                  {createUserSubmitting ? 'جاري الإنشاء...' : 'إنشاء الحساب وتفعيله'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 6: QUICK EDIT PRODUCT PRICE / STOCK
      ======================================================== */}
      {editProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-black text-sm text-white">تعديل بيانات المنتج</h3>
                <span className="text-[11px] text-zinc-400 font-bold">{editingProduct.title}</span>
              </div>
              <button onClick={() => setEditProductModalOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">السعر الحالي (ج.م)</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">السعر قبل الخصم (اختياري)</label>
                  <input
                    type="number"
                    value={productForm.oldPrice}
                    onChange={(e) => setProductForm({ ...productForm, oldPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">إجمالي الرصيد المخزني (قطع)</label>
                <input
                  type="number"
                  required
                  value={productForm.totalStock}
                  onChange={(e) => setProductForm({ ...productForm, totalStock: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">المكان الرئيسي (الفرع / المخزن)</label>
                  <select
                    value={productForm.primaryLocation}
                    onChange={(e) => setProductForm({ ...productForm, primaryLocation: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-bold"
                  >
                    <option value="المخزن المركزي">المخزن المركزي الرئيسي</option>
                    <option value="فرع الكورنيش القديم">فرع الكورنيش القديم</option>
                    <option value="فرع شارع الرخاوي">فرع شارع الرخاوي</option>
                    <option value="فرع ميني زيكو">فرع ميني زيكو</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">رقم الرف / كود التخزين</label>
                  <input
                    type="text"
                    value={productForm.shelfLocation}
                    onChange={(e) => setProductForm({ ...productForm, shelfLocation: e.target.value })}
                    placeholder="الرف A-04"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-zinc-200">
                  <input
                    type="checkbox"
                    checked={productForm.inStock}
                    onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                    className="rounded bg-zinc-800 border-zinc-700"
                  />
                  <span>متوفر للطلب في المتجر</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                  <input
                    type="checkbox"
                    checked={productForm.bestseller}
                    onChange={(e) => setProductForm({ ...productForm, bestseller: e.target.checked })}
                    className="rounded bg-zinc-800 border-zinc-700"
                  />
                  <span>تمييز كـ الأكثر طلباً (Bestseller)</span>
                </label>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={productSubmitting}
                  className="px-5 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-black cursor-pointer shadow-md disabled:opacity-50"
                >
                  {productSubmitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

function ZapIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
