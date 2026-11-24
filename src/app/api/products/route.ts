import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import { INITIAL_PRODUCTS } from '@/lib/seedProducts';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // Check if initial seed is needed
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(INITIAL_PRODUCTS);
    }

    const { searchParams } = new URL(req.url);
    const keyword = searchParams.get('keyword');
    const category = searchParams.get('category');
    const sort = searchParams.get('sort');
    const featured = searchParams.get('featured');

    const filter: any = { inStock: true };

    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { code: { $regex: keyword, $options: 'i' } },
      ];
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (featured === 'true') {
      filter.featured = true;
    }

    let query = Product.find(filter);

    if (sort === 'price-low') {
      query = query.sort({ price: 1 });
    } else if (sort === 'price-high') {
      query = query.sort({ price: -1 });
    } else if (sort === 'rating') {
      query = query.sort({ rating: -1 });
    } else {
      // Default: featured first, then newest
      query = query.sort({ bestseller: -1, createdAt: -1 });
    }

    const products = await query.exec();

    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (err: any) {
    console.error('Error in GET /api/products:', err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'فشل تحميل المنتجات',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    if (!body.title || !body.price || !body.category) {
      return NextResponse.json(
        { success: false, message: 'البيانات الأساسية للمنتج غير مكتملة' },
        { status: 400 }
      );
    }

    const code = body.code || `ZK-${Math.floor(100 + Math.random() * 900)}`;
    const slug =
      body.slug ||
      `${body.title.replace(/\s+/g, '-').toLowerCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newProduct = await Product.create({
      ...body,
      code,
      slug,
    });

    return NextResponse.json({
      success: true,
      message: 'تم إضافة المنتج بنجاح',
      product: newProduct,
    });
  } catch (err: any) {
    console.error('Error in POST /api/products:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'حدث خطأ أثناء حفظ المنتج' },
      { status: 500 }
    );
  }
}
