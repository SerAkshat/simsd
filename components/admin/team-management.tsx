
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Trophy, 
  Plus, 
  Edit, 
  Trash2, 
  Users,
  Crown,
  UserMinus,
  UserPlus as UserPlusIcon
} from 'lucide-react';
import { useGameContext } from '@/lib/contexts/game-context';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function TeamManagement() {
  const { teams, users, refreshData } = useGameContext();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    gameSessionId: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      gameSessionId: ''
    });
  };

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      ?.map(n => n[0])
      ?.join('')
      ?.toUpperCase() || 'U';
  };

  const handleCreateTeam = async () => {
    try {
      await apiClient.createTeam(formData);
      toast({
        title: 'Team created',
        description: 'New team has been created successfully.',
      });
      setIsCreateModalOpen(false);
      resetForm();
      await refreshData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create team.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateTeam = async () => {
    if (!editingTeam) return;

    try {
      await apiClient.updateTeam(editingTeam.id, formData);
      toast({
        title: 'Team updated',
        description: 'Team has been updated successfully.',
      });
      setEditingTeam(null);
      resetForm();
      await refreshData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update team.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team? All members will be removed.')) return;

    try {
      await apiClient.deleteTeam(teamId);
      toast({
        title: 'Team deleted',
        description: 'Team has been deleted successfully.',
      });
      await refreshData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete team.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveUserFromTeam = async (userId: string, teamId: string) => {
    if (!confirm('Are you sure you want to remove this user from the team?')) return;

    try {
      await apiClient.updateUser(userId, { teamId: null, isGroupLeader: false });
      toast({
        title: 'User removed',
        description: 'User has been removed from the team.',
      });
      await refreshData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove user from team.',
        variant: 'destructive',
      });
    }
  };

  const handleAddUserToTeam = async (userId: string, teamId: string) => {
    try {
      await apiClient.updateUser(userId, { teamId });
      toast({
        title: 'User added',
        description: 'User has been added to the team.',
      });
      await refreshData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add user to team.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleGroupLeader = async (userId: string, isCurrentLeader: boolean) => {
    try {
      await apiClient.updateUser(userId, { isGroupLeader: !isCurrentLeader });
      toast({
        title: 'Group leadership updated',
        description: `User ${!isCurrentLeader ? 'promoted to' : 'removed as'} group leader.`,
      });
      await refreshData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update group leadership.',
        variant: 'destructive',
      });
    }
  };

  const openEditModal = (team: any) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      gameSessionId: team.gameSessionId || ''
    });
  };

  const unassignedUsers = users.filter(user => !user.teamId && user.role === 'STUDENT');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-blue-600" />
              <span>Team Management</span>
            </CardTitle>
            
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Team
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Team</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="team-name">Team Name</Label>
                    <Input
                      id="team-name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter team name"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateTeam}>Create Team</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Teams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map(team => (
              <Card key={team.id} className="card-hover">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{team.name}</CardTitle>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(team)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTeam(team.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{team.members?.length || 0} members</span>
                    <Badge variant="outline">{team.totalScore} points</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {team.members?.map(member => (
                      <div key={member.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs">
                              {getInitials(member.name || '')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{member.name}</span>
                          {member.isGroupLeader && (
                            <Crown className="w-4 h-4 text-yellow-600" />
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleGroupLeader(member.id, member.isGroupLeader)}
                            title={member.isGroupLeader ? 'Remove as leader' : 'Make leader'}
                          >
                            <Crown className={`w-3 h-3 ${member.isGroupLeader ? 'text-yellow-600' : 'text-gray-400'}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveUserFromTeam(member.id, team.id)}
                            className="text-red-600 hover:bg-red-50"
                            title="Remove from team"
                          >
                            <UserMinus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {(team.members?.length || 0) === 0 && (
                      <p className="text-sm text-gray-500 text-center py-2">No members</p>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => setSelectedTeam(team)}
                    >
                      <UserPlusIcon className="w-4 h-4 mr-2" />
                      Manage Members
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {teams.length === 0 && (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No teams created yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Team Modal */}
      {editingTeam && (
        <Dialog open={!!editingTeam} onOpenChange={() => setEditingTeam(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Team</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-team-name">Team Name</Label>
                <Input
                  id="edit-team-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setEditingTeam(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateTeam}>Update Team</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Team Members Management Modal */}
      {selectedTeam && (
        <Dialog open={!!selectedTeam} onOpenChange={() => setSelectedTeam(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Manage Team: {selectedTeam.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Current Members */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Current Members ({selectedTeam.members?.length || 0})</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedTeam.members?.map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between p-2 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-sm">
                            {getInitials(member.name || '')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-gray-600">{member.email}</p>
                        </div>
                        {member.isGroupLeader && (
                          <Crown className="w-4 h-4 text-yellow-600" />
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveUserFromTeam(member.id, selectedTeam.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    </div>
                  )) || <p className="text-gray-500 text-center py-4">No members</p>}
                </div>
              </div>

              {/* Available Users */}
              {unassignedUsers.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Available Students ({unassignedUsers.length})</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {unassignedUsers.map(user => (
                      <div key={user.id} className="flex items-center justify-between p-2 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-sm">
                              {getInitials(user.name || '')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddUserToTeam(user.id, selectedTeam.id)}
                        >
                          <UserPlusIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={() => setSelectedTeam(null)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
