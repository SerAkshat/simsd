
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  PlayCircle, 
  Users, 
  User, 
  ArrowRight,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Round } from '@/lib/types';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CurrentRoundCardProps {
  round: Round;
  onQuestionSelect: (questionId: string) => void;
  userRole: string;
  isGroupLeader: boolean;
}

export function CurrentRoundCard({ 
  round, 
  onQuestionSelect, 
  userRole,
  isGroupLeader 
}: CurrentRoundCardProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadQuestions();
    
    // Set up timer if round has time limit
    if (round.timeLimit && round.startedAt) {
      const startTime = new Date(round.startedAt).getTime();
      const endTime = startTime + (round.timeLimit * 60 * 1000);
      
      const updateTimer = () => {
        const now = Date.now();
        const remaining = Math.max(0, endTime - now);
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          toast({
            title: 'Time\'s up!',
            description: 'The current round has ended.',
            variant: 'destructive',
          });
        }
      };
      
      updateTimer();
      const timer = setInterval(updateTimer, 1000);
      
      return () => clearInterval(timer);
    }
  }, [round]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getQuestions(round.id);
      setQuestions(data);
    } catch (error) {
      console.error('Error loading questions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load questions.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getRoundTypeIcon = (type: string) => {
    switch (type) {
      case 'INDIVIDUAL':
        return <User className="w-4 h-4" />;
      case 'GROUP':
        return <Users className="w-4 h-4" />;
      case 'MIX':
        return <ArrowRight className="w-4 h-4" />;
      default:
        return <PlayCircle className="w-4 h-4" />;
    }
  };

  const getRoundTypeDescription = (type: string) => {
    switch (type) {
      case 'INDIVIDUAL':
        return 'Individual decisions - work independently';
      case 'GROUP':
        return 'Group decisions - team leader submits for the team';
      case 'MIX':
        return 'Mixed round - individual phase then group discussion';
      default:
        return 'Unknown round type';
    }
  };

  const canParticipate = () => {
    if (round.type === 'GROUP') {
      return isGroupLeader;
    }
    return true;
  };

  const getParticipationMessage = () => {
    if (round.type === 'GROUP' && !isGroupLeader) {
      return 'Only team leaders can submit answers for group rounds. You can view questions and participate in discussions.';
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              {getRoundTypeIcon(round.type)}
              <span>Round {round.roundNumber}: {round.title}</span>
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {getRoundTypeDescription(round.type)}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={round.isActive ? "default" : "secondary"}>
              {round.isActive ? "Active" : "Inactive"}
            </Badge>
            {timeRemaining !== null && (
              <Badge 
                variant="outline" 
                className={cn(
                  timeRemaining < 5 * 60 * 1000 ? 'border-red-200 text-red-700' : 
                  timeRemaining < 15 * 60 * 1000 ? 'border-yellow-200 text-yellow-700' :
                  'border-green-200 text-green-700'
                )}
              >
                <Clock className="w-3 h-3 mr-1" />
                {formatTime(timeRemaining)}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {round.description && (
          <p className="text-gray-600 mb-4">{round.description}</p>
        )}

        {!canParticipate() && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                {getParticipationMessage()}
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-6">
            <CheckCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No questions available yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    Question {index + 1}: {question.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {question.description}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>Type: {question.questionType.replace('_', ' ')}</span>
                    <span>Min. reasoning: {question.minReasoningWords} words</span>
                    {question.caseFileUrl && (
                      <span className="text-blue-600">Case study available</span>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => onQuestionSelect(question.id)}
                  variant={canParticipate() ? "default" : "outline"}
                  size="sm"
                >
                  {canParticipate() ? 'Answer' : 'View'}
                </Button>
              </div>
            ))}
          </div>
        )}

        {timeRemaining !== null && round.timeLimit && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Time Remaining</span>
              <span>{formatTime(timeRemaining)}</span>
            </div>
            <Progress 
              value={(1 - (timeRemaining / (round.timeLimit * 60 * 1000))) * 100} 
              className="h-2"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
