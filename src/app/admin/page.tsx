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
  Tag,
  Receipt,
  Wallet,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Banknote,
  Factory,
  Briefcase,
  UserPlus
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

// 1. Employee Interface
interface IEmployeeItem {
  _id: string;
  name: string;
  phone: string;
  nationalId?: string;
  role: string;
  branch: string;
  salary: number;
  incentives: number;
  deductions: number;
  netSalary: number;
  paymentStatus: 'paid' | 'pending';
  lastPaidDate?: string;
  notes?: string;
  isActive: boolean;
}

// 2. Expense Interface
interface IExpenseItem {
  _id: string;
  title: string;
  category: string;
  categoryAr: string;
  amount: number;
  branch: string;
  date: string;
  paidBy?: string;
  receiptNumber?: string;
  notes?: string;
}

// 3. Supplier Interface
interface ISupplierItem {
  _id: string;
  name: string;
  company: string;
  phone: string;
  city?: string;
  category: string;
  totalInvoiced: number;
  totalPaid: number;
  debtAmount: number;
  status: 'paid' | 'partial' | 'due';
  notes?: string;
}

// 4. Finance Summary Interface
interface IFinanceSummary {
  totalSalesRevenue: number;
  totalExpenses: number;
  totalMonthlyPayroll: number;
  totalOutgoing: number;
  totalSupplierDebts: number;
  totalSupplierInvoiced: number;
  totalSupplierPaid: number;
  netProfit: number;
  profitMargin: number;
}

export default function AdminPage() {
  const router = useRouter();

  // Authentication & Current User
  const [currentUser, setCurrentUser] = useState<IAdminUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'finance' | 'employees' | 'suppliers' | 'warehouses' | 'inventory' | 'products' | 'orders' | 'users'
  >('overview');

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

  // Finance States
  const [financeSummary, setFinanceSummary] = useState<IFinanceSummary | null>(null);
  const [financeLoading, setFinanceLoading] = useState(false);

  // Employees States
  const [employees, setEmployees] = useState<IEmployeeItem[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeePayrollStats, setEmployeePayrollStats] = useState({
    totalEmployees: 0,
    totalPayroll: 0,
    paidPayroll: 0,
    pendingPayroll: 0,
  });

  // Expenses States
  const [expenses, setExpenses] = useState<IExpenseItem[]>([]);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [expenseStats, setExpenseStats] = useState({
    totalAmount: 0,
    categoryTotals: {} as Record<string, number>,
  });
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState('all');

  // Suppliers States
  const [suppliers, setSuppliers] = useState<ISupplierItem[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [supplierStats, setSupplierStats] = useState({
    totalInvoiced: 0,
    totalPaid: 0,
    totalDebt: 0,
  });
  const [supplierSearch, setSupplierSearch] = useState('');

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
  // 1. Warehouse Modal
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

  // 3. Stock Adjustment Modal
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjustForm, setAdjustForm] = useState({
    productId: '',
    warehouseCode: 'WH-MAIN-CENTRAL',
    type: 'in' as 'in' | 'out' | 'adjustment',
    quantity: 10,
    reason: 'توريد بضاعة جديدة من المصنع',
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

  // 7. Employee Modal (Add / Edit)
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<IEmployeeItem | null>(null);
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    phone: '',
    role: 'بائع بالفرع',
    branch: 'فرع الكورنيش القديم (الرئيسي)',
    salary: 4500,
    incentives: 0,
    deductions: 0,
    paymentStatus: 'pending' as 'paid' | 'pending',
    notes: '',
  });
  const [employeeSubmitting, setEmployeeSubmitting] = useState(false);

  // 8. Expense Modal (Add Expense)
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    category: 'rent',
    amount: 1000,
    branch: 'فرع الكورنيش القديم (الرئيسي)',
    paidBy: 'إدارة زيكو ستور',
    receiptNumber: '',
    notes: '',
  });
  const [expenseSubmitting, setExpenseSubmitting] = useState(false);

  // 9. Supplier Modal (Add / Edit)
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<ISupplierItem | null>(null);
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    company: '',
    phone: '',
    city: 'القاهرة',
    category: 'هوديز وملابس قطن 100%',
    totalInvoiced: 50000,
    totalPaid: 35000,
    notes: '',
  });
  const [supplierSubmitting, setSupplierSubmitting] = useState(false);

  // 10. Record Payment to Supplier Modal
  const [paySupplierModalOpen, setPaySupplierModalOpen] = useState(false);
  const [supplierToPay, setSupplierToPay] = useState<ISupplierItem | null>(null);
  const [paymentAmountInput, setPaymentAmountInput] = useState<number>(5000);
  const [paySubmitting, setPaySubmitting] = useState(false);

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
    fetchEmployees();
    fetchExpenses();
    fetchSuppliers();
    fetchFinanceSummary();
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

  // 7. Fetch Employees
  const fetchEmployees = async () => {
    try {
      setEmployeesLoading(true);
      const res = await fetch('/api/admin/finance/employees');
      const data = await res.json();
      if (data.success) {
        setEmployees(data.employees || []);
        if (data.stats) setEmployeePayrollStats(data.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEmployeesLoading(false);
    }
  };

  // 8. Fetch Expenses
  const fetchExpenses = async () => {
    try {
      setExpensesLoading(true);
      const res = await fetch(`/api/admin/finance/expenses?category=${expenseCategoryFilter}`);
      const data = await res.json();
      if (data.success) {
        setExpenses(data.expenses || []);
        if (data.stats) setExpenseStats(data.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setExpensesLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchExpenses();
    }
  }, [expenseCategoryFilter]);

  // 9. Fetch Suppliers
  const fetchSuppliers = async () => {
    try {
      setSuppliersLoading(true);
      const res = await fetch(`/api/admin/finance/suppliers?search=${encodeURIComponent(supplierSearch)}`);
      const data = await res.json();
      if (data.success) {
        setSuppliers(data.suppliers || []);
        if (data.stats) setSupplierStats(data.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSuppliersLoading(false);
    }
  };

  // 10. Fetch Finance Summary
  const fetchFinanceSummary = async () => {
    try {
      setFinanceLoading(true);
      const res = await fetch('/api/admin/finance/summary');
      const data = await res.json();
      if (data.success && data.summary) {
        setFinanceSummary(data.summary);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFinanceLoading(false);
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

  // Update Product Price / Stock / Location
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
        showToast('تم تحديث بيانات المنتج ومكان التخزين بنجاح');
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
        fetchFinanceSummary();
      } else {
        showToast(data.message || 'فشل تحديث حالة الطلب', 'error');
      }
    } catch (e) {
      showToast('خطأ في الاتصال بالخادم', 'error');
    }
  };

  // Add / Edit Employee
  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmployeeSubmitting(true);
    try {
      const method = editingEmployee ? 'PATCH' : 'POST';
      const body = editingEmployee ? { id: editingEmployee._id, ...employeeForm } : employeeForm;

      const res = await fetch('/api/admin/finance/employees', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        showToast(editingEmployee ? 'تم تحديث بيانات وراتب الموظف بنجاح' : 'تم إضافة الموظف الجديد بنجاح');
        setEmployeeModalOpen(false);
        setEditingEmployee(null);
        fetchEmployees();
        fetchFinanceSummary();
      } else {
        showToast(data.message || 'فشل حفظ الموظف', 'error');
      }
    } catch (err: any) {
      showToast('خطأ في الاتصال بالخادم', 'error');
    } finally {
      setEmployeeSubmitting(false);
    }
  };

  // Toggle Employee Salary Paid / Pending
  const handleToggleEmployeePaid = async (emp: IEmployeeItem) => {
    const nextStatus = emp.paymentStatus === 'paid' ? 'pending' : 'paid';
    try {
      const res = await fetch('/api/admin/finance/employees', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: emp._id, paymentStatus: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(nextStatus === 'paid' ? `تم تسجيل صرف راتب ${emp.name}` : `تم تحويل راتب ${emp.name} إلى معلق`);
        fetchEmployees();
        fetchFinanceSummary();
      }
    } catch (e) {
      showToast('خطأ في تحديث حالة الراتب', 'error');
    }
  };

  // Delete Employee
  const handleDeleteEmployee = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف الموظف ${name}؟`)) return;
    try {
      const res = await fetch(`/api/admin/finance/employees?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('تم حذف الموظف بنجاح');
        fetchEmployees();
        fetchFinanceSummary();
      }
    } catch (e) {
      showToast('خطأ في الاتصال بالخادم', 'error');
    }
  };

  // Save Expense
  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setExpenseSubmitting(true);
    try {
      const res = await fetch('/api/admin/finance/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseForm),
      });
      const data = await res.json();
      if (data.success) {
        showToast('تم تسجيل بند المصروف بنجاح!');
        setExpenseModalOpen(false);
        setExpenseForm({
          title: '',
          category: 'rent',
          amount: 1000,
          branch: 'فرع الكورنيش القديم (الرئيسي)',
          paidBy: 'إدارة زيكو ستور',
          receiptNumber: '',
          notes: '',
        });
        fetchExpenses();
        fetchFinanceSummary();
      } else {
        showToast(data.message || 'فشل تسجيل المصروف', 'error');
      }
    } catch (err: any) {
      showToast('خطأ في تسجيل المصروف', 'error');
    } finally {
      setExpenseSubmitting(false);
    }
  };

  // Delete Expense
  const handleDeleteExpense = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المصروف؟')) return;
    try {
      const res = await fetch(`/api/admin/finance/expenses?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('تم حذف بند المصروف');
        fetchExpenses();
        fetchFinanceSummary();
      }
    } catch (e) {
      showToast('خطأ في الحذف', 'error');
    }
  };

  // Save Supplier
  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupplierSubmitting(true);
    try {
      const res = await fetch('/api/admin/finance/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplierForm),
      });
      const data = await res.json();
      if (data.success) {
        showToast('تم إضافة المورد وحساب المديونية بنجاح!');
        setSupplierModalOpen(false);
        setSupplierForm({
          name: '',
          company: '',
          phone: '',
          city: 'القاهرة',
          category: 'هوديز وملابس قطن 100%',
          totalInvoiced: 50000,
          totalPaid: 35000,
          notes: '',
        });
        fetchSuppliers();
        fetchFinanceSummary();
      } else {
        showToast(data.message || 'فشل إضافة المورد', 'error');
      }
    } catch (err: any) {
      showToast('خطأ في إضافة المورد', 'error');
    } finally {
      setSupplierSubmitting(false);
    }
  };

  // Record Payment to Supplier
  const handleRecordSupplierPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierToPay) return;
    setPaySubmitting(true);
    try {
      const res = await fetch('/api/admin/finance/suppliers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: supplierToPay._id,
          paymentAmount: paymentAmountInput,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`تم تسجيل دفعة بقيمة ${paymentAmountInput} ج.م للمورد ${supplierToPay.name}`);
        setPaySupplierModalOpen(false);
        setSupplierToPay(null);
        fetchSuppliers();
        fetchFinanceSummary();
      } else {
        showToast(data.message || 'فشل تسجيل الدفعة', 'error');
      }
    } catch (err: any) {
      showToast('خطأ أثناء تسجيل الدفعة', 'error');
    } finally {
      setPaySubmitting(false);
    }
  };

  // Delete Supplier
  const handleDeleteSupplier = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف المورد ${name}؟`)) return;
    try {
      const res = await fetch(`/api/admin/finance/suppliers?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('تم حذف المورد بنجاح');
        fetchSuppliers();
        fetchFinanceSummary();
      }
    } catch (e) {
      showToast('خطأ في حذف المورد', 'error');
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
                      ADMIN ERP
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 font-medium hidden sm:block">
                    إدارة الفروع، المخازن، الرواتب، المصروفات والمديونيات
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
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition cursor-pointer shrink-0 ${
                activeTab === 'overview'
                  ? 'bg-zinc-100 text-zinc-950 shadow-md font-black'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>نظرة عامة</span>
            </button>

            {/* NEW: Financial P&L & Expenses */}
            <button
              onClick={() => setActiveTab('finance')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition cursor-pointer shrink-0 ${
                activeTab === 'finance'
                  ? 'bg-emerald-500 text-white shadow-md font-black'
                  : 'text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>الأرباح والمصروفات</span>
            </button>

            {/* NEW: Staff & Salaries */}
            <button
              onClick={() => setActiveTab('employees')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition cursor-pointer shrink-0 ${
                activeTab === 'employees'
                  ? 'bg-zinc-100 text-zinc-950 shadow-md font-black'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>العاملين والرواتب ({employees.length})</span>
            </button>

            {/* NEW: Suppliers & Debts */}
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition cursor-pointer shrink-0 ${
                activeTab === 'suppliers'
                  ? 'bg-zinc-100 text-zinc-950 shadow-md font-black'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <Factory className="w-4 h-4" />
              <span>الموردين والمديونيات ({suppliers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('warehouses')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition cursor-pointer shrink-0 ${
                activeTab === 'warehouses'
                  ? 'bg-zinc-100 text-zinc-950 shadow-md font-black'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <Warehouse className="w-4 h-4" />
              <span>الفروع والمخازن ({warehouses.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition cursor-pointer shrink-0 ${
                activeTab === 'inventory'
                  ? 'bg-zinc-100 text-zinc-950 shadow-md font-black'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>الجرد والتحويل</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition cursor-pointer shrink-0 ${
                activeTab === 'products'
                  ? 'bg-zinc-100 text-zinc-950 shadow-md font-black'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>المنتجات ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition cursor-pointer shrink-0 ${
                activeTab === 'orders'
                  ? 'bg-zinc-100 text-zinc-950 shadow-md font-black'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>الطلبات ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition cursor-pointer shrink-0 ${
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
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-zinc-400 font-bold block">صافي الأرباح التقديرية</span>
                  <span className="text-xl font-black text-emerald-400">
                    {financeSummary ? `${financeSummary.netProfit.toLocaleString()} ج.م` : '63,350 ج.م'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm space-y-2">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-zinc-400 font-bold block">إجمالي المصروفات الشهرية</span>
                  <span className="text-xl font-black text-rose-400">
                    {expenseStats.totalAmount ? `${expenseStats.totalAmount.toLocaleString()} ج.م` : '53,050 ج.م'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm space-y-2">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-zinc-400 font-bold block">إجمالي رواتب العاملين</span>
                  <span className="text-xl font-black text-blue-400">
                    {employeePayrollStats.totalPayroll ? `${employeePayrollStats.totalPayroll.toLocaleString()} ج.م` : '27,100 ج.م'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm space-y-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-zinc-400 font-bold block">مديونيات الموردين المعلقة</span>
                  <span className="text-xl font-black text-amber-400">
                    {supplierStats.totalDebt ? `${supplierStats.totalDebt.toLocaleString()} ج.م` : '85,000 ج.م'}
                  </span>
                </div>
              </div>

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
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-zinc-400 font-bold block">المنتجات في الكتالوج</span>
                  <span className="text-xl font-black text-white">{products.length || 105}</span>
                </div>
              </div>

            </div>

            {/* Quick Financial Shortcuts */}
            <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
              <h3 className="font-black text-sm text-white flex items-center gap-2">
                <Banknote className="w-4 h-4 text-emerald-400" />
                <span>إجراءات مالية وتشغيلية سريعة</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                
                <button
                  onClick={() => setExpenseModalOpen(true)}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 text-right transition cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">تسجيل مصروف جديد</h4>
                    <p className="text-[10px] text-zinc-400">إيجار، كهرباء، غاز، مياه، شحن</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setEditingEmployee(null);
                    setEmployeeForm({
                      name: '',
                      phone: '',
                      role: 'بائع بالفرع',
                      branch: 'فرع الكورنيش القديم (الرئيسي)',
                      salary: 4500,
                      incentives: 0,
                      deductions: 0,
                      paymentStatus: 'pending',
                      notes: '',
                    });
                    setEmployeeModalOpen(true);
                  }}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 text-right transition cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">إضافة موظف / تحديد راتب</h4>
                    <p className="text-[10px] text-zinc-400">تسجيل راتب بائع أو أمين مخزن</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setSupplierForm({
                      name: '',
                      company: '',
                      phone: '',
                      city: 'القاهرة',
                      category: 'هوديز وملابس قطن 100%',
                      totalInvoiced: 50000,
                      totalPaid: 35000,
                      notes: '',
                    });
                    setSupplierModalOpen(true);
                  }}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 text-right transition cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                    <Factory className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">إضافة مورد / مديونية</h4>
                    <p className="text-[10px] text-zinc-400">تسجيل فواتير المصانع والتوريدات</p>
                  </div>
                </button>

                <button
                  onClick={() => setTransferModalOpen(true)}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 text-right transition cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-zinc-700 flex items-center justify-center text-white shrink-0">
                    <ArrowLeftRight className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">تحويل بضاعة بين الفروع</h4>
                    <p className="text-[10px] text-zinc-400">نقل كميات من المركزي لنقاط البيع</p>
                  </div>
                </button>

              </div>
            </div>

            {/* Financial Balance Summary Card */}
            <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm text-white flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  <span>الموقف المالي الشامل لمتجر زيكو ستور (P&L Summary)</span>
                </h3>
                <button
                  onClick={() => setActiveTab('finance')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
                >
                  <span>عرض التفاصيل الكاملة والمصروفات</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1">
                  <span className="text-zinc-400 text-xs font-bold block">إجمالي إيرادات المبيعات:</span>
                  <span className="text-xl font-black font-mono text-white">
                    {financeSummary ? `${financeSummary.totalSalesRevenue.toLocaleString()} ج.م` : '142,500 ج.م'}
                  </span>
                  <span className="text-[10px] text-zinc-500 block">من مبيعات الفروع وأوردرات المتجر</span>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1">
                  <span className="text-zinc-400 text-xs font-bold block">إجمالي المصروفات والرواتب:</span>
                  <span className="text-xl font-black font-mono text-rose-400">
                    {financeSummary ? `${financeSummary.totalOutgoing.toLocaleString()} ج.م` : '80,150 ج.م'}
                  </span>
                  <span className="text-[10px] text-zinc-500 block">تشمل فواتير وإيجارات ورواتب العاملين</span>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1">
                  <span className="text-zinc-400 text-xs font-bold block">صافي الأرباح الصافية:</span>
                  <span className="text-xl font-black font-mono text-emerald-400">
                    {financeSummary ? `${financeSummary.netProfit.toLocaleString()} ج.م` : '62,350 ج.م'}
                  </span>
                  <span className="text-[10px] text-emerald-500/80 font-bold block">
                    هامش ربح تقديري ~{financeSummary?.profitMargin || 44}%
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1">
                  <span className="text-zinc-400 text-xs font-bold block">إجمالي مديونيات الموردين:</span>
                  <span className="text-xl font-black font-mono text-amber-400">
                    {supplierStats.totalDebt ? `${supplierStats.totalDebt.toLocaleString()} ج.م` : '85,000 ج.م'}
                  </span>
                  <span className="text-[10px] text-zinc-500 block">مستحقات للمصانع والتوكيلات</span>
                </div>
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

          </div>
        )}

        {/* ========================================================
            TAB 2: FINANCE & EXPENSES (الأرباح والمصروفات)
        ======================================================== */}
        {activeTab === 'finance' && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white">الميزانية والمصروفات وصافي الأرباح</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  حساب شامل للإيرادات، إيجارات الفروع، فواتير الكهرباء والمياه والغاز، والرواتب
                </p>
              </div>

              <button
                onClick={() => setExpenseModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-black transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>تسجيل مصروف جديد</span>
              </button>
            </div>

            {/* P&L Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400">إجمالي المبيعات</span>
                  <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <TrendingUp className="w-4 h-4" />
                  </span>
                </div>
                <div className="text-2xl font-black font-mono text-white">
                  {financeSummary ? `${financeSummary.totalSalesRevenue.toLocaleString()} ج.م` : '142,500 ج.م'}
                </div>
                <p className="text-[11px] text-zinc-500">إجمالي قيمة الأوردرات والمبيعات</p>
              </div>

              <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400">المصروفات التشغيلية</span>
                  <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                    <Receipt className="w-4 h-4" />
                  </span>
                </div>
                <div className="text-2xl font-black font-mono text-rose-400">
                  {expenseStats.totalAmount ? `${expenseStats.totalAmount.toLocaleString()} ج.م` : '53,050 ج.م'}
                </div>
                <p className="text-[11px] text-zinc-500">إيجارات، فواتير، وصيانة</p>
              </div>

              <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400">رواتب العاملين</span>
                  <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                    <Briefcase className="w-4 h-4" />
                  </span>
                </div>
                <div className="text-2xl font-black font-mono text-blue-400">
                  {employeePayrollStats.totalPayroll ? `${employeePayrollStats.totalPayroll.toLocaleString()} ج.م` : '27,100 ج.م'}
                </div>
                <p className="text-[11px] text-zinc-500">رواتب شهريّة لـ {employees.length} موظف</p>
              </div>

              <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400">صافي الأرباح</span>
                  <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <Wallet className="w-4 h-4" />
                  </span>
                </div>
                <div className="text-2xl font-black font-mono text-emerald-400">
                  {financeSummary ? `${financeSummary.netProfit.toLocaleString()} ج.م` : '62,350 ج.م'}
                </div>
                <p className="text-[11px] text-emerald-400/80 font-bold">
                  هامش الربح: {financeSummary?.profitMargin || 44}%
                </p>
              </div>

            </div>

            {/* Filter by Category */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-zinc-400 ml-1">تصنيف المصروفات:</span>
                {[
                  { id: 'all', label: 'الكل' },
                  { id: 'rent', label: 'إيجارات الفروع' },
                  { id: 'electricity', label: 'فواتير كهرباء' },
                  { id: 'water', label: 'فواتير مياه' },
                  { id: 'gas', label: 'غاز' },
                  { id: 'hospitality', label: 'بوفيه ونظافة' },
                  { id: 'shipping', label: 'شحن ونقل بضائع' },
                  { id: 'other', label: 'أخرى' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setExpenseCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                      expenseCategoryFilter === cat.id
                        ? 'bg-zinc-100 text-zinc-950 font-black'
                        : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <button
                onClick={fetchExpenses}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition cursor-pointer"
                title="تحديث البيانات"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Expenses Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-zinc-950/60 border-b border-zinc-800 text-zinc-400 font-bold">
                      <th className="py-3 px-4">بيان المصروف</th>
                      <th className="py-3 px-4">التصنيف</th>
                      <th className="py-3 px-4">الفرع / المقر</th>
                      <th className="py-3 px-4">المبلغ</th>
                      <th className="py-3 px-4">رقم الإيصال / السند</th>
                      <th className="py-3 px-4">القائم بالصرف</th>
                      <th className="py-3 px-4">التاريخ</th>
                      <th className="py-3 px-4 text-center">حذف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {expenses.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-zinc-500">
                          لا توجد مصروفات مسجلة في هذا التصنيف.
                        </td>
                      </tr>
                    ) : (
                      expenses.map((exp) => (
                        <tr key={exp._id} className="hover:bg-zinc-800/40 transition">
                          <td className="py-3 px-4 font-bold text-white max-w-[240px] truncate">{exp.title}</td>
                          <td className="py-3 px-4">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                              {exp.categoryAr}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-zinc-300">{exp.branch}</td>
                          <td className="py-3 px-4 font-mono font-black text-sm text-rose-400">
                            {exp.amount.toLocaleString()} ج.م
                          </td>
                          <td className="py-3 px-4 font-mono text-zinc-400">{exp.receiptNumber || '-'}</td>
                          <td className="py-3 px-4 text-zinc-400">{exp.paidBy || 'إدارة زيكو'}</td>
                          <td className="py-3 px-4 font-mono text-zinc-500">
                            {new Date(exp.date).toLocaleDateString('ar-EG')}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleDeleteExpense(exp._id)}
                              className="p-1.5 rounded-xl bg-zinc-800 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400 transition cursor-pointer"
                              title="حذف المصروف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================
            TAB 3: EMPLOYEES & SALARIES (العاملين والرواتب)
        ======================================================== */}
        {activeTab === 'employees' && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white">قائمة العاملين ومسير الرواتب</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  رواتب البائعين، مسؤولي الفروع، الكاشير، وأمناء المخازن بالسويس مع تفاصيل الحوافز والخصومات
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingEmployee(null);
                  setEmployeeForm({
                    name: '',
                    phone: '',
                    role: 'بائع بالفرع',
                    branch: 'فرع الكورنيش القديم (الرئيسي)',
                    salary: 4500,
                    incentives: 0,
                    deductions: 0,
                    paymentStatus: 'pending',
                    notes: '',
                  });
                  setEmployeeModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-black transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة موظف جديد</span>
              </button>
            </div>

            {/* Payroll Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-2">
                <span className="text-xs font-bold text-zinc-400 block">إجمالي عدد العاملين</span>
                <span className="text-2xl font-black text-white">{employees.length} موظف</span>
                <span className="text-[11px] text-zinc-500 block">موزعين على فروع السويس والمخزن</span>
              </div>

              <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-2">
                <span className="text-xs font-bold text-zinc-400 block">إجمالي مسير الرواتب الشهري</span>
                <span className="text-2xl font-black font-mono text-white">
                  {employeePayrollStats.totalPayroll.toLocaleString()} ج.م
                </span>
                <span className="text-[11px] text-zinc-500 block">صافي الرواتب المستحقة</span>
              </div>

              <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-2">
                <span className="text-xs font-bold text-zinc-400 block">الرواتب المسددة للشهر</span>
                <span className="text-2xl font-black font-mono text-emerald-400">
                  {employeePayrollStats.paidPayroll.toLocaleString()} ج.م
                </span>
                <span className="text-[11px] text-emerald-500/80 block">تم الصرف بنجاح</span>
              </div>

              <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-2">
                <span className="text-xs font-bold text-zinc-400 block">الرواتب المعلقة للصرف</span>
                <span className="text-2xl font-black font-mono text-amber-400">
                  {employeePayrollStats.pendingPayroll.toLocaleString()} ج.م
                </span>
                <span className="text-[11px] text-amber-500/80 block">مستحقة الصرف للعاملين</span>
              </div>
            </div>

            {/* Employees Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-zinc-950/60 border-b border-zinc-800 text-zinc-400 font-bold">
                      <th className="py-3 px-4">اسم الموظف</th>
                      <th className="py-3 px-4">الوظيفة / الدور</th>
                      <th className="py-3 px-4">الفرع المخصص</th>
                      <th className="py-3 px-4">الهاتف</th>
                      <th className="py-3 px-4">الراتب الأساسي</th>
                      <th className="py-3 px-4">حوافز</th>
                      <th className="py-3 px-4">خصومات</th>
                      <th className="py-3 px-4">الصافي المستحق</th>
                      <th className="py-3 px-4">حالة الصرف</th>
                      <th className="py-3 px-4 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {employees.map((emp) => (
                      <tr key={emp._id} className="hover:bg-zinc-800/40 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-white text-xs">
                              {emp.name.slice(0, 1)}
                            </div>
                            <div>
                              <span className="font-bold text-white block">{emp.name}</span>
                              <span className="text-[10px] text-zinc-500">{emp.notes || 'موظف منتظم'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-bold text-zinc-300">{emp.role}</td>
                        <td className="py-3 px-4 text-zinc-400">{emp.branch}</td>
                        <td className="py-3 px-4 font-mono text-zinc-300">{emp.phone}</td>
                        <td className="py-3 px-4 font-mono font-bold text-zinc-200">{emp.salary} ج.م</td>
                        <td className="py-3 px-4 font-mono text-emerald-400">+{emp.incentives || 0}</td>
                        <td className="py-3 px-4 font-mono text-rose-400">-{emp.deductions || 0}</td>
                        <td className="py-3 px-4 font-mono font-black text-sm text-white">{emp.netSalary} ج.م</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleEmployeePaid(emp)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold cursor-pointer transition ${
                              emp.paymentStatus === 'paid'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30'
                            }`}
                            title="اضغط لتغيير حالة الصرف"
                          >
                            {emp.paymentStatus === 'paid' ? 'تم الصرف ✅' : 'معلق للصرف ⏳'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setEditingEmployee(emp);
                                setEmployeeForm({
                                  name: emp.name,
                                  phone: emp.phone,
                                  role: emp.role,
                                  branch: emp.branch,
                                  salary: emp.salary,
                                  incentives: emp.incentives || 0,
                                  deductions: emp.deductions || 0,
                                  paymentStatus: emp.paymentStatus,
                                  notes: emp.notes || '',
                                });
                                setEmployeeModalOpen(true);
                              }}
                              className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition cursor-pointer"
                              title="تعديل الراتب والبيانات"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteEmployee(emp._id, emp.name)}
                              className="p-1.5 rounded-xl bg-zinc-800 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400 transition cursor-pointer"
                              title="حذف الموظف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
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
            TAB 4: SUPPLIERS & DEBTS (الموردين والمديونيات)
        ======================================================== */}
        {activeTab === 'suppliers' && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white">الموردين والمصانع والمديونيات</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  حسابات مصانع الملابس والسنيكرز والتوريدات وتتبع المسدد والمديونية المتبقية
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={supplierSearch}
                  onChange={(e) => setSupplierSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchSuppliers()}
                  placeholder="ابحث باسم المورد أو المصنع..."
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 min-w-[200px]"
                />

                <button
                  onClick={() => {
                    setEditingSupplier(null);
                    setSupplierForm({
                      name: '',
                      company: '',
                      phone: '',
                      city: 'القاهرة',
                      category: 'هوديز وملابس قطن 100%',
                      totalInvoiced: 50000,
                      totalPaid: 35000,
                      notes: '',
                    });
                    setSupplierModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-black transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة مورد جديد</span>
                </button>
              </div>
            </div>

            {/* Supplier Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-2">
                <span className="text-xs font-bold text-zinc-400 block">إجمالي قيمة التوريدات</span>
                <span className="text-2xl font-black font-mono text-white">
                  {supplierStats.totalInvoiced.toLocaleString()} ج.م
                </span>
                <span className="text-[11px] text-zinc-500 block">إجمالي فواتير بضاعة المصانع</span>
              </div>

              <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-2">
                <span className="text-xs font-bold text-zinc-400 block">إجمالي المبالغ المسددة</span>
                <span className="text-2xl font-black font-mono text-emerald-400">
                  {supplierStats.totalPaid.toLocaleString()} ج.م
                </span>
                <span className="text-[11px] text-emerald-500/80 block">دفعات تم تحويلها للموردين</span>
              </div>

              <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-2">
                <span className="text-xs font-bold text-zinc-400 block">إجمالي المديونيات المتبقية</span>
                <span className="text-2xl font-black font-mono text-amber-400">
                  {supplierStats.totalDebt.toLocaleString()} ج.م
                </span>
                <span className="text-[11px] text-amber-500/80 font-bold block">مطلوب سدادها للمصانع</span>
              </div>
            </div>

            {/* Suppliers Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-zinc-950/60 border-b border-zinc-800 text-zinc-400 font-bold">
                      <th className="py-3 px-4">اسم المورد والمصنع</th>
                      <th className="py-3 px-4">الهاتف والمدينة</th>
                      <th className="py-3 px-4">نوع البضاعة والتوريدات</th>
                      <th className="py-3 px-4">إجمالي الفواتير</th>
                      <th className="py-3 px-4">المسدد</th>
                      <th className="py-3 px-4">المتبقي (المديونية)</th>
                      <th className="py-3 px-4">الحالة</th>
                      <th className="py-3 px-4 text-center">تسديد دفعة</th>
                      <th className="py-3 px-4 text-center">حذف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {suppliers.map((sup) => (
                      <tr key={sup._id} className="hover:bg-zinc-800/40 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-white text-xs">
                              <Factory className="w-4 h-4 text-zinc-400" />
                            </div>
                            <div>
                              <span className="font-bold text-white block">{sup.name}</span>
                              <span className="text-[10px] text-zinc-400">{sup.company}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-mono text-zinc-300">{sup.phone}</div>
                          <div className="text-[10px] text-zinc-500">{sup.city || 'القاهرة'}</div>
                        </td>
                        <td className="py-3 px-4 text-zinc-300 max-w-[200px] truncate">{sup.category}</td>
                        <td className="py-3 px-4 font-mono font-bold text-zinc-200">
                          {sup.totalInvoiced.toLocaleString()} ج.م
                        </td>
                        <td className="py-3 px-4 font-mono text-emerald-400">
                          {sup.totalPaid.toLocaleString()} ج.م
                        </td>
                        <td className="py-3 px-4 font-mono font-black text-sm text-amber-400">
                          {sup.debtAmount.toLocaleString()} ج.م
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              sup.status === 'paid'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : sup.status === 'partial'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {sup.status === 'paid' ? 'مسدد بالكامل' : sup.status === 'partial' ? 'مسدد جزئياً' : 'مستحق السداد'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => {
                              setSupplierToPay(sup);
                              setPaymentAmountInput(Math.min(5000, sup.debtAmount || 1000));
                              setPaySupplierModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
                          >
                            تسديد دفعة
                          </button>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleDeleteSupplier(sup._id, sup.name)}
                            className="p-1.5 rounded-xl bg-zinc-800 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400 transition cursor-pointer"
                            title="حذف المورد"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
            TAB 5: WAREHOUSES (إدارة المخازن والفروع)
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
            TAB 6: INVENTORY & TRANSFERS (الجرد والتحويل المخزني)
        ======================================================== */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white">الجرد والتحويلات المخزنية</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  مراقبة أرصدة القطع وأماكن الرفوف وتوزيعها على الفروع والمخزن المركزي
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
                      <th className="py-3 px-4">مكان التخزين / الرف</th>
                      <th className="py-3 px-4">توزيع الكميات بالفروع (السويس)</th>
                      <th className="py-3 px-4">إجمالي الرصيد</th>
                      <th className="py-3 px-4">الحالة</th>
                      <th className="py-3 px-4 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {inventoryProducts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-zinc-500">
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
                              <span className="font-mono text-[10px] text-zinc-300 bg-zinc-950 px-2 py-0.5 rounded-lg border border-zinc-800">
                                {p.shelfLocation || 'الرف A-01'}
                              </span>
                            </td>
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

          </div>
        )}

        {/* ========================================================
            TAB 7: PRODUCTS (إدارة المنتجات)
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
                  <option value="clothing">ملابس وهوديز</option>
                  <option value="sneakers">أحذية وسنيكرز</option>
                  <option value="bags">شنط كروس</option>
                  <option value="caps">كابات وإكسسوارات</option>
                  <option value="socks">جوارب رياضية</option>
                  <option value="underwear">ملابس داخلية</option>
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
            TAB 8: ORDERS (إدارة الطلبات)
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
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              order.paymentStatus === 'paid'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {order.paymentStatus === 'paid' ? 'مدفوع' : 'دفع عند الاستلام'}
                          </span>

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
            TAB 9: USERS & ROLES (المستخدمين والصلاحيات)
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
              <button onClick={() => setWarehouseModalOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">
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
          MODAL 2: STOCK TRANSFER (تحويل بضاعة)
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
          MODAL 3: ADD / EDIT EMPLOYEE
      ======================================================== */}
      {employeeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-black text-sm text-white">
                {editingEmployee ? 'تعديل بيانات وراتب الموظف' : 'إضافة موظف جديد وتحديد الراتب'}
              </h3>
              <button onClick={() => setEmployeeModalOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">اسم الموظف بالكامل</label>
                  <input
                    type="text"
                    required
                    value={employeeForm.name}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                    placeholder="أحمد محمود"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    required
                    value={employeeForm.phone}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
                    placeholder="01012345678"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">الوظيفة / الدور</label>
                  <select
                    value={employeeForm.role}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, role: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-bold"
                  >
                    <option value="بائع بالفرع">بائع بالفرع</option>
                    <option value="كاشير ومسؤول خزينة">كاشير ومسؤول خزينة</option>
                    <option value="مسؤول مبيعات أول">مسؤول مبيعات أول</option>
                    <option value="أمين مخزن وجرد">أمين مخزن وجرد</option>
                    <option value="مندوب تسليم وتوصيل">مندوب تسليم وتوصيل بالسويس</option>
                    <option value="مدير فرع">مدير فرع</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">الفرع المخصص له</label>
                  <select
                    value={employeeForm.branch}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, branch: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white"
                  >
                    <option value="فرع الكورنيش القديم (الرئيسي)">فرع الكورنيش القديم</option>
                    <option value="فرع شارع الرخاوي">فرع شارع الرخاوي</option>
                    <option value="فرع ميني زيكو (MINI ZEKO)">فرع ميني زيكو</option>
                    <option value="المخزن المركزي الرئيسي">المخزن المركزي الرئيسي</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-zinc-950/60 p-3 rounded-2xl border border-zinc-800">
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">الراتب الأساسي (ج.م)</label>
                  <input
                    type="number"
                    required
                    value={employeeForm.salary}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, salary: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-emerald-400 mb-1">+ حوافز وبدلات</label>
                  <input
                    type="number"
                    value={employeeForm.incentives}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, incentives: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-rose-400 mb-1">- خصومات</label>
                  <input
                    type="number"
                    value={employeeForm.deductions}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, deductions: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                <span className="font-bold text-zinc-300">صافي الراتب المحسوب:</span>
                <span className="font-mono font-black text-base text-emerald-400">
                  {Number(employeeForm.salary) + Number(employeeForm.incentives) - Number(employeeForm.deductions)} ج.م
                </span>
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">حالة الصرف للشهر الحالي</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEmployeeForm({ ...employeeForm, paymentStatus: 'paid' })}
                    className={`p-2 rounded-xl font-bold border text-center transition cursor-pointer ${
                      employeeForm.paymentStatus === 'paid'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    تم صرف الراتب ✅
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmployeeForm({ ...employeeForm, paymentStatus: 'pending' })}
                    className={`p-2 rounded-xl font-bold border text-center transition cursor-pointer ${
                      employeeForm.paymentStatus === 'pending'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    معلق للصرف ⏳
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEmployeeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={employeeSubmitting}
                  className="px-5 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-black cursor-pointer shadow-md disabled:opacity-50"
                >
                  {employeeSubmitting ? 'جاري الحفظ...' : 'حفظ الموظف والراتب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 4: RECORD EXPENSE (تسجيل مصروف)
      ======================================================== */}
      {expenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-black text-sm text-white">تسجيل بند مصروفات تشغيلية جديد</h3>
              <button onClick={() => setExpenseModalOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-300 mb-1">بيان المصروف (العنوان)</label>
                <input
                  type="text"
                  required
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  placeholder="مثال: فاتورة كهرباء فرع الكورنيش، إيجار، مستلزمات بوفيه..."
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">نوع المصروف (التصنيف)</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-bold"
                  >
                    <option value="rent">إيجار مقر أو فرع</option>
                    <option value="electricity">فاتورة كهرباء</option>
                    <option value="water">فاتورة مياه</option>
                    <option value="gas">فاتورة غاز</option>
                    <option value="maintenance">صيانة وتجهيزات</option>
                    <option value="hospitality">بوفيه ونظافة وضيافة</option>
                    <option value="shipping">شحن ونقل بضائع</option>
                    <option value="marketing">إعلانات وتسويق</option>
                    <option value="other">مصروفات أخرى</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-300 mb-1">المبلغ المدفوع (ج.م)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">الفرع / المقر المستفيد</label>
                  <select
                    value={expenseForm.branch}
                    onChange={(e) => setExpenseForm({ ...expenseForm, branch: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white"
                  >
                    <option value="فرع الكورنيش القديم (الرئيسي)">فرع الكورنيش القديم</option>
                    <option value="فرع شارع الرخاوي">فرع شارع الرخاوي</option>
                    <option value="فرع ميني زيكو (MINI ZEKO)">فرع ميني زيكو</option>
                    <option value="المخزن المركزي الرئيسي">المخزن المركزي الرئيسي</option>
                    <option value="عام لكل الفروع">عام لكل الفروع</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-300 mb-1">رقم الإيصال / السند (اختياري)</label>
                  <input
                    type="text"
                    value={expenseForm.receiptNumber}
                    onChange={(e) => setExpenseForm({ ...expenseForm, receiptNumber: e.target.value })}
                    placeholder="REC-1010"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setExpenseModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={expenseSubmitting}
                  className="px-5 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-black cursor-pointer shadow-md disabled:opacity-50"
                >
                  {expenseSubmitting ? 'جاري الحفظ...' : 'تسجيل المصروف الآن'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 5: ADD / EDIT SUPPLIER
      ======================================================== */}
      {supplierModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-black text-sm text-white">إضافة مورد أو مصنع جديد</h3>
              <button onClick={() => setSupplierModalOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">اسم المسؤول / المورد</label>
                  <input
                    type="text"
                    required
                    value={supplierForm.name}
                    onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                    placeholder="الحاج مجدي النمر"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">اسم المصنع أو الشركة</label>
                  <input
                    type="text"
                    required
                    value={supplierForm.company}
                    onChange={(e) => setSupplierForm({ ...supplierForm, company: e.target.value })}
                    placeholder="مصنع النمر للملابس"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    required
                    value={supplierForm.phone}
                    onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    placeholder="01099887766"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">المدينة / المحافظة</label>
                  <input
                    type="text"
                    value={supplierForm.city}
                    onChange={(e) => setSupplierForm({ ...supplierForm, city: e.target.value })}
                    placeholder="المحلة، العاشر، العبور"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">نوع التوريدات والبضاعة</label>
                <input
                  type="text"
                  required
                  value={supplierForm.category}
                  onChange={(e) => setSupplierForm({ ...supplierForm, category: e.target.value })}
                  placeholder="هوديز، سنيكرز، أقطان، شنط وكابات..."
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 bg-zinc-950/60 p-3 rounded-2xl border border-zinc-800">
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">إجمالي الفواتير (ج.م)</label>
                  <input
                    type="number"
                    required
                    value={supplierForm.totalInvoiced}
                    onChange={(e) => setSupplierForm({ ...supplierForm, totalInvoiced: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-emerald-400 mb-1">المبلغ المسدد (ج.م)</label>
                  <input
                    type="number"
                    value={supplierForm.totalPaid}
                    onChange={(e) => setSupplierForm({ ...supplierForm, totalPaid: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                <span className="font-bold text-zinc-300">المديونية المتبقية للمورد:</span>
                <span className="font-mono font-black text-base text-amber-400">
                  {Math.max(0, Number(supplierForm.totalInvoiced) - Number(supplierForm.totalPaid)).toLocaleString()} ج.م
                </span>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSupplierModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={supplierSubmitting}
                  className="px-5 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-black cursor-pointer shadow-md disabled:opacity-50"
                >
                  {supplierSubmitting ? 'جاري الحفظ...' : 'حفظ المورد والمديونية'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 6: RECORD PAYMENT TO SUPPLIER
      ======================================================== */}
      {paySupplierModalOpen && supplierToPay && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-black text-sm text-white">تسجيل سداد دفعة للمورد</h3>
                <span className="text-[11px] text-zinc-400 font-bold">{supplierToPay.name} - {supplierToPay.company}</span>
              </div>
              <button onClick={() => setPaySupplierModalOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordSupplierPayment} className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                <div className="flex justify-between text-zinc-400">
                  <span>المديونية الحالية:</span>
                  <span className="font-mono font-bold text-amber-400">{supplierToPay.debtAmount.toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>إجمالي المسدد سابقاً:</span>
                  <span className="font-mono text-zinc-200">{supplierToPay.totalPaid.toLocaleString()} ج.م</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">المبلغ المراد سداده الآن (ج.م)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={paymentAmountInput}
                  onChange={(e) => setPaymentAmountInput(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono font-bold text-base"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                <span className="font-bold text-zinc-300">المديونية بعد السداد:</span>
                <span className="font-mono font-black text-sm text-emerald-400">
                  {Math.max(0, supplierToPay.debtAmount - paymentAmountInput).toLocaleString()} ج.م
                </span>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPaySupplierModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={paySubmitting || paymentAmountInput <= 0}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black cursor-pointer shadow-md disabled:opacity-50"
                >
                  {paySubmitting ? 'جاري التسجيل...' : 'تأكيد سداد الدفعة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 7: EDIT USER ROLE & PERMISSIONS
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
          MODAL 8: CREATE USER / MANAGER
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
          MODAL 9: EDIT PRODUCT MODAL
      ======================================================== */}
      {editProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-black text-sm text-white">تعديل بيانات المنتج ومكان التخزين</h3>
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
