
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();

    const users = await prisma.user.findMany({
      include: {
        team: true,
        _count: {
          select: {
            submissions: true
          }
        }
      },
      orderBy: [
        { role: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // Remove passwords from response
    const safeUsers = users.map(({ password, ...user }) => user);

    return NextResponse.json(safeUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Unauthorized or server error' },
      { status: 401 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const { name, email, password, role, teamId } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'STUDENT',
        teamId: teamId || null
      },
      include: {
        team: true
      }
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
