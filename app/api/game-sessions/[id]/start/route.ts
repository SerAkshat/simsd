
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    // Get the first round of the game session
    const firstRound = await prisma.round.findFirst({
      where: { 
        gameSessionId: params.id,
        roundNumber: 1
      }
    });

    if (!firstRound) {
      return NextResponse.json(
        { error: 'No rounds found for this game session' },
        { status: 400 }
      );
    }

    // Start the game session and activate the first round
    const gameSession = await prisma.gameSession.update({
      where: { id: params.id },
      data: {
        isActive: true,
        startedAt: new Date(),
        currentRoundId: firstRound.id
      }
    });

    // Activate the first round
    await prisma.round.update({
      where: { id: firstRound.id },
      data: {
        isActive: true,
        startedAt: new Date()
      }
    });

    return NextResponse.json({ 
      message: 'Game session started successfully',
      gameSession 
    });
  } catch (error) {
    console.error('Error starting game session:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
