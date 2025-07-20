
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Crown, User, Trophy } from 'lucide-react';
import { Team } from '@/lib/types';

interface TeamStatusCardProps {
  team: Team;
  currentUser: any;
}

export function TeamStatusCard({ team, currentUser }: TeamStatusCardProps) {
  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      ?.map(n => n[0])
      ?.join('')
      ?.toUpperCase() || 'U';
  };

  const sortedMembers = [...(team.members || [])].sort((a, b) => {
    if (a.isGroupLeader && !b.isGroupLeader) return -1;
    if (!a.isGroupLeader && b.isGroupLeader) return 1;
    return b.individualScore - a.individualScore;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-blue-600" />
          <span>Your Team: {team.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Team Score</span>
            <div className="flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-yellow-600" />
              <span className="text-lg font-bold text-gray-900">
                {team.totalScore}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Team Members</h4>
          {sortedMembers.map((member) => (
            <div
              key={member.id}
              className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                member.id === currentUser.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
              }`}
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-sm bg-gray-100">
                  {getInitials(member.name || '')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">
                    {member.name}
                  </span>
                  {member.isGroupLeader && (
                    <Crown className="w-4 h-4 text-yellow-600" />
                  )}
                  {member.id === currentUser.id && (
                    <Badge variant="outline" className="text-xs">You</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500">{member.email}</p>
              </div>
              
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {member.individualScore}
                </div>
                <div className="text-xs text-gray-500">points</div>
              </div>
            </div>
          ))}
        </div>

        {currentUser.isGroupLeader && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <Crown className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  You are the team leader
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  You can submit answers for group rounds and lead team discussions.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
