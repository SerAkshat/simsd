
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'both';

    const result: any = {};

    if (type === 'individual' || type === 'both') {
      // Individual leaderboard
      const individualLeaderboard = await prisma.user.findMany({
        where: {
          role: 'STUDENT',
          isActive: true
        },
        select: {
          id: true,
          name: true,
          email: true,
          individualScore: true,
          team: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          individualScore: 'desc'
        },
        take: 50
      });

      result.individual = individualLeaderboard;
    }

    if (type === 'team' || type === 'both') {
      // Team leaderboard
      const teamLeaderboard = await prisma.team.findMany({
        where: {
          isActive: true
        },
        select: {
          id: true,
          name: true,
          totalScore: true,
          members: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              email: true,
              individualScore: true,
              isGroupLeader: true
            }
          },
          _count: {
            select: {
              members: {
                where: { isActive: true }
              }
            }
          }
        },
        orderBy: {
          totalScore: 'desc'
        },
        take: 20
      });

      result.team = teamLeaderboard;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching leaderboards:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
