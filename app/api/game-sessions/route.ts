
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

    const gameSessions = await prisma.gameSession.findMany({
      include: {
        teams: {
          include: {
            _count: {
              select: {
                members: true
              }
            }
          }
        },
        rounds: {
          include: {
            _count: {
              select: {
                questions: true
              }
            }
          },
          orderBy: { roundNumber: 'asc' }
        },
        currentRound: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(gameSessions);
  } catch (error) {
    console.error('Error fetching game sessions:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const { name, description, maxRounds } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Game session name is required' },
        { status: 400 }
      );
    }

    const gameSession = await prisma.gameSession.create({
      data: {
        name,
        description,
        maxRounds: maxRounds || 1
      },
      include: {
        teams: true,
        rounds: true
      }
    });

    return NextResponse.json(gameSession, { status: 201 });
  } catch (error) {
    console.error('Error creating game session:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
