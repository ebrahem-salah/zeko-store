import mongoose, { Schema, Document } from 'mongoose';

export interface IWarehouseItemStock {
  warehouseCode: string;
  warehouseName: string;
  quantity: number;
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
  warehouseStock: IWarehouseItemStock[];
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
    images: [{ type: String, required: true }],
    description: { type: String, required: true },
    sizes: [{ type: String }],
    colors: [
      {
        name: { type: String, required: true },
        hex: { type: String, required: true },
      },
    ],
    warehouseStock: [
      {
        warehouseCode: { type: String, required: true },
        warehouseName: { type: String, required: true },
        quantity: { type: Number, default: 10 },
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
