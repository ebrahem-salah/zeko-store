import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

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

  // 1. Cloudinary Provider (If configured in .env)
  if (cloudName && apiKey && apiSecret) {
    try {
      const timestamp = Math.round(Date.now() / 1000);
      const signaturePayload = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash('sha1').update(signaturePayload).digest('hex');

      const formData = new FormData();
      const blob = new Blob([new Uint8Array(fileBuffer)], { type: mimeType });
      formData.append('file', blob, originalFilename);
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
        filename: data.original_filename || originalFilename,
        size: data.bytes || fileBuffer.length,
      };
    } catch (err) {
      console.warn('Cloudinary upload failed, falling back to local storage:', err);
    }
  }

  // 2. Default Local Storage Provider
  const uploadDir = path.join(process.cwd(), 'public', folder);
  await mkdir(uploadDir, { recursive: true });

  const fileExt = path.extname(originalFilename) || (mimeType.includes('png') ? '.png' : '.jpg');
  const safeBaseName = path
    .basename(originalFilename, fileExt)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 30);
  const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const finalFilename = `${safeBaseName}_${uniqueSuffix}${fileExt}`;
  const filePath = path.join(uploadDir, finalFilename);

  await writeFile(filePath, fileBuffer);

  return {
    url: `/${folder}/${finalFilename}`,
    provider: 'local',
    filename: finalFilename,
    size: fileBuffer.length,
  };
}
