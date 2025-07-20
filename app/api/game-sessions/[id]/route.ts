
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, getSession } from '@/lib/auth';

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const gameSession = await prisma.gameSession.findUnique({
      where: { id: params.id },
      include: {
        teams: {
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
            }
          }
        },
        rounds: {
          include: {
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
          orderBy: { roundNumber: 'asc' }
        },
        currentRound: true
      }
    });

    if (!gameSession) {
      return NextResponse.json(
        { error: 'Game session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(gameSession);
  } catch (error) {
    console.error('Error fetching game session:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const { name, description, maxRounds, isActive, currentRoundId } = await request.json();

    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (maxRounds !== undefined) updateData.maxRounds = maxRounds;
    if (isActive !== undefined) {
      updateData.isActive = isActive;
      if (isActive) {
        updateData.startedAt = new Date();
      } else {
        updateData.endedAt = new Date();
      }
    }
    if (currentRoundId !== undefined) updateData.currentRoundId = currentRoundId;

    const gameSession = await prisma.gameSession.update({
      where: { id: params.id },
      data: updateData,
      include: {
        teams: true,
        rounds: true,
        currentRound: true
      }
    });

    return NextResponse.json(gameSession);
  } catch (error) {
    console.error('Error updating game session:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
