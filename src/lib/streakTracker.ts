import { supabase } from '@/integrations/supabase/client';

export interface ReadingActivity {
  id: string;
  user_id: string;
  activity_date: string;
  activity_type: 'reading' | 'review' | 'book_finished';
  book_title?: string;
  pages_read?: number;
  reading_minutes?: number;
  notes?: string;
  created_at: string;
}

export interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
  total_reading_days: number;
  streak_milestones: number[];
}

export class ReadingStreakTracker {
  /**
   * Log a reading activity for today
   */
  static async logReadingActivity(
    userId: string,
    activityType: 'reading' | 'review' | 'book_finished',
    data: {
      bookTitle?: string;
      pagesRead?: number;
      readingMinutes?: number;
      notes?: string;
    }
  ): Promise<{ success: boolean; streakData?: StreakData; error?: string }> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Check if user already logged activity today
      const { data: existingActivity } = await supabase
        .from('reading_activities')
        .select('id')
        .eq('user_id', userId)
        .eq('activity_date', today)
        .single();

      // If activity already exists for today, update it
      if (existingActivity) {
        const { error: updateError } = await supabase
          .from('reading_activities')
          .update({
            activity_type: activityType,
            book_title: data.bookTitle,
            pages_read: data.pagesRead,
            reading_minutes: data.readingMinutes,
            notes: data.notes,
          })
          .eq('id', existingActivity.id);

        if (updateError) {
          return { success: false, error: updateError.message };
        }
      } else {
        // Create new activity
        const { error: insertError } = await supabase
          .from('reading_activities')
          .insert({
            user_id: userId,
            activity_date: today,
            activity_type: activityType,
            book_title: data.bookTitle,
            pages_read: data.pagesRead,
            reading_minutes: data.readingMinutes,
            notes: data.notes,
          });

        if (insertError) {
          return { success: false, error: insertError.message };
        }
      }

      // Calculate and update streak
      const streakData = await this.calculateStreak(userId);
      await this.updateUserStreak(userId, streakData);

      // Award points for maintaining streak
      const pointsEarned = this.calculateStreakPoints(streakData.current_streak);
      if (pointsEarned > 0) {
        await this.awardStreakPoints(userId, pointsEarned);
      }

      return { success: true, streakData };
    } catch (error) {
      console.error('Failed to log reading activity:', error);
      return { success: false, error: 'Failed to log activity' };
    }
  }

  /**
   * Calculate current reading streak
   */
  static async calculateStreak(userId: string): Promise<StreakData> {
    try {
      // Get all reading activities for the user, ordered by date DESC
      const { data: activities } = await supabase
        .from('reading_activities')
        .select('activity_date')
        .eq('user_id', userId)
        .order('activity_date', { ascending: false });

      if (!activities || activities.length === 0) {
        return {
          current_streak: 0,
          longest_streak: 0,
          last_activity_date: '',
          total_reading_days: 0,
          streak_milestones: []
        };
      }

      const activityDates = [...new Set(activities.map(a => a.activity_date))];
      const today = new Date().toISOString().split('T')[0];
      
      // Calculate current streak
      let currentStreak = 0;
      let currentDate = new Date();
      
      for (let i = 0; i < activityDates.length; i++) {
        const activityDate = activityDates[i];
        const expectedDate = new Date(currentDate).toISOString().split('T')[0];
        
        if (activityDate === expectedDate) {
          currentStreak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }

      // Calculate longest streak
      let longestStreak = 0;
      let tempStreak = 0;
      let previousDate = new Date(activityDates[0]);
      
      for (let i = 0; i < activityDates.length; i++) {
        const currentActivityDate = new Date(activityDates[i]);
        
        if (i === 0) {
          tempStreak = 1;
        } else {
          const dayDifference = Math.abs(
            (previousDate.getTime() - currentActivityDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          
          if (dayDifference === 1) {
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }
        
        previousDate = currentActivityDate;
      }
      longestStreak = Math.max(longestStreak, tempStreak);

      // Calculate milestones reached
      const milestones = [7, 14, 30, 60, 100, 365];
      const streakMilestones = milestones.filter(milestone => longestStreak >= milestone);

      return {
        current_streak: currentStreak,
        longest_streak: longestStreak,
        last_activity_date: activityDates[0] || '',
        total_reading_days: activityDates.length,
        streak_milestones: streakMilestones
      };
    } catch (error) {
      console.error('Error calculating streak:', error);
      return {
        current_streak: 0,
        longest_streak: 0,
        last_activity_date: '',
        total_reading_days: 0,
        streak_milestones: []
      };
    }
  }

  /**
   * Update user's streak in profile
   */
  static async updateUserStreak(userId: string, streakData: StreakData): Promise<void> {
    try {
      await supabase
        .from('profiles')
        .update({
          reading_streak: streakData.current_streak,
          longest_streak: streakData.longest_streak,
          total_reading_days: streakData.total_reading_days
        })
        .eq('user_id', userId);
    } catch (error) {
      console.error('Failed to update user streak:', error);
    }
  }

  /**
   * Calculate points earned based on streak
   */
  static calculateStreakPoints(currentStreak: number): number {
    if (currentStreak === 0) return 0;
    
    // Base points for daily activity
    let points = 10;
    
    // Bonus points for streaks
    if (currentStreak >= 7) points += 5; // Weekly bonus
    if (currentStreak >= 30) points += 10; // Monthly bonus
    if (currentStreak >= 60) points += 15; // 2-month bonus
    if (currentStreak >= 100) points += 20; // 100-day bonus
    if (currentStreak >= 365) points += 50; // Year bonus
    
    // Milestone bonuses
    const milestones = [7, 14, 30, 60, 100, 365];
    if (milestones.includes(currentStreak)) {
      points += currentStreak; // Extra bonus on milestone days
    }
    
    return points;
  }

  /**
   * Award streak points to user
   */
  static async awardStreakPoints(userId: string, points: number): Promise<void> {
    try {
      // Update user's community points
      const { data: profile } = await supabase
        .from('profiles')
        .select('community_points')
        .eq('user_id', userId)
        .single();

      await supabase
        .from('profiles')
        .update({
          community_points: (profile?.community_points || 0) + points
        })
        .eq('user_id', userId);

      // Log the activity
      await supabase
        .from('community_activities')
        .insert({
          user_id: userId,
          activity_type: 'reading',
          points_earned: points,
          metadata: { 
            source: 'reading_streak',
            points_awarded: points 
          }
        });
    } catch (error) {
      console.error('Failed to award streak points:', error);
    }
  }

  /**
   * Get user's reading activities for calendar display
   */
  static async getUserActivities(userId: string, limit: number = 100): Promise<ReadingActivity[]> {
    try {
      const { data: activities } = await supabase
        .from('reading_activities')
        .select('*')
        .eq('user_id', userId)
        .order('activity_date', { ascending: false })
        .limit(limit);

      return activities || [];
    } catch (error) {
      console.error('Failed to get user activities:', error);
      return [];
    }
  }

  /**
   * Get streak statistics for dashboard
   */
  static async getStreakStats(userId: string): Promise<StreakData | null> {
    try {
      const streakData = await this.calculateStreak(userId);
      return streakData;
    } catch (error) {
      console.error('Failed to get streak stats:', error);
      return null;
    }
  }
}