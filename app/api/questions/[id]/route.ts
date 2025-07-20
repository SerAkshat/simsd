

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

    const question = await prisma.question.findUnique({
      where: { id: params.id },
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
      }
    });

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error('Error fetching question:', error);
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

    const { 
      title, 
      description, 
      caseFileUrl,
      caseFileId,
      categoryId,
      tagIds = [],
      questionType, 
      minReasoningWords, 
      order,
      options,
      isActive
    } = await request.json();

    // Update question
    const question = await prisma.question.update({
      where: { id: params.id },
      data: {
        title,
        description,
        caseFileUrl,
        caseFileId,
        categoryId,
        questionType,
        minReasoningWords,
        order,
        isActive
      }
    });

    // Update options if provided
    if (options && Array.isArray(options)) {
      // Delete existing options
      await prisma.questionOption.deleteMany({
        where: { questionId: params.id }
      });

      // Create new options
      await prisma.questionOption.createMany({
        data: options.map((option: any, index: number) => ({
          questionId: params.id,
          text: option.text,
          points: option.points || 0,
          isCorrect: option.isCorrect || false,
          order: option.order || index
        }))
      });
    }

    // Update tag relationships if provided
    if (tagIds !== undefined) {
      // Delete existing tag relationships
      await prisma.questionTagRelation.deleteMany({
        where: { questionId: params.id }
      });

      // Create new tag relationships
      if (Array.isArray(tagIds) && tagIds.length > 0) {
        await prisma.questionTagRelation.createMany({
          data: tagIds.map((tagId: string) => ({
            questionId: params.id,
            tagId
          }))
        });
      }
    }

    // Fetch the complete updated question
    const updatedQuestion = await prisma.question.findUnique({
      where: { id: params.id },
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

    return NextResponse.json(updatedQuestion);
  } catch (error: any) {
    console.error('Error updating question:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }
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

    // Soft delete by setting isActive to false
    const question = await prisma.question.update({
      where: { id: params.id },
      data: { isActive: false }
    });

    return NextResponse.json({ message: 'Question deactivated successfully' });
  } catch (error: any) {
    console.error('Error deleting question:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
