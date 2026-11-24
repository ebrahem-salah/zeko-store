import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISiteSettings extends Document {
  siteName: string;
  siteNameEn: string;
  siteDescription: string;
  siteDescriptionEn: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  facebookUrl: string;
  instagramUrl: string;
  currency: string;
  enableRegistration: boolean;
  enableGoogleAuth: boolean;
  updatedAt: Date;
}

const SiteSettingsSchema: Schema<ISiteSettings> = new Schema(
  {
    siteName: {
      type: String,
      default: 'منصتي الذكية',
      trim: true,
    },
    siteNameEn: {
      type: String,
      default: 'My SaaS Platform',
      trim: true,
    },
    siteDescription: {
      type: String,
      default: 'منصة سحابية متكاملة لتقديم الخدمات والمنتجات الرقمية',
      trim: true,
    },
    siteDescriptionEn: {
      type: String,
      default: 'A full-stack cloud platform for digital services and commerce',
      trim: true,
    },
    logoUrl: {
      type: String,
      default: '',
    },
    faviconUrl: {
      type: String,
      default: '',
    },
    primaryColor: {
      type: String,
      default: '#2563eb',
    },
    secondaryColor: {
      type: String,
      default: '#4f46e5',
    },
    contactEmail: {
      type: String,
      default: 'support@example.com',
      trim: true,
    },
    contactPhone: {
      type: String,
      default: '+201096986091',
      trim: true,
    },
    whatsappNumber: {
      type: String,
      default: '201096986091',
      trim: true,
    },
    facebookUrl: {
      type: String,
      default: '',
      trim: true,
    },
    instagramUrl: {
      type: String,
      default: '',
      trim: true,
    },
    currency: {
      type: String,
      default: 'ر.س',
      trim: true,
    },
    enableRegistration: {
      type: Boolean,
      default: true,
    },
    enableGoogleAuth: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const SiteSettings: Model<ISiteSettings> =
  mongoose.models.SiteSettings || mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);

export default SiteSettings;
