
export interface User {
  id: string;
  name: string | null;
  email: string;
  role: 'ADMIN' | 'STUDENT';
  teamId: string | null;
  isGroupLeader: boolean;
  individualScore: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  team?: Team | null;
}

export interface Team {
  id: string;
  name: string;
  gameSessionId: string | null;
  totalScore: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  members?: User[];
  gameSession?: GameSession | null;
}

export interface GameSession {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  currentRoundId: string | null;
  maxRounds: number;
  startedAt: Date | null;
  endedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  teams?: Team[];
  rounds?: Round[];
  currentRound?: Round | null;
}

export interface Round {
  id: string;
  gameSessionId: string;
  roundNumber: number;
  type: 'INDIVIDUAL' | 'GROUP' | 'MIX';
  title: string;
  description: string | null;
  timeLimit: number | null;
  isActive: boolean;
  isCompleted: boolean;
  startedAt: Date | null;
  endedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  gameSession?: GameSession;
  questions?: Question[];
}

export interface Question {
  id: string;
  roundId: string;
  title: string;
  description: string;
  caseFileUrl: string | null;
  questionType: 'MULTIPLE_CHOICE' | 'MULTI_SELECT';
  minReasoningWords: number;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  round?: Round;
  options?: QuestionOption[];
}

export interface QuestionOption {
  id: string;
  questionId: string;
  text: string;
  points: number;
  isCorrect: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Submission {
  id: string;
  userId: string;
  questionId: string;
  roundId: string;
  teamId: string | null;
  selectedOptions: string[];
  reasoning: string;
  points: number;
  isGroupSubmission: boolean;
  isIndividualPhase: boolean;
  submittedAt: Date;
  updatedAt: Date;
  user?: User;
  question?: Question;
  round?: Round;
  team?: Team | null;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  email?: string;
  score: number;
  team?: {
    id: string;
    name: string;
  };
  members?: User[];
  memberCount?: number;
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      teamId: string;
      isGroupLeader: boolean;
      individualScore: number;
      team: any;
    }
  }
}
