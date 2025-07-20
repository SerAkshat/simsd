

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

    const { status, processedItems, failedItems, resultData } = await request.json();

    const updateData: any = {};
    if (status) updateData.status = status;
    if (processedItems !== undefined) updateData.processedItems = processedItems;
    if (failedItems !== undefined) updateData.failedItems = failedItems;
    if (resultData) updateData.resultData = resultData;
    if (status === 'COMPLETED' || status === 'FAILED') {
      updateData.completedAt = new Date();
    }

    const operation = await prisma.bulkOperation.update({
      where: { id: params.id },
      data: updateData
    });

    return NextResponse.json(operation);
  } catch (error: any) {
    console.error('Error updating bulk operation:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Operation not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
