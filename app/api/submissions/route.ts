
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession, getCurrentUser } from '@/lib/auth';

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
    const questionId = searchParams.get('questionId');
    const roundId = searchParams.get('roundId');
    const userId = searchParams.get('userId');
    const teamId = searchParams.get('teamId');

    const where: any = {};
    
    if (questionId) where.questionId = questionId;
    if (roundId) where.roundId = roundId;
    if (userId) where.userId = userId;
    if (teamId) where.teamId = teamId;

    // If not admin, only show user's own submissions
    if (session.user.role !== 'ADMIN') {
      where.userId = session.user.id;
    }

    const submissions = await prisma.submission.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        question: {
          include: {
            options: true
          }
        },
        round: {
          select: {
            id: true,
            title: true,
            roundNumber: true,
            type: true
          }
        },
        team: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { 
      questionId, 
      selectedOptions, 
      reasoning, 
      isGroupSubmission,
      isIndividualPhase 
    } = await request.json();

    if (!questionId || !selectedOptions || !reasoning) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate reasoning length
    const reasoningWords = reasoning.trim().split(/\s+/).length;
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        round: true,
        options: true
      }
    });

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    if (reasoningWords < question.minReasoningWords) {
      return NextResponse.json(
        { error: `Reasoning must be at least ${question.minReasoningWords} words` },
        { status: 400 }
      );
    }

    // Check if round is active
    if (!question.round.isActive) {
      return NextResponse.json(
        { error: 'Round is not active' },
        { status: 400 }
      );
    }

    // Check submission permissions based on round type
    if (question.round.type === 'GROUP' && !user.isGroupLeader && isGroupSubmission) {
      return NextResponse.json(
        { error: 'Only group leaders can submit for group rounds' },
        { status: 403 }
      );
    }

    // Calculate points
    const selectedOptionIds = Array.isArray(selectedOptions) ? selectedOptions : [selectedOptions];
    const validOptions = question.options.filter(option => 
      selectedOptionIds.includes(option.id)
    );
    
    const points = validOptions.reduce((total, option) => total + option.points, 0);

    // Create submission
    const submission = await prisma.submission.create({
      data: {
        userId: user.id,
        questionId,
        roundId: question.round.id,
        teamId: user.teamId,
        selectedOptions: selectedOptionIds,
        reasoning,
        points,
        isGroupSubmission: isGroupSubmission || false,
        isIndividualPhase: isIndividualPhase || false
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        question: true,
        round: true,
        team: true
      }
    });

    // Update user and team scores
    if (isGroupSubmission && user.teamId) {
      // Update team score for group submissions
      await prisma.team.update({
        where: { id: user.teamId },
        data: {
          totalScore: {
            increment: points
          }
        }
      });
    } else {
      // Update individual score
      await prisma.user.update({
        where: { id: user.id },
        data: {
          individualScore: {
            increment: points
          }
        }
      });
    }

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error('Error creating submission:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
