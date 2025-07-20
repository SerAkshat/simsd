
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        team: true,
        submissions: {
          include: {
            question: true,
            round: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Unauthorized or server error' },
      { status: 401 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const { name, email, role, teamId, isGroupLeader, isActive, password } = await request.json();

    const updateData: any = {
      name,
      email,
      role,
      teamId: teamId || null,
      isGroupLeader: isGroupLeader || false,
      isActive: isActive !== undefined ? isActive : true
    };

    // Only update password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      include: {
        team: true
      }
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating user:', error);
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
    const user = await prisma.user.update({
      where: { id: params.id },
      data: { isActive: false }
    });

    return NextResponse.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
