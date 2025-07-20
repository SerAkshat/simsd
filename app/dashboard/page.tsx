
'use client';

import { useSession } from 'next-auth/react';
import { useGameContext } from '@/lib/contexts/game-context';
import { Header } from '@/components/navigation/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Users, 
  Clock, 
  PlayCircle, 
  Award,
  Target,
  BookOpen,
  Timer
} from 'lucide-react';
import { LeaderboardCard } from '@/components/dashboard/leaderboard-card';
import { CurrentRoundCard } from '@/components/dashboard/current-round-card';
import { TeamStatusCard } from '@/components/dashboard/team-status-card';
import { QuestionModal } from '@/components/dashboard/question-modal';
import { useState } from 'react';
import { redirect } from 'next/navigation';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const { currentGameSession, currentRound, teams, leaderboards, loading } = useGameContext();
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (session.user.role === 'ADMIN') {
    redirect('/admin');
  }

  const userTeam = teams.find(team => team.id === session.user.teamId);
  const teamRank = teams
    .sort((a, b) => b.totalScore - a.totalScore)
    .findIndex(team => team.id === userTeam?.id) + 1;

  const individualRank = leaderboards.individual
    .findIndex(user => user.id === session.user.id) + 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Student Dashboard" />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {session.user.name}
          </h1>
          <p className="text-gray-600">
            Track your progress and participate in the current simulation round
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Individual Rank</p>
                  <p className="text-2xl font-bold text-gray-900">
                    #{individualRank || 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Your Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {session.user.individualScore || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Team Rank</p>
                  <p className="text-2xl font-bold text-gray-900">
                    #{teamRank || 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Team Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {userTeam?.totalScore || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Game Session */}
            {currentGameSession ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <PlayCircle className="w-5 h-5 text-blue-600" />
                        <span>Current Simulation</span>
                      </CardTitle>
                      <CardDescription>
                        {currentGameSession.name}
                      </CardDescription>
                    </div>
                    <Badge variant={currentGameSession.isActive ? "default" : "secondary"}>
                      {currentGameSession.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    {currentGameSession.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      Round {currentRound?.roundNumber || 0} of {currentGameSession.maxRounds}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        Started {currentGameSession.startedAt ? 
                          new Date(currentGameSession.startedAt).toLocaleDateString() : 
                          'Not started'
                        }
                      </span>
                    </div>
                  </div>
                  <Progress 
                    value={(currentRound?.roundNumber || 0) / currentGameSession.maxRounds * 100} 
                    className="mt-3" 
                  />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Active Simulation
                  </h3>
                  <p className="text-gray-600">
                    There are no active simulations at the moment. Check back later or contact your instructor.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Current Round */}
            {currentRound && (
              <CurrentRoundCard 
                round={currentRound}
                onQuestionSelect={setSelectedQuestionId}
                userRole={session.user.role}
                isGroupLeader={session.user.isGroupLeader}
              />
            )}

            {/* Team Status */}
            {userTeam && (
              <TeamStatusCard team={userTeam} currentUser={session.user} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Individual Leaderboard */}
            <LeaderboardCard 
              title="Individual Rankings"
              type="individual"
              data={leaderboards.individual.slice(0, 10)}
              currentUserId={session.user.id}
              loading={loading}
            />

            {/* Team Leaderboard */}
            <LeaderboardCard 
              title="Team Rankings"
              type="team"
              data={leaderboards.team.slice(0, 5)}
              currentTeamId={session.user.teamId}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* Question Modal */}
      {selectedQuestionId && (
        <QuestionModal
          questionId={selectedQuestionId}
          onClose={() => setSelectedQuestionId(null)}
          userRole={session.user.role}
          isGroupLeader={session.user.isGroupLeader}
        />
      )}
    </div>
  );
}
