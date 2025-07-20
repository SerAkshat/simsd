
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
  Upload, 
  FileText, 
  Trash2, 
  Download,
  Eye,
  Edit
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface CaseFileManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onCaseFilesChanged: () => void;
}

export function CaseFileManager({ isOpen, onClose, onCaseFilesChanged }: CaseFileManagerProps) {
  const [caseFiles, setCaseFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<any>(null);
  const { toast } = useToast();

  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    description: ''
  });

  const [editForm, setEditForm] = useState({
    description: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadCaseFiles();
    }
  }, [isOpen]);

  const loadCaseFiles = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getCaseFiles();
      setCaseFiles(data);
    } catch (error) {
      console.error('Error loading case files:', error);
      toast({
        title: 'Error',
        description: 'Failed to load case files.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadForm.file) {
      toast({
        title: 'Error',
        description: 'Please select a file to upload.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploading(true);
      const result = await apiClient.uploadCaseFile(uploadForm.file, uploadForm.description);
      
      toast({
        title: 'File uploaded',
        description: 'Case file has been uploaded successfully.',
      });
      
      setIsUploadModalOpen(false);
      setUploadForm({ file: null, description: '' });
      await loadCaseFiles();
      onCaseFilesChanged();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload file.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateFile = async () => {
    if (!editingFile) return;

    try {
      await apiClient.updateCaseFile(editingFile.id, {
        description: editForm.description
      });
      
      toast({
        title: 'File updated',
        description: 'Case file has been updated successfully.',
      });
      
      setEditingFile(null);
      setEditForm({ description: '' });
      await loadCaseFiles();
      onCaseFilesChanged();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update file.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this case file? This action cannot be undone.')) return;

    try {
      await apiClient.deleteCaseFile(fileId);
      toast({
        title: 'File deleted',
        description: 'Case file has been deleted successfully.',
      });
      await loadCaseFiles();
      onCaseFilesChanged();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete file.',
        variant: 'destructive',
      });
    }
  };

  const openEditModal = (file: any) => {
    setEditingFile(file);
    setEditForm({
      description: file.description || ''
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('text')) return '📃';
    return '📁';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Case File Management</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Actions */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Upload and manage case files that can be attached to questions.
            </p>
            <Button onClick={() => setIsUploadModalOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </Button>
          </div>

          {/* Files Grid */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {caseFiles.map(file => (
                <Card key={file.id} className="card-hover">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <span className="text-lg">{getFileIcon(file.mimeType)}</span>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-gray-900 truncate" title={file.originalName}>
                            {file.originalName}
                          </h3>
                          <p className="text-xs text-gray-500">{formatFileSize(file.filesize)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(file.url, '_blank')}
                          title="View file"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(file)}
                          title="Edit file"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteFile(file.id)}
                          className="text-red-600 hover:bg-red-50"
                          title="Delete file"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {file.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{file.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        {file._count?.questions || 0} questions
                      </Badge>
                      <div className="text-xs text-gray-500">
                        {new Date(file.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {caseFiles.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No case files uploaded yet</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Upload File Modal */}
        <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Case File</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="file-upload">Select File</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.html,.png,.jpg,.jpeg,.gif"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setUploadForm(prev => ({ ...prev, file }));
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: PDF, DOC, DOCX, TXT, HTML, PNG, JPG, GIF
                </p>
              </div>
              
              <div>
                <Label htmlFor="file-description">Description (Optional)</Label>
                <Textarea
                  id="file-description"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter file description"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setUploadForm({ file: null, description: '' });
                  }}
                  disabled={uploading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleFileUpload}
                  disabled={!uploadForm.file || uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload File'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit File Modal */}
        <Dialog open={!!editingFile} onOpenChange={() => setEditingFile(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Case File</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>File Name</Label>
                <Input value={editingFile?.originalName || ''} disabled />
              </div>
              
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter file description"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditingFile(null);
                    setEditForm({ description: '' });
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateFile}>
                  Update File
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
