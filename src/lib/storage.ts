import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';

export interface UploadResult {
  url: string;
  provider: 'local' | 'cloudinary';
  filename: string;
  size: number;
}

export async function uploadFile(
  fileBuffer: Buffer,
  originalFilename: string,
  mimeType: string,
  folder: string = 'uploads'
): Promise<UploadResult> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  let processedBuffer = fileBuffer;
  let targetMimeType = mimeType;
  let targetExt = path.extname(originalFilename) || '.jpg';

  // 1. Automatic WebP Conversion & Optimization with Security Validations
  if (mimeType.startsWith('image/')) {
    try {
      const imageInstance = sharp(fileBuffer);
      const metadata = await imageInstance.metadata();

      const validFormats = ['jpeg', 'jpg', 'png', 'webp', 'avif'];
      if (!metadata.format || !validFormats.includes(metadata.format)) {
        throw new Error(`تنسيق الصورة (${metadata.format || 'غير معروف'}) غير مدعوم أو تالف.`);
      }

      processedBuffer = await imageInstance
        .rotate() // auto-orient based on camera/mobile EXIF orientation
        .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }) // prevent dimension bombs
        .webp({ quality: 80, effort: 4 })
        .toBuffer();

      targetMimeType = 'image/webp';
      targetExt = '.webp';
    } catch (err: any) {
      console.error('Sharp image processing error:', err.message);
      throw new Error(`فشلت معالجة الصورة: ${err.message || 'الملف ليس صورة صالحة'}`);
    }
  } else {
    throw new Error('مسموح برفع ملفات الصور فقط.');
  }

  // 2. Cloudinary Provider (If configured in .env)
  if (cloudName && apiKey && apiSecret) {
    try {
      const timestamp = Math.round(Date.now() / 1000);
      const signaturePayload = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash('sha1').update(signaturePayload).digest('hex');

      const formData = new FormData();
      const webpFilename = `${path.basename(originalFilename, path.extname(originalFilename))}${targetExt}`;
      const blob = new Blob([new Uint8Array(processedBuffer)], { type: targetMimeType });
      formData.append('file', blob, webpFilename);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('folder', folder);

      const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Cloudinary upload failed: ${errorData?.error?.message || res.statusText}`);
      }

      const data = await res.json();
      return {
        url: data.secure_url || data.url,
        provider: 'cloudinary',
        filename: data.original_filename || webpFilename,
        size: data.bytes || processedBuffer.length,
      };
    } catch (err) {
      console.warn('Cloudinary upload failed, falling back to local storage:', err);
    }
  }

  // 3. Local Storage Provider (Saved as optimized .webp in public/uploads or public/avatars)
  const uploadDir = path.join(process.cwd(), 'public', folder);
  await mkdir(uploadDir, { recursive: true });

  const safeBaseName = path
    .basename(originalFilename, path.extname(originalFilename))
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 30);
  const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const finalFilename = `${safeBaseName}_${uniqueSuffix}${targetExt}`;
  const filePath = path.join(uploadDir, finalFilename);

  await writeFile(filePath, processedBuffer);

  return {
    url: `/${folder}/${finalFilename}`,
    provider: 'local',
    filename: finalFilename,
    size: processedBuffer.length,
  };
}
