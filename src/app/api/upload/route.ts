import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const file = formData.get('file') as File;

    const filesToUpload: File[] = [];
    if (file) filesToUpload.push(file);
    if (files && files.length > 0) {
      files.forEach((f) => {
        if (!filesToUpload.includes(f)) filesToUpload.push(f);
      });
    }

    if (filesToUpload.length === 0) {
      return NextResponse.json({ success: false, error: 'No image file uploaded' }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    let canWriteToDisk = true;
    try {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
    } catch {
      canWriteToDisk = false;
    }

    const uploadedUrls: string[] = [];

    for (const f of filesToUpload) {
      const buffer = Buffer.from(await f.arrayBuffer());
      const ext = path.extname(f.name).toLowerCase() || '.jpg';
      const cleanName = f.name.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${cleanName}${ext}`;
      const filePath = path.join(uploadsDir, fileName);

      let savedUrl = '';
      if (canWriteToDisk) {
        try {
          fs.writeFileSync(filePath, buffer);
          savedUrl = `/uploads/${fileName}`;
        } catch {
          canWriteToDisk = false;
        }
      }

      if (!savedUrl) {
        const base64 = buffer.toString('base64');
        const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
        savedUrl = `data:${mime};base64,${base64}`;
      }

      uploadedUrls.push(savedUrl);
    }

    return NextResponse.json({
      success: true,
      url: uploadedUrls[0],
      urls: uploadedUrls,
      message: 'Images uploaded successfully!',
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
