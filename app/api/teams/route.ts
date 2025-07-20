
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, getSession } from '@/lib/auth';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const teams = await prisma.team.findMany({
      include: {
        members: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            email: true,
            isGroupLeader: true,
            individualScore: true
          }
        },
        gameSession: true,
        _count: {
          select: {
            submissions: true
          }
        }
      },
      orderBy: { totalScore: 'desc' }
    });

    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const { name, gameSessionId } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Team name is required' },
        { status: 400 }
      );
    }

    const team = await prisma.team.create({
      data: {
        name,
        gameSessionId: gameSessionId || null
      },
      include: {
        members: true,
        gameSession: true
      }
    });

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
