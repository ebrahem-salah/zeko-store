import mongoose, { Schema, Document } from 'mongoose';

export interface IWarehouseItemStock {
  warehouseCode: string;
  warehouseName: string;
  quantity: number;
  shelfLocation?: string; // رقم الرف أو القسم، مثلاً: "الرف A-02" أو "قسم السنيكرز - ستاند 3"
}

export interface IProductDocument extends Document {
  code: string;
  title: string;
  slug: string;
  category: string;
  categoryAr: string;
  price: number;
  oldPrice?: number;
  images: string[];
  description: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  primaryLocation?: string; // المكان الرئيسي (مثال: "المخزن المركزي" أو "فرع الكورنيش")
  shelfLocation?: string; // رقم الرف أو كود التخزين الداخلي
  warehouseStock: IWarehouseItemStock[];
  availableBranches?: string[]; // أسماء الفروع المتاح بها المنتج للاستلام
  totalStock: number;
  minStockAlert: number;
  inStock: boolean;
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
  rating: number;
  reviewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    category: {
      type: String,
      required: true,
      enum: ['clothing', 'sneakers', 'bags', 'caps', 'socks', 'underwear'],
      index: true,
    },
    categoryAr: { type: String, required: true },
    price: { type: Number, required: true, index: true },
    oldPrice: { type: Number, default: 0 },
    images: {
      type: [{ type: String }],
      required: true,
      validate: [
        (val: string[]) => Array.isArray(val) && val.length >= 1 && val.length <= 3,
        'كل منتج يجب أن يحتوي على صورة واحدة على الأقل وبحد أقصى 3 صور فقط.',
      ],
    },
    description: { type: String, required: true },
    sizes: [{ type: String }],
    colors: [
      {
        name: { type: String, required: true },
        hex: { type: String, required: true },
      },
    ],
    primaryLocation: { type: String, default: 'المخزن المركزي' },
    shelfLocation: { type: String, default: 'الرف A-01' },
    availableBranches: [{ type: String }],
    warehouseStock: [
      {
        warehouseCode: { type: String, required: true },
        warehouseName: { type: String, required: true },
        quantity: { type: Number, default: 10 },
        shelfLocation: { type: String, default: 'الرف A-01' },
      },
    ],
    totalStock: { type: Number, default: 40 },
    minStockAlert: { type: Number, default: 5 },
    inStock: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    bestseller: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },
    rating: { type: Number, default: 5 },
    reviewsCount: { type: Number, default: 12 },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Product ||
  mongoose.model<IProductDocument>('Product', ProductSchema);
