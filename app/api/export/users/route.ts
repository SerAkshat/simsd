

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const where: any = {};
    if (!includeInactive) {
      where.isActive = true;
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        team: {
          select: {
            id: true,
            name: true
          }
        },
        submissions: {
          select: {
            points: true
          }
        }
      },
      orderBy: [
        { role: 'asc' },
        { name: 'asc' }
      ]
    });

    const exportData = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      teamName: user.team?.name || '',
      isGroupLeader: user.isGroupLeader,
      individualScore: user.individualScore,
      totalSubmissionPoints: user.submissions.reduce((sum, sub) => sum + sub.points, 0),
      submissionCount: user.submissions.length,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    }));

    if (format === 'csv') {
      // Convert to CSV
      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row];
            return typeof value === 'string' && value.includes(',') 
              ? `"${value}"` 
              : value;
          }).join(',')
        )
      ].join('\n');

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename=users_export_${new Date().toISOString().split('T')[0]}.csv`
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: exportData,
      meta: {
        total: exportData.length,
        exportedAt: new Date().toISOString(),
        includeInactive
      }
    });
  } catch (error) {
    console.error('Error exporting users:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
