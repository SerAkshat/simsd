
'use client';

import { useSession } from 'next-auth/react';
import { useGameContext } from '@/lib/contexts/game-context';
import { Header } from '@/components/navigation/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Trophy, 
  Settings, 
  PlayCircle,
  BarChart3,
  UserPlus,
  Plus,
  Clock,
  Shield
} from 'lucide-react';
import { AdminStatsGrid } from '@/components/admin/admin-stats-grid';
import { GameSessionManagement } from '@/components/admin/game-session-management';
import { UserManagement } from '@/components/admin/user-management';
import { TeamManagement } from '@/components/admin/team-management';
import { useState } from 'react';
import { redirect } from 'next/navigation';

type AdminView = 'overview' | 'users' | 'teams' | 'sessions' | 'analytics';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const { currentGameSession, teams, users, loading } = useGameContext();
  const [currentView, setCurrentView] = useState<AdminView>('overview');

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

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'sessions', label: 'Game Sessions', icon: PlayCircle },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'teams', label: 'Teams', icon: Trophy },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'users':
        return <UserManagement />;
      case 'teams':
        return <TeamManagement />;
      case 'sessions':
        return <GameSessionManagement />;
      case 'analytics':
        return (
          <div className="text-center py-16">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
            <p className="text-gray-600">Detailed analytics and reporting will be available here.</p>
          </div>
        );
      default:
        return (
          <div className="space-y-8">
            <AdminStatsGrid />
            
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  <span>Quick Actions</span>
                </CardTitle>
                <CardDescription>
                  Common administrative tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2"
                    onClick={() => setCurrentView('users')}
                  >
                    <UserPlus className="w-6 h-6" />
                    <span>Manage Users</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2"
                    onClick={() => setCurrentView('teams')}
                  >
                    <Users className="w-6 h-6" />
                    <span>Manage Teams</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2"
                    onClick={() => setCurrentView('sessions')}
                  >
                    <Plus className="w-6 h-6" />
                    <span>New Session</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Current Session Status */}
            {currentGameSession && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PlayCircle className="w-5 h-5 text-blue-600" />
                    <span>Active Session: {currentGameSession.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {currentGameSession.currentRound?.roundNumber || 0}
                      </div>
                      <div className="text-sm text-gray-600">Current Round</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {teams.length}
                      </div>
                      <div className="text-sm text-gray-600">Teams Participating</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {users.filter(u => u.role === 'STUDENT').length}
                      </div>
                      <div className="text-sm text-gray-600">Student Participants</div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-center">
                    <Button onClick={() => setCurrentView('sessions')}>
                      Manage Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Admin Panel" />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-8 h-8 text-orange-600" />
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <p className="text-gray-600">
            Manage users, teams, game sessions and monitor simulation progress
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 space-y-2">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setCurrentView(item.id as AdminView)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          currentView === item.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              renderContent()
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
