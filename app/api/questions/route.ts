
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
    const roundId = searchParams.get('roundId');

    const where = roundId ? { roundId } : {};

    const questions = await prisma.question.findMany({
      where,
      include: {
        round: {
          include: {
            gameSession: true
          }
        },
        category: true,
        caseFile: true,
        options: {
          orderBy: { order: 'asc' }
        },
        tags: {
          include: {
            tag: true
          }
        },
        _count: {
          select: {
            submissions: true
          }
        }
      },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const { 
      roundId, 
      title, 
      description, 
      caseFileUrl,
      caseFileId,
      categoryId,
      tagIds = [],
      questionType, 
      minReasoningWords, 
      order,
      options 
    } = await request.json();

    if (!roundId || !title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create question
    const question = await prisma.question.create({
      data: {
        roundId,
        title,
        description,
        caseFileUrl,
        caseFileId,
        categoryId,
        questionType: questionType || 'MULTIPLE_CHOICE',
        minReasoningWords: minReasoningWords || 15,
        order: order || 0
      }
    });

    // Create options if provided
    if (options && Array.isArray(options)) {
      await prisma.questionOption.createMany({
        data: options.map((option: any, index: number) => ({
          questionId: question.id,
          text: option.text,
          points: option.points || 0,
          isCorrect: option.isCorrect || false,
          order: option.order || index
        }))
      });
    }

    // Create tag relationships if provided
    if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
      await prisma.questionTagRelation.createMany({
        data: tagIds.map((tagId: string) => ({
          questionId: question.id,
          tagId
        }))
      });
    }

    // Fetch the complete question with all relations
    const completeQuestion = await prisma.question.findUnique({
      where: { id: question.id },
      include: {
        round: true,
        category: true,
        caseFile: true,
        options: {
          orderBy: { order: 'asc' }
        },
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    return NextResponse.json(completeQuestion, { status: 201 });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
