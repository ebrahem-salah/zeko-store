import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect();
    const { slug } = await context.params;

    const product = await Product.findOne({
      $or: [{ slug }, { code: slug }],
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'المنتج غير موجود' },
        { status: 404 }
      );
    }

    // Fetch related products in the same category
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    })
      .limit(4)
      .exec();

    return NextResponse.json({
      success: true,
      product,
      relatedProducts,
    });
  } catch (err: any) {
    console.error('Error in GET /api/products/[slug]:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'حدث خطأ في استرجاع المنتج' },
      { status: 500 }
    );
  }
}
