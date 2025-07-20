
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
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Folder,
  Palette
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoriesChanged: () => void;
}

const colorOptions = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
  '#F97316', '#6366F1', '#14B8A6', '#F59E0B'
];

export function QuestionCategoryManager({ isOpen, onClose, onCategoriesChanged }: CategoryManagerProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  });

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getQuestionCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load categories.',
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
      color: '#3B82F6'
    });
  };

  const handleCreateCategory = async () => {
    try {
      await apiClient.createQuestionCategory(formData);
      toast({
        title: 'Category created',
        description: 'New category has been created successfully.',
      });
      setIsCreateModalOpen(false);
      resetForm();
      await loadCategories();
      onCategoriesChanged();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create category.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    try {
      await apiClient.updateQuestionCategory(editingCategory.id, formData);
      toast({
        title: 'Category updated',
        description: 'Category has been updated successfully.',
      });
      setEditingCategory(null);
      resetForm();
      await loadCategories();
      onCategoriesChanged();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update category.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? Questions using this category will become uncategorized.')) return;

    try {
      await apiClient.deleteQuestionCategory(categoryId);
      toast({
        title: 'Category deleted',
        description: 'Category has been deleted successfully.',
      });
      await loadCategories();
      onCategoriesChanged();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete category.',
        variant: 'destructive',
      });
    }
  };

  const openEditModal = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || '#3B82F6'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Folder className="w-5 h-5 text-blue-600" />
            <span>Question Categories</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Actions */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Organize your questions into categories for better management.
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>

          {/* Categories Grid */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(category => (
                <Card key={category.id} className="card-hover">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        <h3 className="font-medium text-gray-900">{category.name}</h3>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(category)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {category.description && (
                      <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        {category._count?.questions || 0} questions
                      </Badge>
                      <Badge variant={category.isActive ? "default" : "secondary"}>
                        {category.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {categories.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No categories created yet</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Create/Edit Category Modal */}
        <Dialog 
          open={isCreateModalOpen || !!editingCategory} 
          onOpenChange={() => {
            setIsCreateModalOpen(false);
            setEditingCategory(null);
            resetForm();
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="category-name">Category Name</Label>
                <Input
                  id="category-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter category name"
                />
              </div>
              
              <div>
                <Label htmlFor="category-description">Description (Optional)</Label>
                <Textarea
                  id="category-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter category description"
                  rows={3}
                />
              </div>

              <div>
                <Label className="flex items-center space-x-2 mb-3">
                  <Palette className="w-4 h-4" />
                  <span>Category Color</span>
                </Label>
                <div className="grid grid-cols-6 gap-2">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-lg border-2 transition-all ${
                        formData.color === color 
                          ? 'border-gray-400 scale-110' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingCategory(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}>
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
