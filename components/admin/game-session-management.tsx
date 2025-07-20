
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  PlayCircle, 
  Plus, 
  Edit, 
  Play,
  Pause,
  Clock,
  Users,
  Target,
  Settings,
  FileText,
  MessageSquare
} from 'lucide-react';
import { useGameContext } from '@/lib/contexts/game-context';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { QuestionManagement } from './question-management';

export function GameSessionManagement() {
  const { currentGameSession, teams, refreshData } = useGameContext();
  const [gameSessions, setGameSessions] = useState<any[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<any>(null);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [showQuestionManager, setShowQuestionManager] = useState(false);
  const [selectedRoundForQuestions, setSelectedRoundForQuestions] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    maxRounds: 3
  });

  useEffect(() => {
    loadGameSessions();
  }, []);

  const loadGameSessions = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getGameSessions();
      setGameSessions(data);
    } catch (error) {
      console.error('Error loading game sessions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load game sessions.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      maxRounds: 3
    });
  };

  const handleCreateSession = async () => {
    try {
      await apiClient.createGameSession(formData);
      toast({
        title: 'Game session created',
        description: 'New game session has been created successfully.',
      });
      setIsCreateModalOpen(false);
      resetForm();
      await loadGameSessions();
      await refreshData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create game session.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateSession = async () => {
    if (!editingSession) return;

    try {
      await apiClient.updateGameSession(editingSession.id, formData);
      toast({
        title: 'Game session updated',
        description: 'Game session has been updated successfully.',
      });
      setEditingSession(null);
      resetForm();
      await loadGameSessions();
      await refreshData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update game session.',
        variant: 'destructive',
      });
    }
  };

  const handleStartSession = async (sessionId: string) => {
    try {
      await apiClient.startGameSession(sessionId);
      toast({
        title: 'Game session started',
        description: 'Game session has been started successfully.',
      });
      await loadGameSessions();
      await refreshData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to start game session.',
        variant: 'destructive',
      });
    }
  };

  const handleStopSession = async (sessionId: string) => {
    try {
      await apiClient.updateGameSession(sessionId, { isActive: false });
      toast({
        title: 'Game session stopped',
        description: 'Game session has been stopped.',
      });
      await loadGameSessions();
      await refreshData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to stop game session.',
        variant: 'destructive',
      });
    }
  };

  const openEditModal = (session: any) => {
    setEditingSession(session);
    setFormData({
      name: session.name,
      description: session.description || '',
      maxRounds: session.maxRounds
    });
  };

  const loadSessionDetails = async (sessionId: string) => {
    try {
      const data = await apiClient.getGameSession(sessionId);
      setSelectedSession(data);
    } catch (error) {
      console.error('Error loading session details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load session details.',
        variant: 'destructive',
      });
    }
  };

  const openQuestionManager = (round: any) => {
    setSelectedRoundForQuestions(round);
    setShowQuestionManager(true);
  };

  const closeQuestionManager = () => {
    setShowQuestionManager(false);
    setSelectedRoundForQuestions(null);
    // Refresh session details if a session is selected
    if (selectedSession) {
      loadSessionDetails(selectedSession.id);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <PlayCircle className="w-5 h-5 text-blue-600" />
              <span>Game Session Management</span>
            </CardTitle>
            
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Session
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Game Session</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="session-name">Session Name</Label>
                    <Input
                      id="session-name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter session name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="session-description">Description</Label>
                    <Textarea
                      id="session-description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter session description"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-rounds">Maximum Rounds</Label>
                    <Input
                      id="max-rounds"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.maxRounds}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxRounds: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateSession}>Create Session</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {gameSessions.map(session => (
                <Card key={session.id} className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{session.name}</h3>
                          <Badge variant={session.isActive ? "default" : "secondary"}>
                            {session.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {session.id === currentGameSession?.id && (
                            <Badge variant="outline" className="text-green-700 border-green-200">
                              Current
                            </Badge>
                          )}
                        </div>
                        {session.description && (
                          <p className="text-gray-600 mb-3">{session.description}</p>
                        )}
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Target className="w-4 h-4" />
                            <span>Max {session.maxRounds} rounds</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{session.teams?.length || 0} teams</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              Created {new Date(session.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {session.currentRound && (
                            <div className="flex items-center space-x-1">
                              <PlayCircle className="w-4 h-4" />
                              <span>Round {session.currentRound.roundNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadSessionDetails(session.id)}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(session)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {session.isActive ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStopSession(session.id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Pause className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStartSession(session.id)}
                            className="text-green-600 hover:bg-green-50"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {gameSessions.length === 0 && (
                <div className="text-center py-8">
                  <PlayCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No game sessions created yet</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Session Modal */}
      {editingSession && (
        <Dialog open={!!editingSession} onOpenChange={() => setEditingSession(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Game Session</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-session-name">Session Name</Label>
                <Input
                  id="edit-session-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-session-description">Description</Label>
                <Textarea
                  id="edit-session-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="edit-max-rounds">Maximum Rounds</Label>
                <Input
                  id="edit-max-rounds"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.maxRounds}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxRounds: parseInt(e.target.value) }))}
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setEditingSession(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateSession}>Update Session</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Session Details Modal */}
      {selectedSession && (
        <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Session Details: {selectedSession.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedSession.rounds?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Rounds Created</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedSession.teams?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Teams Participating</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {selectedSession.rounds?.reduce((total: number, round: any) => 
                        total + (round.questions?.length || 0), 0) || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Questions</div>
                  </CardContent>
                </Card>
              </div>

              {/* Rounds */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Rounds</h3>
                <div className="space-y-2">
                  {selectedSession.rounds?.map((round: any) => (
                    <div key={round.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Round {round.roundNumber}: {round.title}</span>
                          <Badge variant={round.isActive ? "default" : "secondary"}>
                            {round.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant="outline">{round.type}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{round.description}</p>
                        <div className="text-xs text-gray-500 mt-1">
                          {round.questions?.length || 0} questions
                          {round.timeLimit && ` • ${round.timeLimit} min limit`}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openQuestionManager(round)}
                          title="Manage Questions"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                        {!round.isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              try {
                                await apiClient.activateRound(round.id);
                                await loadSessionDetails(selectedSession.id);
                                await refreshData();
                                toast({
                                  title: 'Round activated',
                                  description: `Round ${round.roundNumber} is now active.`,
                                });
                              } catch (error: any) {
                                toast({
                                  title: 'Error',
                                  description: error.message || 'Failed to activate round.',
                                  variant: 'destructive',
                                });
                              }
                            }}
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )) || <p className="text-gray-500 text-center py-4">No rounds created</p>}
                </div>
              </div>

              {/* Teams */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Participating Teams</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedSession.teams?.map((team: any) => (
                    <Card key={team.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{team.name}</span>
                          <Badge variant="outline">{team.totalScore} pts</Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          {team.members?.length || 0} members
                        </div>
                      </CardContent>
                    </Card>
                  )) || <p className="text-gray-500 text-center py-4 col-span-2">No teams assigned</p>}
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setSelectedSession(null)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Question Management Modal */}
      {showQuestionManager && selectedRoundForQuestions && (
        <Dialog open={showQuestionManager} onOpenChange={closeQuestionManager}>
          <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Manage Questions - {selectedRoundForQuestions.title} (Round {selectedRoundForQuestions.roundNumber})
              </DialogTitle>
            </DialogHeader>
            <QuestionManagement 
              roundId={selectedRoundForQuestions.id} 
              onQuestionCreated={closeQuestionManager}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
