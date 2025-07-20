
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const team = await prisma.team.findUnique({
      where: { id: params.id },
      include: {
        members: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            email: true,
            isGroupLeader: true,
            individualScore: true,
            createdAt: true
          }
        },
        gameSession: true,
        submissions: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            },
            question: {
              select: {
                title: true
              }
            },
            round: {
              select: {
                title: true,
                roundNumber: true
              }
            }
          }
        }
      }
    });

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
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

    const { name, gameSessionId, totalScore } = await request.json();

    const team = await prisma.team.update({
      where: { id: params.id },
      data: {
        name,
        gameSessionId: gameSessionId || null,
        totalScore: totalScore !== undefined ? totalScore : undefined
      },
      include: {
        members: true,
        gameSession: true
      }
    });

    return NextResponse.json(team);
  } catch (error) {
    console.error('Error updating team:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    // Remove team members first
    await prisma.user.updateMany({
      where: { teamId: params.id },
      data: { teamId: null, isGroupLeader: false }
    });

    // Delete the team
    await prisma.team.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
