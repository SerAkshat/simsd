
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Crown, Medal, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardCardProps {
  title: string;
  type: 'individual' | 'team';
  data: any[];
  currentUserId?: string;
  currentTeamId?: string | null;
  loading?: boolean;
}

export function LeaderboardCard({ 
  title, 
  type, 
  data, 
  currentUserId, 
  currentTeamId,
  loading 
}: LeaderboardCardProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 2:
        return <Medal className="w-4 h-4 text-gray-600" />;
      case 3:
        return <Award className="w-4 h-4 text-orange-600" />;
      default:
        return <span className="text-sm font-semibold text-gray-600">#{rank}</span>;
    }
  };

  const getRankBadgeClass = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 2:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 3:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      ?.map(n => n[0])
      ?.join('')
      ?.toUpperCase() || 'U';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {type === 'individual' ? (
              <Trophy className="w-5 h-5 text-blue-600" />
            ) : (
              <Users className="w-5 h-5 text-blue-600" />
            )}
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-12"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {type === 'individual' ? (
            <Trophy className="w-5 h-5 text-blue-600" />
          ) : (
            <Users className="w-5 h-5 text-blue-600" />
          )}
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-6">
            <Trophy className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No data available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.map((entry, index) => {
              const rank = index + 1;
              const isCurrentUser = type === 'individual' && entry.id === currentUserId;
              const isCurrentTeam = type === 'team' && entry.id === currentTeamId;
              const isCurrent = isCurrentUser || isCurrentTeam;

              return (
                <div
                  key={entry.id}
                  className={cn(
                    'flex items-center space-x-3 p-2 rounded-lg transition-all',
                    isCurrent ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                  )}
                >
                  <div className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full border',
                    getRankBadgeClass(rank)
                  )}>
                    {getRankIcon(rank)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      {type === 'individual' ? (
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs bg-gray-100">
                            {getInitials(entry.name)}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                          <Users className="w-3 h-3 text-purple-600" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {entry.name}
                        </p>
                        {type === 'individual' && entry.team && (
                          <p className="text-xs text-gray-500 truncate">
                            {entry.team.name}
                          </p>
                        )}
                        {type === 'team' && (
                          <p className="text-xs text-gray-500">
                            {entry.members?.length || 0} members
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <Badge variant="outline" className="font-mono">
                      {type === 'individual' ? entry.individualScore : entry.totalScore}
                    </Badge>
                    {isCurrent && (
                      <div className="text-xs text-blue-600 font-medium mt-1">
                        You
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
