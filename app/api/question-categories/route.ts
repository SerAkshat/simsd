

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const categories = await prisma.questionCategory.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            questions: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching question categories:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const { name, description, color } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    const category = await prisma.questionCategory.create({
      data: {
        name,
        description,
        color: color || '#3B82F6'
      }
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error('Error creating question category:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
