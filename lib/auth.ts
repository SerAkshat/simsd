
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  
  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email
    },
    include: {
      team: true
    }
  });

  return user;
}

export async function requireAuth() {
  const session = await getSession();
  
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  
  return session;
}

export async function requireAdmin() {
  const session = await getSession();
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Admin access required');
  }
  
  return session;
}

export async function requireTeamMember() {
  const user = await getCurrentUser();
  
  if (!user || !user.teamId) {
    throw new Error('Team membership required');
  }
  
  return user;
}
