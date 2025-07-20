
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.submission.deleteMany();
  await prisma.questionOption.deleteMany();
  await prisma.question.deleteMany();
  await prisma.round.deleteMany();
  await prisma.gameSession.deleteMany();
  await prisma.user.deleteMany();
  await prisma.team.deleteMany();

  console.log('📝 Creating admin user...');
  
  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@business-sim.com',
      password: await bcrypt.hash('admin123', 12),
      role: 'ADMIN',
    },
  });

  // Create required test account
  const testUser = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@doe.com',
      password: await bcrypt.hash('johndoe123', 12),
      role: 'ADMIN',
    },
  });

  console.log('👥 Creating teams...');
  
  // Create teams
  const team1 = await prisma.team.create({
    data: {
      name: 'Alpha Team',
      totalScore: 0,
    },
  });

  const team2 = await prisma.team.create({
    data: {
      name: 'Beta Team',
      totalScore: 0,
    },
  });

  const team3 = await prisma.team.create({
    data: {
      name: 'Gamma Team',
      totalScore: 0,
    },
  });

  console.log('👤 Creating student users...');
  
  // Create student users for Alpha Team
  const alphaLeader = await prisma.user.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: await bcrypt.hash('student123', 12),
      role: 'STUDENT',
      teamId: team1.id,
      isGroupLeader: true,
      individualScore: 85,
    },
  });

  await prisma.user.create({
    data: {
      name: 'Bob Smith',
      email: 'bob@example.com',
      password: await bcrypt.hash('student123', 12),
      role: 'STUDENT',
      teamId: team1.id,
      individualScore: 78,
    },
  });

  await prisma.user.create({
    data: {
      name: 'Carol Wilson',
      email: 'carol@example.com',
      password: await bcrypt.hash('student123', 12),
      role: 'STUDENT',
      teamId: team1.id,
      individualScore: 92,
    },
  });

  // Create student users for Beta Team
  const betaLeader = await prisma.user.create({
    data: {
      name: 'David Brown',
      email: 'david@example.com',
      password: await bcrypt.hash('student123', 12),
      role: 'STUDENT',
      teamId: team2.id,
      isGroupLeader: true,
      individualScore: 88,
    },
  });

  await prisma.user.create({
    data: {
      name: 'Eva Davis',
      email: 'eva@example.com',
      password: await bcrypt.hash('student123', 12),
      role: 'STUDENT',
      teamId: team2.id,
      individualScore: 81,
    },
  });

  await prisma.user.create({
    data: {
      name: 'Frank Miller',
      email: 'frank@example.com',
      password: await bcrypt.hash('student123', 12),
      role: 'STUDENT',
      teamId: team2.id,
      individualScore: 76,
    },
  });

  // Create student users for Gamma Team
  const gammaLeader = await prisma.user.create({
    data: {
      name: 'Grace Taylor',
      email: 'grace@example.com',
      password: await bcrypt.hash('student123', 12),
      role: 'STUDENT',
      teamId: team3.id,
      isGroupLeader: true,
      individualScore: 90,
    },
  });

  await prisma.user.create({
    data: {
      name: 'Henry Clark',
      email: 'henry@example.com',
      password: await bcrypt.hash('student123', 12),
      role: 'STUDENT',
      teamId: team3.id,
      individualScore: 84,
    },
  });

  await prisma.user.create({
    data: {
      name: 'Ivy Rodriguez',
      email: 'ivy@example.com',
      password: await bcrypt.hash('student123', 12),
      role: 'STUDENT',
      teamId: team3.id,
      individualScore: 87,
    },
  });

  console.log('🎮 Creating game session...');
  
  // Create game session
  const gameSession = await prisma.gameSession.create({
    data: {
      name: 'Q1 2024 Business Strategy Simulation',
      description: 'A comprehensive simulation focusing on strategic decision-making in competitive markets.',
      maxRounds: 3,
      isActive: true,
      startedAt: new Date(),
    },
  });

  // Associate teams with game session
  await prisma.team.updateMany({
    where: { id: { in: [team1.id, team2.id, team3.id] } },
    data: { gameSessionId: gameSession.id },
  });

  console.log('🎯 Creating rounds and questions...');
  
  // Round 1: Individual Decision Making
  const round1 = await prisma.round.create({
    data: {
      gameSessionId: gameSession.id,
      roundNumber: 1,
      type: 'INDIVIDUAL',
      title: 'Market Entry Strategy',
      description: 'Analyze market conditions and choose the best entry strategy for your company.',
      timeLimit: 30,
      isActive: true,
      startedAt: new Date(),
    },
  });

  const question1 = await prisma.question.create({
    data: {
      roundId: round1.id,
      title: 'Market Entry Decision',
      description: 'Your company is considering entering a new market. Based on the market analysis provided in the case study, which entry strategy would be most appropriate?',
      caseFileUrl: '/case-files/market-analysis-q1.pdf',
      questionType: 'MULTIPLE_CHOICE',
      minReasoningWords: 20,
      order: 1,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        questionId: question1.id,
        text: 'Direct investment with full subsidiary',
        points: 15,
        isCorrect: false,
        order: 1,
      },
      {
        questionId: question1.id,
        text: 'Joint venture with local partner',
        points: 25,
        isCorrect: true,
        order: 2,
      },
      {
        questionId: question1.id,
        text: 'Licensing agreement',
        points: 10,
        isCorrect: false,
        order: 3,
      },
      {
        questionId: question1.id,
        text: 'Export through distributors',
        points: 20,
        isCorrect: false,
        order: 4,
      },
    ],
  });

  // Round 2: Group Decision Making
  const round2 = await prisma.round.create({
    data: {
      gameSessionId: gameSession.id,
      roundNumber: 2,
      type: 'GROUP',
      title: 'Crisis Management',
      description: 'Work as a team to navigate through a major business crisis.',
      timeLimit: 45,
      isActive: false,
    },
  });

  const question2 = await prisma.question.create({
    data: {
      roundId: round2.id,
      title: 'Crisis Response Strategy',
      description: 'Your company faces a major PR crisis due to a product recall. How should your team respond to minimize damage and restore trust?',
      caseFileUrl: '/case-files/crisis-scenario.pdf',
      questionType: 'MULTI_SELECT',
      minReasoningWords: 30,
      order: 1,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        questionId: question2.id,
        text: 'Issue immediate public apology',
        points: 20,
        isCorrect: true,
        order: 1,
      },
      {
        questionId: question2.id,
        text: 'Launch comprehensive investigation',
        points: 25,
        isCorrect: true,
        order: 2,
      },
      {
        questionId: question2.id,
        text: 'Offer full refunds and compensation',
        points: 20,
        isCorrect: true,
        order: 3,
      },
      {
        questionId: question2.id,
        text: 'Deny responsibility initially',
        points: -10,
        isCorrect: false,
        order: 4,
      },
      {
        questionId: question2.id,
        text: 'Implement new quality assurance measures',
        points: 15,
        isCorrect: true,
        order: 5,
      },
    ],
  });

  // Round 3: Mixed (Individual then Group)
  const round3 = await prisma.round.create({
    data: {
      gameSessionId: gameSession.id,
      roundNumber: 3,
      type: 'MIX',
      title: 'Strategic Partnership',
      description: 'First decide individually, then discuss as a team to reach a consensus on strategic partnerships.',
      timeLimit: 60,
      isActive: false,
    },
  });

  const question3 = await prisma.question.create({
    data: {
      roundId: round3.id,
      title: 'Partnership Selection',
      description: 'Your company has the opportunity to form a strategic partnership. Which partner would provide the most value for long-term growth?',
      caseFileUrl: '/case-files/partnership-options.pdf',
      questionType: 'MULTIPLE_CHOICE',
      minReasoningWords: 25,
      order: 1,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        questionId: question3.id,
        text: 'Technology startup with innovative solutions',
        points: 30,
        isCorrect: true,
        order: 1,
      },
      {
        questionId: question3.id,
        text: 'Established competitor in adjacent market',
        points: 20,
        isCorrect: false,
        order: 2,
      },
      {
        questionId: question3.id,
        text: 'Supplier with strong distribution network',
        points: 25,
        isCorrect: false,
        order: 3,
      },
      {
        questionId: question3.id,
        text: 'Government agency for regulatory support',
        points: 15,
        isCorrect: false,
        order: 4,
      },
    ],
  });

  // Update game session with current round
  await prisma.gameSession.update({
    where: { id: gameSession.id },
    data: { currentRoundId: round1.id },
  });

  // Update team scores based on individual scores
  await prisma.team.update({
    where: { id: team1.id },
    data: { totalScore: 255 }, // Sum of Alpha team individual scores
  });

  await prisma.team.update({
    where: { id: team2.id },
    data: { totalScore: 245 }, // Sum of Beta team individual scores
  });

  await prisma.team.update({
    where: { id: team3.id },
    data: { totalScore: 261 }, // Sum of Gamma team individual scores
  });

  console.log('✅ Database seeded successfully!');
  console.log(`👑 Admin user: admin@business-sim.com / admin123`);
  console.log(`🧪 Test user: john@doe.com / johndoe123`);
  console.log(`👥 Student users: alice@example.com, bob@example.com, etc. / student123`);
  console.log(`🎮 Game session: "${gameSession.name}" with 3 rounds`);
  console.log(`📊 3 teams created with sample data`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
