import { supabase } from '@/integrations/supabase/client';

export interface NFTMintingCriteria {
  books_read?: number;
  reviews_count?: number;
  avg_likes?: number;
  unique_genres?: number;
  community_points?: number;
  reading_streak?: number;
}

export interface UserStats {
  total_books_read: number;
  total_reviews: number;
  total_nfts_earned: number;
  reading_streak: number;
  community_points: number;
  avg_review_likes?: number;
  unique_genres_read?: number;
}

export class NFTMintingService {
  /**
   * Check if user meets criteria for a specific NFT reward
   */
  static checkEligibility(criteria: NFTMintingCriteria, userStats: UserStats): boolean {
    if (criteria.books_read && userStats.total_books_read < criteria.books_read) {
      return false;
    }
    
    if (criteria.reviews_count && userStats.total_reviews < criteria.reviews_count) {
      return false;
    }
    
    if (criteria.avg_likes && (!userStats.avg_review_likes || userStats.avg_review_likes < criteria.avg_likes)) {
      return false;
    }
    
    if (criteria.unique_genres && (!userStats.unique_genres_read || userStats.unique_genres_read < criteria.unique_genres)) {
      return false;
    }
    
    if (criteria.community_points && userStats.community_points < criteria.community_points) {
      return false;
    }
    
    if (criteria.reading_streak && userStats.reading_streak < criteria.reading_streak) {
      return false;
    }
    
    return true;
  }

  /**
   * Mint an NFT for a user when they meet the criteria
   */
  static async mintNFT(userId: string, nftRewardId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if user already has this NFT
      const { data: existingNFT } = await supabase
        .from('user_nfts')
        .select('id')
        .eq('user_id', userId)
        .eq('nft_reward_id', nftRewardId)
        .single();

      if (existingNFT) {
        return { success: false, error: 'NFT already earned' };
      }

      // Mint the NFT
      const { error: mintError } = await supabase
        .from('user_nfts')
        .insert({
          user_id: userId,
          nft_reward_id: nftRewardId,
          token_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Simple token ID generation
        });

      if (mintError) {
        return { success: false, error: mintError.message };
      }

      // Update user's total NFTs count using the database function
      const { error: updateError } = await supabase.rpc('increment_user_nfts', {
        user_id: userId
      });

      if (updateError) {
        console.error('Failed to update NFT count:', updateError);
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to mint NFT' };
    }
  }

  /**
   * Check all available NFT rewards and mint eligible ones
   */
  static async checkAndMintEligibleNFTs(userId: string): Promise<string[]> {
    try {
      // Get user stats
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!profile) {
        return [];
      }

      // Get all active NFT rewards
      const { data: nftRewards } = await supabase
        .from('nft_rewards')
        .select('*')
        .eq('is_active', true);

      if (!nftRewards) {
        return [];
      }

      // Get user's already earned NFTs
      const { data: earnedNFTs } = await supabase
        .from('user_nfts')
        .select('nft_reward_id')
        .eq('user_id', userId);

      const earnedNFTIds = new Set(earnedNFTs?.map(nft => nft.nft_reward_id) || []);

      const mintedNFTs: string[] = [];

      // Check each NFT reward
      for (const reward of nftRewards) {
        // Skip if already earned
        if (earnedNFTIds.has(reward.id)) {
          continue;
        }

        // Check eligibility
        const userStats: UserStats = {
          total_books_read: profile.total_books_read || 0,
          total_reviews: profile.total_reviews || 0,
          total_nfts_earned: profile.total_nfts_earned || 0,
          reading_streak: profile.reading_streak || 0,
          community_points: profile.community_points || 0,
        };

        const criteria = reward.mint_criteria as NFTMintingCriteria;
        if (this.checkEligibility(criteria, userStats)) {
          const { success } = await this.mintNFT(userId, reward.id);
          if (success) {
            mintedNFTs.push(reward.name);
          }
        }
      }

      return mintedNFTs;
    } catch (error) {
      console.error('Failed to check and mint NFTs:', error);
      return [];
    }
  }

  /**
   * Track user activity and potentially mint NFTs
   */
  static async trackActivity(
    userId: string, 
    activityType: 'review' | 'like' | 'comment' | 'share' | 'join_community',
    pointsEarned: number = 0,
    metadata?: any
  ): Promise<void> {
    try {
      // Get current profile for updates
      const { data: profile } = await supabase
        .from('profiles')
        .select('community_points, total_nfts_earned')
        .eq('user_id', userId)
        .single();

      // Record the activity
      await supabase
        .from('community_activities')
        .insert({
          user_id: userId,
          activity_type: activityType,
          points_earned: pointsEarned,
          metadata,
        });

      // Update user's community points
      if (pointsEarned > 0) {
        await supabase
          .from('profiles')
          .update({ community_points: profile?.community_points ? profile.community_points + pointsEarned : pointsEarned })
          .eq('user_id', userId);
      }

      // Check and mint eligible NFTs
      const mintedNFTs = await this.checkAndMintEligibleNFTs(userId);
      
      if (mintedNFTs.length > 0) {
        console.log(`Minted NFTs for user ${userId}:`, mintedNFTs);
        // You could show a toast notification here
      }
    } catch (error) {
      console.error('Failed to track activity:', error);
    }
  }
}