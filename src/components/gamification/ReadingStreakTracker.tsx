import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Flame, 
  Calendar, 
  Book, 
  Trophy, 
  Plus, 
  Target,
  Clock,
  BookOpen,
  Award,
  TrendingUp
} from 'lucide-react';
import { ReadingStreakTracker, StreakData } from '@/lib/streakTracker';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ReadingStreakProps {
  onStreakUpdate?: (streakData: StreakData) => void;
}

export const ReadingStreakComponent: React.FC<ReadingStreakProps> = ({ onStreakUpdate }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [streakData, setStreakData] = useState<StreakData>({
    current_streak: 0,
    longest_streak: 0,
    last_activity_date: '',
    total_reading_days: 0,
    streak_milestones: []
  });
  
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activityForm, setActivityForm] = useState({
    activityType: 'reading' as 'reading' | 'review' | 'book_finished',
    bookTitle: '',
    pagesRead: '',
    readingMinutes: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchStreakData();
    }
  }, [user?.id]);

  const fetchStreakData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const data = await ReadingStreakTracker.getStreakStats(user.id);
      if (data) {
        setStreakData(data);
        if (onStreakUpdate) {
          onStreakUpdate(data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch streak data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setSubmitting(true);
    try {
      const result = await ReadingStreakTracker.logReadingActivity(
        user.id,
        activityForm.activityType,
        {
          bookTitle: activityForm.bookTitle || undefined,
          pagesRead: activityForm.pagesRead ? parseInt(activityForm.pagesRead) : undefined,
          readingMinutes: activityForm.readingMinutes ? parseInt(activityForm.readingMinutes) : undefined,
          notes: activityForm.notes || undefined,
        }
      );

      if (result.success) {
        toast({
          title: "Reading Activity Logged! 🎉",
          description: `Great job! Your current streak is ${result.streakData?.current_streak} days.`,
        });
        
        if (result.streakData) {
          setStreakData(result.streakData);
          if (onStreakUpdate) {
            onStreakUpdate(result.streakData);
          }
        }
        
        // Reset form and close dialog
        setActivityForm({
          activityType: 'reading',
          bookTitle: '',
          pagesRead: '',
          readingMinutes: '',
          notes: ''
        });
        setIsDialogOpen(false);
      } else {
        toast({
          title: "Failed to Log Activity",
          description: result.error || "Please try again",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log reading activity",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStreakColor = (streak: number) => {
    if (streak === 0) return 'text-gray-400';
    if (streak < 7) return 'text-orange-500';
    if (streak < 30) return 'text-yellow-500';
    if (streak < 100) return 'text-green-500';
    return 'text-purple-500';
  };

  const getStreakDescription = (streak: number) => {
    if (streak === 0) return 'Start your reading journey!';
    if (streak < 7) return 'Building momentum';
    if (streak < 30) return 'Great consistency!';
    if (streak < 100) return 'Reading champion!';
    return 'Reading legend!';
  };

  const getNextMilestone = (currentStreak: number) => {
    const milestones = [7, 14, 30, 60, 100, 365];
    return milestones.find(milestone => milestone > currentStreak) || null;
  };

  const nextMilestone = getNextMilestone(streakData.current_streak);
  const progressToNext = nextMilestone ? (streakData.current_streak / nextMilestone) * 100 : 100;

  if (loading) {
    return (
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Reading Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className={`h-5 w-5 ${getStreakColor(streakData.current_streak)}`} />
          Reading Streak
        </CardTitle>
        <CardDescription>
          Keep your daily reading habit alive and earn points!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Streak Display */}
        <div className="text-center py-4">
          <div className={`text-6xl font-bold ${getStreakColor(streakData.current_streak)}`}>
            {streakData.current_streak}
          </div>
          <p className="text-lg font-medium text-muted-foreground">
            {streakData.current_streak === 1 ? 'Day' : 'Days'}
          </p>
          <p className="text-sm text-muted-foreground">
            {getStreakDescription(streakData.current_streak)}
          </p>
        </div>

        {/* Progress to Next Milestone */}
        {nextMilestone && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Next milestone: {nextMilestone} days</span>
              <span>{nextMilestone - streakData.current_streak} days to go</span>
            </div>
            <Progress value={progressToNext} className="h-3" />
          </div>
        )}

        {/* Streak Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <Trophy className="w-5 h-5 mx-auto mb-2 text-yellow-500" />
            <div className="font-semibold">{streakData.longest_streak}</div>
            <div className="text-xs text-muted-foreground">Longest Streak</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <Calendar className="w-5 h-5 mx-auto mb-2 text-blue-500" />
            <div className="font-semibold">{streakData.total_reading_days}</div>
            <div className="text-xs text-muted-foreground">Total Days</div>
          </div>
        </div>

        {/* Milestones Achieved */}
        {streakData.streak_milestones.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Milestones Achieved:</p>
            <div className="flex flex-wrap gap-2">
              {streakData.streak_milestones.map(milestone => (
                <Badge key={milestone} variant="secondary" className="text-xs">
                  <Award className="w-3 h-3 mr-1" />
                  {milestone} days
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-gradient-primary">
                <Plus className="w-4 h-4 mr-2" />
                Log Today's Reading
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log Reading Activity</DialogTitle>
                <DialogDescription>
                  Record your reading progress to maintain your streak and earn points.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleLogActivity} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="activity-type">Activity Type</Label>
                  <Select 
                    value={activityForm.activityType} 
                    onValueChange={(value: 'reading' | 'review' | 'book_finished') => 
                      setActivityForm(prev => ({ ...prev, activityType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reading">Daily Reading</SelectItem>
                      <SelectItem value="review">Wrote a Review</SelectItem>
                      <SelectItem value="book_finished">Finished a Book</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="book-title">Book Title (Optional)</Label>
                  <Input
                    id="book-title"
                    value={activityForm.bookTitle}
                    onChange={(e) => setActivityForm(prev => ({ ...prev, bookTitle: e.target.value }))}
                    placeholder="What are you reading?"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pages-read">Pages Read</Label>
                    <Input
                      id="pages-read"
                      type="number"
                      value={activityForm.pagesRead}
                      onChange={(e) => setActivityForm(prev => ({ ...prev, pagesRead: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reading-minutes">Minutes Read</Label>
                    <Input
                      id="reading-minutes"
                      type="number"
                      value={activityForm.readingMinutes}
                      onChange={(e) => setActivityForm(prev => ({ ...prev, readingMinutes: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={activityForm.notes}
                    onChange={(e) => setActivityForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any thoughts about today's reading?"
                    rows={3}
                  />
                </div>

                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? 'Logging...' : 'Log Activity'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {streakData.last_activity_date !== new Date().toISOString().split('T')[0] && (
            <Alert>
              <TrendingUp className="w-4 h-4" />
              <AlertDescription>
                Keep your streak alive! Log today's reading activity to continue your {streakData.current_streak}-day streak.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};