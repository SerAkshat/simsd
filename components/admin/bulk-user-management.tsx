
'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Upload, 
  Download, 
  Users, 
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface BulkUserManagementProps {
  onUsersChanged: () => void;
}

export function BulkUserManagement({ onUsersChanged }: BulkUserManagementProps) {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [importOptions, setImportOptions] = useState({
    updateExisting: false,
    sendWelcomeEmail: false
  });

  const [exportOptions, setExportOptions] = useState({
    format: 'csv' as 'csv' | 'json',
    includeInactive: false
  });

  const [csvData, setCsvData] = useState('');

  const handleFileImport = async (file: File) => {
    const text = await file.text();
    
    if (file.name.endsWith('.csv')) {
      // Parse CSV
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        toast({
          title: 'Error',
          description: 'CSV file must have at least a header row and one data row.',
          variant: 'destructive',
        });
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const users = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const user: any = {};
        headers.forEach((header, index) => {
          user[header] = values[index] || '';
        });
        return user;
      });

      await performImport(users);
    } else if (file.name.endsWith('.json')) {
      // Parse JSON
      try {
        const jsonData = JSON.parse(text);
        const users = Array.isArray(jsonData) ? jsonData : jsonData.users || jsonData.data || [];
        await performImport(users);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Invalid JSON format.',
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'Error',
        description: 'Please upload a CSV or JSON file.',
        variant: 'destructive',
      });
    }
  };

  const handleCsvImport = async () => {
    if (!csvData.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter CSV data.',
        variant: 'destructive',
      });
      return;
    }

    const lines = csvData.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      toast({
        title: 'Error',
        description: 'CSV data must have at least a header row and one data row.',
        variant: 'destructive',
      });
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const users = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const user: any = {};
      headers.forEach((header, index) => {
        user[header] = values[index] || '';
      });
      return user;
    });

    await performImport(users);
  };

  const performImport = async (users: any[]) => {
    try {
      setImporting(true);
      const result = await apiClient.importUsers(users, importOptions);
      setImportResult(result);
      
      toast({
        title: 'Import completed',
        description: `Processed ${result.processed} users, ${result.failed} failed.`,
      });
      
      onUsersChanged();
    } catch (error: any) {
      toast({
        title: 'Import failed',
        description: error.message || 'Failed to import users.',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      
      if (exportOptions.format === 'csv') {
        const blob = await apiClient.exportUsers('csv', exportOptions.includeInactive);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        const result = await apiClient.exportUsers('json', exportOptions.includeInactive);
        const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
      
      toast({
        title: 'Export completed',
        description: 'Users have been exported successfully.',
      });
      
      setIsExportModalOpen(false);
    } catch (error: any) {
      toast({
        title: 'Export failed',
        description: error.message || 'Failed to export users.',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  const resetImport = () => {
    setImportResult(null);
    setCsvData('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const sampleCsvData = `name,email,password,role,teamName
John Doe,john@example.com,password123,STUDENT,Team Alpha
Jane Smith,jane@example.com,password123,STUDENT,Team Beta
Bob Johnson,bob@example.com,password123,ADMIN,`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Import Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5 text-blue-600" />
            <span>Import Users</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Import multiple users from CSV or JSON files, or paste CSV data directly.
          </p>
          
          <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" onClick={resetImport}>
                <Upload className="w-4 h-4 mr-2" />
                Import Users
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Import Users</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {!importResult ? (
                  <>
                    {/* Import Options */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-900">Import Options</h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="updateExisting"
                            checked={importOptions.updateExisting}
                            onCheckedChange={(checked) => 
                              setImportOptions(prev => ({ ...prev, updateExisting: checked }))
                            }
                          />
                          <Label htmlFor="updateExisting">Update existing users</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="sendWelcomeEmail"
                            checked={importOptions.sendWelcomeEmail}
                            onCheckedChange={(checked) => 
                              setImportOptions(prev => ({ ...prev, sendWelcomeEmail: checked }))
                            }
                          />
                          <Label htmlFor="sendWelcomeEmail">Send welcome emails (future feature)</Label>
                        </div>
                      </div>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-900">Upload File</h3>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".csv,.json"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileImport(file);
                            }
                          }}
                          className="hidden"
                        />
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">
                          Drag and drop your CSV or JSON file here, or
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={importing}
                        >
                          Choose File
                        </Button>
                        <p className="text-xs text-gray-500 mt-2">
                          Supported formats: CSV, JSON
                        </p>
                      </div>
                    </div>

                    {/* Manual CSV Entry */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-900">Or Paste CSV Data</h3>
                      <div>
                        <Label htmlFor="csvData">CSV Data</Label>
                        <Textarea
                          id="csvData"
                          value={csvData}
                          onChange={(e) => setCsvData(e.target.value)}
                          placeholder={sampleCsvData}
                          rows={8}
                          className="font-mono text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Required columns: name, email, password. Optional: role, teamName
                        </p>
                      </div>
                      
                      <Button
                        onClick={handleCsvImport}
                        disabled={!csvData.trim() || importing}
                        className="w-full"
                      >
                        {importing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Importing...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Import CSV Data
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Sample Data */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Sample CSV Format:</h4>
                      <pre className="text-xs text-gray-600 overflow-x-auto">
                        {sampleCsvData}
                      </pre>
                    </div>
                  </>
                ) : (
                  /* Import Results */
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <h3 className="font-medium text-gray-900">Import Completed</h3>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{importResult.processed}</p>
                        <p className="text-sm text-gray-600">Successful</p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">{importResult.failed}</p>
                        <p className="text-sm text-gray-600">Failed</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">
                          {importResult.processed + importResult.failed}
                        </p>
                        <p className="text-sm text-gray-600">Total</p>
                      </div>
                    </div>

                    {importResult.errors && importResult.errors.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">Errors:</h4>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                          {importResult.errors.map((error: any, index: number) => (
                            <div key={index} className="flex items-center space-x-2 text-sm">
                              <XCircle className="w-4 h-4 text-red-500" />
                              <span className="text-gray-600">{error.email}:</span>
                              <span className="text-red-600">{error.error}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button variant="outline" onClick={resetImport}>
                        Import More
                      </Button>
                      <Button onClick={() => setIsImportModalOpen(false)}>
                        Done
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Export Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-green-600" />
            <span>Export Users</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Export user data in CSV or JSON format for backup or analysis.
          </p>
          
          <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Export Users
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Export Users</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Export Format</Label>
                  <div className="flex space-x-4 mt-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="format"
                        value="csv"
                        checked={exportOptions.format === 'csv'}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, format: 'csv' }))}
                      />
                      <span>CSV</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="format"
                        value="json"
                        checked={exportOptions.format === 'json'}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, format: 'json' }))}
                      />
                      <span>JSON</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="includeInactive"
                    checked={exportOptions.includeInactive}
                    onCheckedChange={(checked) => 
                      setExportOptions(prev => ({ ...prev, includeInactive: checked }))
                    }
                  />
                  <Label htmlFor="includeInactive">Include inactive users</Label>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsExportModalOpen(false)}
                    disabled={exporting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleExport}
                    disabled={exporting}
                  >
                    {exporting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
