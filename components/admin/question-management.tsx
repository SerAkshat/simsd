
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
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Download,
  FileText,
  Tag,
  Folder,
  Search,
  Filter
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { QuestionCategoryManager } from './question-category-manager';
import { CaseFileManager } from './case-file-manager';

interface Question {
  id: string;
  title: string;
  description: string;
  questionType: string;
  minReasoningWords: number;
  order: number;
  isActive: boolean;
  category?: { id: string; name: string; color: string; };
  caseFile?: { id: string; originalName: string; url: string; };
  options: Array<{
    id: string;
    text: string;
    points: number;
    isCorrect: boolean;
    order: number;
  }>;
  tags: Array<{
    tag: { id: string; name: string; color: string; };
  }>;
  _count: { submissions: number; };
}

interface QuestionManagerProps {
  roundId?: string;
  onQuestionCreated?: () => void;
}

export function QuestionManagement({ roundId, onQuestionCreated }: QuestionManagerProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [caseFiles, setCaseFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showCaseFileManager, setShowCaseFileManager] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    caseFileId: '',
    categoryId: '',
    tagIds: [] as string[],
    questionType: 'MULTIPLE_CHOICE',
    minReasoningWords: 15,
    order: 0,
    options: [
      { text: '', points: 0, isCorrect: false, order: 0 },
      { text: '', points: 0, isCorrect: false, order: 1 }
    ]
  });

  useEffect(() => {
    loadData();
  }, [roundId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [questionsData, categoriesData, tagsData, caseFilesData] = await Promise.all([
        roundId ? apiClient.getQuestions(roundId) : apiClient.getQuestions(),
        apiClient.getQuestionCategories(),
        apiClient.getQuestionTags(),
        apiClient.getCaseFiles()
      ]);
      
      setQuestions(questionsData);
      setCategories(categoriesData);
      setTags(tagsData);
      setCaseFiles(caseFilesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load questions data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      caseFileId: '',
      categoryId: '',
      tagIds: [],
      questionType: 'MULTIPLE_CHOICE',
      minReasoningWords: 15,
      order: 0,
      options: [
        { text: '', points: 0, isCorrect: false, order: 0 },
        { text: '', points: 0, isCorrect: false, order: 1 }
      ]
    });
  };

  const handleCreateQuestion = async () => {
    try {
      if (!roundId) {
        toast({
          title: 'Error',
          description: 'Round ID is required to create questions.',
          variant: 'destructive',
        });
        return;
      }

      const questionData = {
        ...formData,
        roundId,
        options: formData.options.filter(opt => opt.text.trim() !== '')
      };

      await apiClient.createQuestion(questionData);
      
      toast({
        title: 'Question created',
        description: 'New question has been created successfully.',
      });
      
      setIsCreateModalOpen(false);
      resetForm();
      await loadData();
      onQuestionCreated?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create question.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return;

    try {
      const questionData = {
        ...formData,
        options: formData.options.filter(opt => opt.text.trim() !== '')
      };

      await apiClient.updateQuestion(editingQuestion.id, questionData);
      
      toast({
        title: 'Question updated',
        description: 'Question has been updated successfully.',
      });
      
      setEditingQuestion(null);
      resetForm();
      await loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update question.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      await apiClient.updateQuestion(questionId, { isActive: false });
      toast({
        title: 'Question deleted',
        description: 'Question has been deleted successfully.',
      });
      await loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete question.',
        variant: 'destructive',
      });
    }
  };

  const openEditModal = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      title: question.title,
      description: question.description,
      caseFileId: question.caseFile?.id || '',
      categoryId: question.category?.id || '',
      tagIds: question.tags.map(t => t.tag.id),
      questionType: question.questionType,
      minReasoningWords: question.minReasoningWords,
      order: question.order,
      options: question.options.length > 0 ? question.options : [
        { text: '', points: 0, isCorrect: false, order: 0 },
        { text: '', points: 0, isCorrect: false, order: 1 }
      ]
    });
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, {
        text: '',
        points: 0,
        isCorrect: false,
        order: prev.options.length
      }]
    }));
  };

  const removeOption = (index: number) => {
    if (formData.options.length <= 2) return;
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const updateOption = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => 
        i === index ? { ...opt, [field]: value } : opt
      )
    }));
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           (selectedCategory === 'uncategorized' && !question.category) ||
                           question.category?.id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Question Management</span>
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCategoryManager(true)}
              >
                <Folder className="w-4 h-4 mr-2" />
                Categories
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCaseFileManager(true)}
              >
                <Upload className="w-4 h-4 mr-2" />
                Case Files
              </Button>
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="uncategorized">Uncategorized</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              filteredQuestions.map(question => (
                <Card key={question.id} className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{question.title}</h3>
                          {question.category && (
                            <Badge 
                              variant="outline" 
                              style={{ 
                                borderColor: question.category.color, 
                                color: question.category.color 
                              }}
                            >
                              {question.category.name}
                            </Badge>
                          )}
                          <Badge variant="secondary">{question.questionType}</Badge>
                          {!question.isActive && (
                            <Badge variant="destructive">Inactive</Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3 line-clamp-2">{question.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{question.options.length} options</span>
                          <span>{question._count.submissions} submissions</span>
                          {question.caseFile && (
                            <span className="flex items-center space-x-1">
                              <FileText className="w-4 h-4" />
                              <span>Case file attached</span>
                            </span>
                          )}
                          {question.tags.length > 0 && (
                            <div className="flex items-center space-x-1">
                              <Tag className="w-4 h-4" />
                              <span>{question.tags.length} tags</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(question)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {!loading && filteredQuestions.length === 0 && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No questions found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Question Modal */}
      <Dialog 
        open={isCreateModalOpen || !!editingQuestion} 
        onOpenChange={() => {
          setIsCreateModalOpen(false);
          setEditingQuestion(null);
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? 'Edit Question' : 'Create New Question'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Question Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter question title"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Question Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter question description"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="questionType">Question Type</Label>
                  <Select 
                    value={formData.questionType} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, questionType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                      <SelectItem value="MULTI_SELECT">Multi Select</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="minReasoningWords">Min Reasoning Words</Label>
                  <Input
                    id="minReasoningWords"
                    type="number"
                    min="0"
                    value={formData.minReasoningWords}
                    onChange={(e) => setFormData(prev => ({ ...prev, minReasoningWords: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.categoryId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No category</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="caseFile">Case File</Label>
                <Select 
                  value={formData.caseFileId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, caseFileId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select case file (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No case file</SelectItem>
                    {caseFiles.map(file => (
                      <SelectItem key={file.id} value={file.id}>
                        {file.originalName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Right Column - Options */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Answer Options</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Option
                  </Button>
                </div>
                
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {formData.options.map((option, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm">Option {index + 1}</Label>
                        {formData.options.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOption(index)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      <Input
                        value={option.text}
                        onChange={(e) => updateOption(index, 'text', e.target.value)}
                        placeholder={`Enter option ${index + 1} text`}
                        className="mb-2"
                      />
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <Label className="text-xs">Points</Label>
                          <Input
                            type="number"
                            value={option.points}
                            onChange={(e) => updateOption(index, 'points', parseInt(e.target.value) || 0)}
                            className="text-sm"
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={option.isCorrect}
                            onCheckedChange={(checked) => updateOption(index, 'isCorrect', checked)}
                          />
                          <Label className="text-xs">Correct</Label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCreateModalOpen(false);
                setEditingQuestion(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={editingQuestion ? handleUpdateQuestion : handleCreateQuestion}
            >
              {editingQuestion ? 'Update Question' : 'Create Question'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Manager Modal */}
      {showCategoryManager && (
        <QuestionCategoryManager
          isOpen={showCategoryManager}
          onClose={() => setShowCategoryManager(false)}
          onCategoriesChanged={loadData}
        />
      )}

      {/* Case File Manager Modal */}
      {showCaseFileManager && (
        <CaseFileManager
          isOpen={showCaseFileManager}
          onClose={() => setShowCaseFileManager(false)}
          onCaseFilesChanged={loadData}
        />
      )}
    </div>
  );
}
