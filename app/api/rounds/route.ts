
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, getSession } from '@/lib/auth';

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
    const gameSessionId = searchParams.get('gameSessionId');

    const where = gameSessionId ? { gameSessionId } : {};

    const rounds = await prisma.round.findMany({
      where,
      include: {
        gameSession: true,
        questions: {
          include: {
            options: true,
            _count: {
              select: {
                submissions: true
              }
            }
          }
        },
        _count: {
          select: {
            submissions: true
          }
        }
      },
      orderBy: [
        { gameSessionId: 'desc' },
        { roundNumber: 'asc' }
      ]
    });

    return NextResponse.json(rounds);
  } catch (error) {
    console.error('Error fetching rounds:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const { gameSessionId, roundNumber, type, title, description, timeLimit } = await request.json();

    if (!gameSessionId || !roundNumber || !type || !title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const round = await prisma.round.create({
      data: {
        gameSessionId,
        roundNumber,
        type,
        title,
        description,
        timeLimit
      },
      include: {
        gameSession: true,
        questions: true
      }
    });

    return NextResponse.json(round, { status: 201 });
  } catch (error) {
    console.error('Error creating round:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
