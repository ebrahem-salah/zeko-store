import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export async function GET(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || !['admin', 'manager'].includes(session.role)) {
      return NextResponse.json({ success: false, message: 'غير مصرح لك بالوصول.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category');

    await dbConnect();

    const query: any = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (category && category !== 'all') {
      query.category = category;
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error: any) {
    console.error('Admin get products error:', error);
    return NextResponse.json({ success: false, message: 'خطأ في جلب المنتجات.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || !['admin', 'manager'].includes(session.role)) {
      return NextResponse.json({ success: false, message: 'غير مصرح لك بإضافة منتجات.' }, { status: 403 });
    }

    const body = await req.json();
    const { code, title, category, categoryAr, price, oldPrice, images, description, sizes, colors, totalStock } = body;

    if (!code || !title || !price || !category) {
      return NextResponse.json({ success: false, message: 'كود المنتج واسمه وسعره وفئته مطلوبة.' }, { status: 400 });
    }

    await dbConnect();

    const existing = await Product.findOne({ code: code.trim() });
    if (existing) {
      return NextResponse.json({ success: false, message: 'كود المنتج موجود بالفعل.' }, { status: 400 });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9\u0621-\u064A]+/g, '-') + `-${Date.now().toString().slice(-4)}`;

    const product = await Product.create({
      code: code.trim(),
      title: title.trim(),
      slug,
      category,
      categoryAr: categoryAr || 'أزياء رجالي',
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : 0,
      images: Array.isArray(images) && images.length ? images : ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80'],
      description: description || 'منتج عالي الجودة من زيكو ستور.',
      sizes: Array.isArray(sizes) ? sizes : ['M', 'L', 'XL'],
      colors: Array.isArray(colors) ? colors : [{ name: 'أسود', hex: '#18181b' }],
      totalStock: totalStock ? Number(totalStock) : 30,
      inStock: true,
      featured: false,
      bestseller: false,
      newArrival: true,
      rating: 5,
      reviewsCount: 1,
    });

    return NextResponse.json({
      success: true,
      message: 'تم إضافة المنتج بنجاح.',
      product,
    });
  } catch (error: any) {
    console.error('Admin create product error:', error);
    return NextResponse.json({ success: false, message: error.message || 'خطأ في إضافة المنتج.' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || !['admin', 'manager'].includes(session.role)) {
      return NextResponse.json({ success: false, message: 'غير مصرح لك بتعديل المنتجات.' }, { status: 403 });
    }

    const body = await req.json();
    const { id, title, price, oldPrice, inStock, featured, bestseller, totalStock } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'معرف المنتج مطلوب.' }, { status: 400 });
    }

    await dbConnect();

    const updateData: any = {};
    if (title) updateData.title = title.trim();
    if (price !== undefined) updateData.price = Number(price);
    if (oldPrice !== undefined) updateData.oldPrice = Number(oldPrice);
    if (typeof inStock === 'boolean') updateData.inStock = inStock;
    if (typeof featured === 'boolean') updateData.featured = featured;
    if (typeof bestseller === 'boolean') updateData.bestseller = bestseller;
    if (totalStock !== undefined) updateData.totalStock = Number(totalStock);

    const product = await Product.findByIdAndUpdate(id, updateData, { new: true });
    if (!product) {
      return NextResponse.json({ success: false, message: 'المنتج غير موجود.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'تم تحديث بيانات المنتج بنجاح.',
      product,
    });
  } catch (error: any) {
    console.error('Admin update product error:', error);
    return NextResponse.json({ success: false, message: 'خطأ في تحديث المنتج.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'فقط المدير العام (Admin) يمكنه حذف المنتجات.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'معرف المنتج مطلوب.' }, { status: 400 });
    }

    await dbConnect();
    await Product.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'تم حذف المنتج بنجاح.',
    });
  } catch (error: any) {
    console.error('Admin delete product error:', error);
    return NextResponse.json({ success: false, message: 'خطأ في حذف المنتج.' }, { status: 500 });
  }
}
