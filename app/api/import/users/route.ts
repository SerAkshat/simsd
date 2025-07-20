

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, getCurrentUser } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 401 }
      );
    }

    const { users: userData, options = {} } = await request.json();

    if (!Array.isArray(userData)) {
      return NextResponse.json(
        { error: 'Users data must be an array' },
        { status: 400 }
      );
    }

    // Create bulk operation record
    const bulkOperation = await prisma.bulkOperation.create({
      data: {
        type: 'IMPORT_USERS',
        status: 'PROCESSING',
        totalItems: userData.length,
        initiatedBy: user.id
      }
    });

    let processedCount = 0;
    let failedCount = 0;
    const errors: any[] = [];

    for (const userData_item of userData) {
      try {
        const { name, email, password, role = 'STUDENT', teamName } = userData_item;

        if (!email || !password) {
          failedCount++;
          errors.push({
            email: email || 'missing',
            error: 'Email and password are required'
          });
          continue;
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email }
        });

        if (existingUser && !options.updateExisting) {
          failedCount++;
          errors.push({
            email,
            error: 'User already exists'
          });
          continue;
        }

        // Find team by name if provided
        let teamId = null;
        if (teamName) {
          const team = await prisma.team.findUnique({
            where: { name: teamName }
          });
          teamId = team?.id || null;
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        if (existingUser && options.updateExisting) {
          // Update existing user
          await prisma.user.update({
            where: { email },
            data: {
              name,
              password: hashedPassword,
              role,
              teamId
            }
          });
        } else {
          // Create new user
          await prisma.user.create({
            data: {
              name,
              email,
              password: hashedPassword,
              role,
              teamId
            }
          });
        }

        processedCount++;
      } catch (error) {
        failedCount++;
        errors.push({
          email: userData_item.email || 'unknown',
          error: (error as Error).message
        });
      }
    }

    // Update bulk operation
    await prisma.bulkOperation.update({
      where: { id: bulkOperation.id },
      data: {
        status: failedCount === userData.length ? 'FAILED' : 'COMPLETED',
        processedItems: processedCount,
        failedItems: failedCount,
        resultData: { errors },
        completedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      processed: processedCount,
      failed: failedCount,
      errors: errors.slice(0, 10), // Return first 10 errors
      operationId: bulkOperation.id
    });
  } catch (error) {
    console.error('Error importing users:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
