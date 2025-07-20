
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGameContext } from '@/lib/contexts/game-context';
import { 
  Users, 
  Trophy, 
  PlayCircle, 
  BarChart3,
  UserCheck,
  Clock,
  Target,
  Award
} from 'lucide-react';

export function AdminStatsGrid() {
  const { users, teams, currentGameSession, currentRound } = useGameContext();

  const totalStudents = users.filter(user => user.role === 'STUDENT').length;
  const activeStudents = users.filter(user => user.role === 'STUDENT' && user.isActive).length;
  const totalTeams = teams.length;
  const activeTeams = teams.filter(team => team.isActive).length;

  const stats = [
    {
      title: 'Total Students',
      value: totalStudents,
      subtitle: `${activeStudents} active`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Teams',
      value: totalTeams,
      subtitle: `${activeTeams} active`,
      icon: Trophy,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Current Round',
      value: currentRound?.roundNumber || 0,
      subtitle: currentRound?.title || 'No active round',
      icon: PlayCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Game Status',
      value: currentGameSession?.isActive ? 'Active' : 'Inactive',
      subtitle: currentGameSession?.name || 'No session',
      icon: BarChart3,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.subtitle}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
