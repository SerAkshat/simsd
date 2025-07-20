
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Download, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Question, Submission } from '@/lib/types';

interface QuestionModalProps {
  questionId: string;
  onClose: () => void;
  userRole: string;
  isGroupLeader: boolean;
}

export function QuestionModal({ 
  questionId, 
  onClose, 
  userRole,
  isGroupLeader 
}: QuestionModalProps) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [reasoning, setReasoning] = useState('');
  const [existingSubmission, setExistingSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadQuestion();
  }, [questionId]);

  const loadQuestion = async () => {
    try {
      setLoading(true);
      const [questionData, submissions] = await Promise.all([
        apiClient.getQuestion(questionId),
        apiClient.getSubmissions({ questionId })
      ]);
      
      setQuestion(questionData);
      
      // Check for existing submission
      const existingSub = submissions.find((sub: Submission) => 
        sub.questionId === questionId && 
        (sub.isGroupSubmission === isGroupSubmission())
      );
      
      if (existingSub) {
        setExistingSubmission(existingSub);
        setSelectedOptions(existingSub.selectedOptions);
        setReasoning(existingSub.reasoning);
      }
    } catch (error) {
      console.error('Error loading question:', error);
      toast({
        title: 'Error',
        description: 'Failed to load question details.',
        variant: 'destructive',
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const isGroupSubmission = () => {
    return question?.round?.type === 'GROUP' && isGroupLeader;
  };

  const canSubmit = () => {
    if (question?.round?.type === 'GROUP') {
      return isGroupLeader;
    }
    return true;
  };

  const handleOptionChange = (optionId: string, checked: boolean) => {
    if (question?.questionType === 'MULTIPLE_CHOICE') {
      setSelectedOptions(checked ? [optionId] : []);
    } else {
      setSelectedOptions(prev => 
        checked 
          ? [...prev, optionId]
          : prev.filter(id => id !== optionId)
      );
    }
  };

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const handleSubmit = async () => {
    if (!canSubmit()) {
      toast({
        title: 'Cannot submit',
        description: 'You do not have permission to submit for this round.',
        variant: 'destructive',
      });
      return;
    }

    if (selectedOptions.length === 0) {
      toast({
        title: 'Please select an option',
        description: 'You must select at least one option before submitting.',
        variant: 'destructive',
      });
      return;
    }

    if (!reasoning.trim()) {
      toast({
        title: 'Reasoning required',
        description: 'Please provide your reasoning for the selected answer.',
        variant: 'destructive',
      });
      return;
    }

    const wordCount = getWordCount(reasoning);
    if (wordCount < (question?.minReasoningWords || 15)) {
      toast({
        title: 'Reasoning too short',
        description: `Please provide at least ${question?.minReasoningWords} words of reasoning.`,
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      
      await apiClient.createSubmission({
        questionId,
        selectedOptions,
        reasoning,
        isGroupSubmission: isGroupSubmission(),
        isIndividualPhase: question?.round?.type === 'MIX' ? true : false
      });

      toast({
        title: 'Answer submitted!',
        description: existingSubmission ? 'Your answer has been updated.' : 'Your answer has been recorded.',
      });

      onClose();
    } catch (error: any) {
      toast({
        title: 'Submission failed',
        description: error.message || 'Failed to submit your answer.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!question) {
    return null;
  }

  const wordCount = getWordCount(reasoning);
  const isWordCountValid = wordCount >= question.minReasoningWords;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>Question: {question.title}</span>
            <Badge variant={question.round?.isActive ? "default" : "secondary"}>
              Round {question.round?.roundNumber}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Question Details */}
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Question Description</h3>
            <p className="text-gray-700 leading-relaxed">{question.description}</p>
          </div>

          {/* Case File */}
          {question.caseFileUrl && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">Case Study Material</span>
              </div>
              <p className="text-blue-700 text-sm mb-3">
                Review the case study material before answering this question.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="text-blue-700 border-blue-300 hover:bg-blue-100"
                onClick={() => window.open(question.caseFileUrl!, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Case Study
              </Button>
            </div>
          )}

          {/* Options */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">
              {question.questionType === 'MULTIPLE_CHOICE' ? 'Select one option:' : 'Select all that apply:'}
            </h3>
            
            {question.questionType === 'MULTIPLE_CHOICE' ? (
              <RadioGroup
                value={selectedOptions[0] || ''}
                onValueChange={(value) => handleOptionChange(value, true)}
                disabled={!canSubmit()}
              >
                <div className="space-y-3">
                  {question.options?.map((option) => (
                    <div key={option.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                      <Label htmlFor={option.id} className="flex-1 cursor-pointer leading-relaxed">
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            ) : (
              <div className="space-y-3">
                {question.options?.map((option) => (
                  <div key={option.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <Checkbox
                      id={option.id}
                      checked={selectedOptions.includes(option.id)}
                      onCheckedChange={(checked) => handleOptionChange(option.id, checked as boolean)}
                      disabled={!canSubmit()}
                      className="mt-1"
                    />
                    <Label htmlFor={option.id} className="flex-1 cursor-pointer leading-relaxed">
                      {option.text}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reasoning */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">Reasoning</h3>
              <div className="flex items-center space-x-2 text-sm">
                <span className={`${isWordCountValid ? 'text-green-600' : 'text-red-600'}`}>
                  {wordCount} / {question.minReasoningWords} words
                </span>
                {isWordCountValid ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
              </div>
            </div>
            <Textarea
              placeholder="Explain your reasoning for the selected answer(s)..."
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              rows={6}
              disabled={!canSubmit()}
              className="resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Provide detailed reasoning for your choice. Minimum {question.minReasoningWords} words required.
            </p>
          </div>

          {/* Submission Status */}
          {existingSubmission && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">
                  You have already submitted an answer
                </span>
              </div>
              <p className="text-green-700 text-sm mt-1">
                You can modify your answer and resubmit if needed.
              </p>
            </div>
          )}

          {/* Participation Message */}
          {!canSubmit() && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">
                  View Only
                </span>
              </div>
              <p className="text-yellow-700 text-sm mt-1">
                You can view this question but cannot submit answers. Only team leaders can submit for group rounds.
              </p>
            </div>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {canSubmit() && (
              <Button
                onClick={handleSubmit}
                disabled={submitting || selectedOptions.length === 0 || !isWordCountValid}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : existingSubmission ? (
                  'Update Answer'
                ) : (
                  'Submit Answer'
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
