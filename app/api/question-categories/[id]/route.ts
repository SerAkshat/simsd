

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

    const { name, description, color, isActive } = await request.json();

    const category = await prisma.questionCategory.update({
      where: { id: params.id },
      data: {
        name,
        description,
        color,
        isActive
      }
    });

    return NextResponse.json(category);
  } catch (error: any) {
    console.error('Error updating question category:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 409 }
      );
    }
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Category not found' },
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
    const category = await prisma.questionCategory.update({
      where: { id: params.id },
      data: { isActive: false }
    });

    return NextResponse.json({ message: 'Category deactivated successfully' });
  } catch (error) {
    console.error('Error deleting question category:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
