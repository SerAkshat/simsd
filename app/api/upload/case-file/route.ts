

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { requireAdmin, getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const description = formData.get('description') as string;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type (allow common document types)
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/html',
      'image/png',
      'image/jpeg',
      'image/gif'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed. Please upload PDF, DOC, DOCX, TXT, HTML, or image files.' },
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

    // Create case file record in database
    const fileUrl = `/api/files/case-files/${filename}`;
    
    const caseFile = await prisma.caseFile.create({
      data: {
        filename,
        originalName: file.name,
        filepath,
        filesize: file.size,
        mimeType: file.type,
        url: fileUrl,
        description: description || null,
        uploadedBy: user.id
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Case file uploaded successfully',
      caseFile: {
        id: caseFile.id,
        filename: caseFile.filename,
        originalName: caseFile.originalName,
        url: caseFile.url,
        size: caseFile.filesize,
        type: caseFile.mimeType,
        description: caseFile.description
      }
    });
  } catch (error) {
    console.error('Error uploading case file:', error);
    return NextResponse.json(
      { error: 'File upload failed' },
      { status: 500 }
    );
  }
}
