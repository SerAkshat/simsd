

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const { description, isActive } = await request.json();

    const caseFile = await prisma.caseFile.update({
      where: { id: params.id },
      data: {
        description,
        isActive
      }
    });

    return NextResponse.json(caseFile);
  } catch (error: any) {
    console.error('Error updating case file:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Case file not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    // Soft delete by setting isActive to false
    const caseFile = await prisma.caseFile.update({
      where: { id: params.id },
      data: { isActive: false }
    });

    return NextResponse.json({ message: 'Case file deactivated successfully' });
  } catch (error) {
    console.error('Error deleting case file:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
