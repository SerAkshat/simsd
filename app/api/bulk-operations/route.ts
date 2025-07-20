

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, getCurrentUser } from '@/lib/auth';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const operations = await prisma.bulkOperation.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { startedAt: 'desc' },
      take: 50
    });

    return NextResponse.json(operations);
  } catch (error) {
    console.error('Error fetching bulk operations:', error);
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

    const { type, totalItems = 0, filename } = await request.json();

    if (!type) {
      return NextResponse.json(
        { error: 'Operation type is required' },
        { status: 400 }
      );
    }

    const operation = await prisma.bulkOperation.create({
      data: {
        type,
        status: 'PENDING',
        totalItems,
        filename,
        initiatedBy: user.id
      }
    });

    return NextResponse.json(operation, { status: 201 });
  } catch (error) {
    console.error('Error creating bulk operation:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
