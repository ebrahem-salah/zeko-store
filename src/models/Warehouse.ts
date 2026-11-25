import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWarehouse extends Document {
  code: string;
  name: string;
  city: string;
  location: string;
  managerName: string;
  managerPhone: string;
  isActive: boolean;
  capacity: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WarehouseSchema: Schema<IWarehouse> = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      default: 'السويس',
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    managerName: {
      type: String,
      default: '',
      trim: true,
    },
    managerPhone: {
      type: String,
      default: '',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    capacity: {
      type: Number,
      default: 1000,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Warehouse: Model<IWarehouse> =
  mongoose.models.Warehouse || mongoose.model<IWarehouse>('Warehouse', WarehouseSchema);

export default Warehouse;
