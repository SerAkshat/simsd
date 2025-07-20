
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Search,
  Crown,
  Shield,
  User
} from 'lucide-react';
import { useGameContext } from '@/lib/contexts/game-context';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { BulkUserManagement } from './bulk-user-management';

export function UserManagement() {
  const { users, teams, refreshData } = useGameContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const { toast } = useToast();

  // Create/Edit form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
    teamId: '',
    isGroupLeader: false,
    isActive: true
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'STUDENT',
      teamId: '',
      isGroupLeader: false,
      isActive: true
    });
  };

  const handleCreateUser = async () => {
    try {
      await apiClient.createUser(formData);
      toast({
        title: 'User created',
        description: 'New user has been created successfully.',
      });
      setIsCreateModalOpen(false);
      resetForm();
      await refreshData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create user.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      const updateData: any = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }
      
      await apiClient.updateUser(editingUser.id, updateData);
      toast({
        title: 'User updated',
        description: 'User has been updated successfully.',
      });
      setEditingUser(null);
      resetForm();
      await refreshData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;

    try {
      await apiClient.deleteUser(userId);
      toast({
        title: 'User deactivated',
        description: 'User has been deactivated successfully.',
      });
      await refreshData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to deactivate user.',
        variant: 'destructive',
      });
    }
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email,
      password: '',
      role: user.role,
      teamId: user.teamId || '',
      isGroupLeader: user.isGroupLeader,
      isActive: user.isActive
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>User Management</span>
            </CardTitle>
            
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Enter password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STUDENT">Student</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="team">Team</Label>
                    <Select value={formData.teamId} onValueChange={(value) => setFormData(prev => ({ ...prev, teamId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No team</SelectItem>
                        {teams.map(team => (
                          <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isGroupLeader"
                      checked={formData.isGroupLeader}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isGroupLeader: checked }))}
                    />
                    <Label htmlFor="isGroupLeader">Group Leader</Label>
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateUser}>Create User</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="STUDENT">Student</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="space-y-3">
            {filteredUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    {user.role === 'ADMIN' ? (
                      <Shield className="w-5 h-5 text-orange-600" />
                    ) : (
                      <User className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      {user.isGroupLeader && (
                        <Crown className="w-4 h-4 text-yellow-600" />
                      )}
                      {!user.isActive && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={user.role === 'ADMIN' ? 'default' : 'outline'}>
                        {user.role}
                      </Badge>
                      {user.team && (
                        <Badge variant="outline">{user.team.name}</Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(user)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No users found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-password">Password (leave blank to keep current)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STUDENT">Student</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-team">Team</Label>
                <Select value={formData.teamId} onValueChange={(value) => setFormData(prev => ({ ...prev, teamId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No team</SelectItem>
                    {teams.map(team => (
                      <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isGroupLeader"
                  checked={formData.isGroupLeader}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isGroupLeader: checked }))}
                />
                <Label htmlFor="edit-isGroupLeader">Group Leader</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="edit-isActive">Active</Label>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setEditingUser(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateUser}>Update User</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Bulk User Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span>Bulk Operations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BulkUserManagement onUsersChanged={refreshData} />
        </CardContent>
      </Card>
    </div>
  );
}
