
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

    // Deactivate all other rounds in the same game session first
    const round = await prisma.round.findUnique({
      where: { id: params.id },
      include: { gameSession: true }
    });

    if (!round) {
      return NextResponse.json(
        { error: 'Round not found' },
        { status: 404 }
      );
    }

    // Deactivate all rounds in this game session
    await prisma.round.updateMany({
      where: { gameSessionId: round.gameSessionId },
      data: { 
        isActive: false,
        endedAt: new Date()
      }
    });

    // Activate the specified round
    const updatedRound = await prisma.round.update({
      where: { id: params.id },
      data: {
        isActive: true,
        startedAt: new Date(),
        endedAt: null
      }
    });

    // Update the game session's current round
    await prisma.gameSession.update({
      where: { id: round.gameSessionId },
      data: { currentRoundId: params.id }
    });

    return NextResponse.json({ 
      message: 'Round activated successfully',
      round: updatedRound 
    });
  } catch (error) {
    console.error('Error activating round:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
