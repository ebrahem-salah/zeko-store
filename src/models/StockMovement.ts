import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStockMovement extends Document {
  type: 'in' | 'out' | 'transfer' | 'adjustment';
  productCode: string;
  productTitle: string;
  fromWarehouse?: string;
  toWarehouse?: string;
  quantity: number;
  reason?: string;
  performedBy: string;
  createdAt: Date;
}

const StockMovementSchema: Schema<IStockMovement> = new Schema(
  {
    type: {
      type: String,
      enum: ['in', 'out', 'transfer', 'adjustment'],
      required: true,
    },
    productCode: {
      type: String,
      required: true,
      trim: true,
    },
    productTitle: {
      type: String,
      required: true,
      trim: true,
    },
    fromWarehouse: {
      type: String,
      default: '',
    },
    toWarehouse: {
      type: String,
      default: '',
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    reason: {
      type: String,
      default: '',
    },
    performedBy: {
      type: String,
      default: 'الإدارة',
    },
  },
  {
    timestamps: true,
  }
);

const StockMovement: Model<IStockMovement> =
  mongoose.models.StockMovement ||
  mongoose.model<IStockMovement>('StockMovement', StockMovementSchema);

export default StockMovement;
