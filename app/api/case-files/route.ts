

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, getCurrentUser } from '@/lib/auth';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const caseFiles = await prisma.caseFile.findMany({
      where: { isActive: true },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            questions: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(caseFiles);
  } catch (error) {
    console.error('Error fetching case files:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 401 }
      );
    }

    const { filename, originalName, filepath, filesize, mimeType, url, description } = await request.json();

    if (!filename || !originalName || !filepath || !url) {
      return NextResponse.json(
        { error: 'Missing required file information' },
        { status: 400 }
      );
    }

    const caseFile = await prisma.caseFile.create({
      data: {
        filename,
        originalName,
        filepath,
        filesize: filesize || 0,
        mimeType: mimeType || 'application/octet-stream',
        url,
        description,
        uploadedBy: user.id
      }
    });

    return NextResponse.json(caseFile, { status: 201 });
  } catch (error) {
    console.error('Error creating case file record:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
