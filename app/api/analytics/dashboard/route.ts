

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    // Get basic counts
    const [
      totalUsers,
      activeUsers,
      totalTeams,
      activeTeams,
      totalGameSessions,
      activeGameSessions,
      totalQuestions,
      totalSubmissions
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.team.count(),
      prisma.team.count({ where: { isActive: true } }),
      prisma.gameSession.count(),
      prisma.gameSession.count({ where: { isActive: true } }),
      prisma.question.count({ where: { isActive: true } }),
      prisma.submission.count()
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = {
      newUsers: await prisma.user.count({
        where: { createdAt: { gte: sevenDaysAgo } }
      }),
      newTeams: await prisma.team.count({
        where: { createdAt: { gte: sevenDaysAgo } }
      }),
      newSubmissions: await prisma.submission.count({
        where: { submittedAt: { gte: sevenDaysAgo } }
      })
    };

    // Get top performing teams
    const topTeams = await prisma.team.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        totalScore: true,
        members: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { totalScore: 'desc' },
      take: 5
    });

    // Get question category distribution
    const questionsByCategory = await prisma.question.groupBy({
      by: ['categoryId'],
      where: { isActive: true },
      _count: true
    });

    const categoryNames = await prisma.questionCategory.findMany({
      where: {
        id: {
          in: questionsByCategory
            .map(q => q.categoryId)
            .filter(Boolean) as string[]
        }
      },
      select: { id: true, name: true, color: true }
    });

    const categorizedQuestions = questionsByCategory.map(item => {
      const category = categoryNames.find(c => c.id === item.categoryId);
      return {
        category: category ? category.name : 'Uncategorized',
        color: category ? category.color : '#6B7280',
        count: item._count
      };
    });

    // Add uncategorized questions
    const uncategorizedCount = await prisma.question.count({
      where: { isActive: true, categoryId: null }
    });
    if (uncategorizedCount > 0) {
      categorizedQuestions.push({
        category: 'Uncategorized',
        color: '#6B7280',
        count: uncategorizedCount
      });
    }

    // Get submission activity over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const submissionActivity = await prisma.submission.groupBy({
      by: ['submittedAt'],
      where: {
        submittedAt: { gte: thirtyDaysAgo }
      },
      _count: true,
      orderBy: { submittedAt: 'asc' }
    });

    // Process submission activity into daily buckets
    const dailySubmissions = submissionActivity.reduce((acc: any, item) => {
      const date = item.submittedAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + item._count;
      return acc;
    }, {});

    const submissionChart = Object.entries(dailySubmissions).map(([date, count]) => ({
      date,
      submissions: count
    }));

    return NextResponse.json({
      overview: {
        totalUsers,
        activeUsers,
        totalTeams,
        activeTeams,
        totalGameSessions,
        activeGameSessions,
        totalQuestions,
        totalSubmissions
      },
      recentActivity,
      topTeams,
      questionsByCategory: categorizedQuestions,
      submissionActivity: submissionChart
    });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
