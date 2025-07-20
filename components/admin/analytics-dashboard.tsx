
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  UserCheck, 
  UsersIcon as Teams,
  Gamepad2 as GamepadIcon,
  Play,
  FileQuestion,
  MessageSquare,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

interface DashboardData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalTeams: number;
    activeTeams: number;
    totalGameSessions: number;
    activeGameSessions: number;
    totalQuestions: number;
    totalSubmissions: number;
  };
  recentActivity: {
    newUsers: number;
    newTeams: number;
    newSubmissions: number;
  };
  topTeams: Array<{
    id: string;
    name: string;
    totalScore: number;
    members: Array<{ id: string; name: string; }>;
  }>;
  questionsByCategory: Array<{
    category: string;
    color: string;
    count: number;
  }>;
  submissionActivity: Array<{
    date: string;
    submissions: number;
  }>;
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const dashboardData = await apiClient.getDashboardAnalytics();
      setData(dashboardData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-500 mt-4">Loading dashboard...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load dashboard data</p>
      </div>
    );
  }

  const { overview, recentActivity, topTeams, questionsByCategory, submissionActivity } = data;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-blue-600">{overview.totalUsers}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {overview.activeUsers} active
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Teams</p>
                <p className="text-3xl font-bold text-green-600">{overview.totalTeams}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {overview.activeTeams} active
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Teams className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Game Sessions</p>
                <p className="text-3xl font-bold text-purple-600">{overview.totalGameSessions}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {overview.activeGameSessions} active
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <GamepadIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Questions</p>
                <p className="text-3xl font-bold text-orange-600">{overview.totalQuestions}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {overview.totalSubmissions} submissions
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <FileQuestion className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>Recent Activity (Last 7 Days)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <UserCheck className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{recentActivity.newUsers}</p>
              <p className="text-sm text-gray-600">New Users</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Teams className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{recentActivity.newTeams}</p>
              <p className="text-sm text-gray-600">New Teams</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{recentActivity.newSubmissions}</p>
              <p className="text-sm text-gray-600">New Submissions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Teams */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Teams className="w-5 h-5 text-green-600" />
              <span>Top Performing Teams</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topTeams.map((team, index) => (
                <div key={team.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{team.name}</p>
                      <p className="text-sm text-gray-600">{team.members.length} members</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{team.totalScore}</p>
                    <p className="text-sm text-gray-600">points</p>
                  </div>
                </div>
              ))}
              
              {topTeams.length === 0 && (
                <div className="text-center py-8">
                  <Teams className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No teams with scores yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Questions by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileQuestion className="w-5 h-5 text-orange-600" />
              <span>Questions by Category</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {questionsByCategory.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={questionsByCategory}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ category, count }) => `${category} (${count})`}
                    >
                      {questionsByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileQuestion className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No questions created yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Submission Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <span>Submission Activity (Last 30 Days)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {submissionActivity.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={submissionActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value) => [value, 'Submissions']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="submissions" 
                    stroke="#8B5CF6" 
                    strokeWidth={2}
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No submission activity yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
