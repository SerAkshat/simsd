
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { requireAdmin } from '@/lib/auth';

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Create case-files subdirectory
    const caseFilesDir = path.join(uploadsDir, 'case-files');
    if (!existsSync(caseFilesDir)) {
      await mkdir(caseFilesDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${originalName}`;
    const filepath = path.join(caseFilesDir, filename);

    // Write file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Return the file URL
    const fileUrl = `/api/files/case-files/${filename}`;

    return NextResponse.json({
      message: 'File uploaded successfully',
      filename,
      url: fileUrl,
      size: file.size,
      type: file.type
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'File upload failed' },
      { status: 500 }
    );
  }
}
