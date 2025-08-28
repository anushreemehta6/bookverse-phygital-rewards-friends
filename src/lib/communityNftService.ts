import { supabase } from '@/integrations/supabase/client';

export interface NFTMintingCriteria {
  books_read?: number;
  reviews_count?: number;
  likes_received?: number;
  comments_received?: number;
  shares_received?: number;
  community_points?: number;
  reading_streak?: number;
  posts_count?: number;
  communities_joined?: number;
}

export interface UserEngagementStats {
  total_books_read: number;
  total_reviews: number;
  total_nfts_earned: number;
  reading_streak: number;
  community_points: number;
  total_likes_received: number;
  total_comments_received: number;
  total_shares_received: number;
}

export class CommunityNFTService {
  /**
   * Track user engagement activity and check for NFT rewards
   */
  static async trackEngagementActivity(
    userId: string,
    activityType: 'post' | 'review' | 'like' | 'comment' | 'share' | 'join_community',
    pointsEarned: number = 0,
    metadata?: any
  ): Promise<{ success: boolean; mintedNFTs: string[]; totalPoints: number; error?: string }> {
    try {
      // Try using the database function first
      const { data: mintedNFTs, error } = await supabase.rpc('add_community_points', {
        user_id: userId,
        points: pointsEarned
      });

      if (error) {
        console.error('Database function error:', error);
        // Fallback to manual tracking
        return await this.fallbackTrackActivity(userId, activityType, pointsEarned, metadata);
      }

      return {
        success: true,
        mintedNFTs: mintedNFTs || [],
        totalPoints: pointsEarned
      };

    } catch (error) {
      console.error('Failed to track engagement activity:', error);
      return {
        success: false,
        mintedNFTs: [],
        totalPoints: 0,
        error: 'Failed to track activity'
      };
    }
  }

  /**
   * Fallback method when database functions aren't available
   */
  private static async fallbackTrackActivity(
    userId: string,
    activityType: string,
    pointsEarned: number,
    metadata?: any
  ): Promise<{ success: boolean; mintedNFTs: string[]; totalPoints: number }> {
    try {
      // Get current user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError || !profile) {
        throw new Error('Failed to fetch user profile');
      }

      // Update user stats based on activity type
      const updates: any = {
        community_points: (profile.community_points || 0) + pointsEarned,
        updated_at: new Date().toISOString()
      };

      if (activityType === 'review' || activityType === 'post') {
        updates.total_reviews = (profile.total_reviews || 0) + 1;
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', userId);

      if (updateError) {
        throw new Error('Failed to update profile');
      }

      // Record activity
      await supabase
        .from('community_activities')
        .insert({
          user_id: userId,
          activity_type: activityType,
          points_earned: pointsEarned,
          metadata
        });

      // Check for new NFT eligibility
      const mintedNFTs = await this.checkAndMintEligibleNFTs(userId);

      return {
        success: true,
        mintedNFTs,
        totalPoints: pointsEarned
      };

    } catch (error) {
      console.error('Fallback tracking failed:', error);
      return {
        success: false,
        mintedNFTs: [],
        totalPoints: 0
      };
    }
  }

  /**
   * Check NFT eligibility and mint rewards
   */
  static async checkAndMintEligibleNFTs(userId: string): Promise<string[]> {
    try {
      // Get user stats
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!profile) return [];

      // Get active NFT rewards
      const { data: nftRewards } = await supabase
        .from('nft_rewards')
        .select('*')
        .eq('is_active', true);

      if (!nftRewards) return [];

      // Get earned NFTs
      const { data: earnedNFTs } = await supabase
        .from('user_nfts')
        .select('nft_reward_id')
        .eq('user_id', userId);

      const earnedNFTIds = new Set(earnedNFTs?.map(nft => nft.nft_reward_id) || []);
      const mintedNFTs: string[] = [];

      for (const reward of nftRewards) {
        if (earnedNFTIds.has(reward.id)) continue;

        const userStats: UserEngagementStats = {
          total_books_read: profile.total_books_read || 0,
          total_reviews: profile.total_reviews || 0,
          total_nfts_earned: profile.total_nfts_earned || 0,
          reading_streak: profile.reading_streak || 0,
          community_points: profile.community_points || 0,
          total_likes_received: profile.total_likes_received || 0,
          total_comments_received: profile.total_comments_received || 0,
          total_shares_received: profile.total_shares_received || 0
        };

        const criteria = reward.mint_criteria as NFTMintingCriteria;
        
        if (this.checkEligibility(criteria, userStats)) {
          const success = await this.mintNFT(userId, reward.id);
          if (success) {
            mintedNFTs.push(reward.name);
          }
        }
      }

      return mintedNFTs;
    } catch (error) {
      console.error('Failed to check NFT eligibility:', error);
      return [];
    }
  }

  /**
   * Check if user meets criteria for NFT
   */
  private static checkEligibility(criteria: NFTMintingCriteria, userStats: UserEngagementStats): boolean {
    return Object.entries(criteria).every(([key, value]) => {
      const userValue = userStats[key as keyof UserEngagementStats];
      return userValue !== undefined && userValue >= value;
    });
  }

  /**
   * Mint an NFT for a user
   */
  private static async mintNFT(userId: string, nftRewardId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_nfts')
        .insert({
          user_id: userId,
          nft_reward_id: nftRewardId,
          token_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        });

      if (error) {
        console.error('Failed to mint NFT:', error);
        return false;
      }

      // Update NFT count
      await supabase.rpc('increment_user_nfts', { user_id: userId });
      
      return true;
    } catch (error) {
      console.error('NFT minting error:', error);
      return false;
    }
  }

  /**
   * Join a community and award points
   */
  static async joinCommunity(userId: string, communityId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('join_community', {
        user_id: userId,
        community_id: communityId
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data === false) {
        return { success: false, error: 'Already a member of this community' };
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to join community:', error);
      return { success: false, error: 'Failed to join community' };
    }
  }

  /**
   * Get user engagement statistics
   */
  static async getUserEngagementStats(userId: string) {
    try {
      const { data, error } = await supabase.rpc('get_user_engagement_stats', {
        user_id: userId
      });

      if (error) {
        throw error;
      }

      return data?.[0] || {
        total_posts: 0,
        total_likes_given: 0,
        total_comments_given: 0,
        communities_joined: 0,
        engagement_score: 0
      };
    } catch (error) {
      console.error('Failed to get engagement stats:', error);
      return {
        total_posts: 0,
        total_likes_given: 0,
        total_comments_given: 0,
        communities_joined: 0,
        engagement_score: 0
      };
    }
  }
}