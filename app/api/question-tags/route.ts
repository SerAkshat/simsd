

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const tags = await prisma.questionTag.findMany({
      include: {
        _count: {
          select: {
            questions: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching question tags:', error);
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
        { error: 'Tag name is required' },
        { status: 400 }
      );
    }

    const tag = await prisma.questionTag.create({
      data: {
        name,
        description,
        color: color || '#10B981'
      }
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error: any) {
    console.error('Error creating question tag:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Tag name already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
