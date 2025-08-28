import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  wallet_address: string | null;
  total_books_read: number;
  total_reviews: number;
  total_nfts_earned: number;
  reading_streak: number;
  community_points: number;
  total_likes_received: number;
  total_comments_received: number;
  total_shares_received: number;
}

export interface CommunityPost {
  id: string;
  content: string;
  post_type: 'general' | 'review' | 'recommendation';
  book_title?: string | null;
  book_author?: string | null;
  rating?: number | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_id: string;
  profiles: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    total_nfts_earned: number;
  };
  is_liked?: boolean;
}

export class SharedDataService {
  // In-memory cache for real-time updates
  private static userProfileCache: UserProfile | null = null;
  private static postsCache: CommunityPost[] = [];
  private static listeners: Array<() => void> = [];

  /**
   * Subscribe to data changes
   */
  static subscribe(callback: () => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  /**
   * Notify all subscribers of data changes
   */
  private static notifyListeners() {
    this.listeners.forEach(callback => callback());
  }

  /**
   * Get or fetch user profile
   */
  static async getUserProfile(userId: string, forceRefresh = false): Promise<UserProfile | null> {
    if (!forceRefresh && this.userProfileCache) {
      return this.userProfileCache;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.log('Profile not found, creating default');
        const defaultProfile: UserProfile = {
          id: '',
          username: null,
          display_name: null,
          wallet_address: null,
          total_books_read: 0,
          total_reviews: 0,
          total_nfts_earned: 0,
          reading_streak: 0,
          community_points: 0,
          total_likes_received: 0,
          total_comments_received: 0,
          total_shares_received: 0
        };
        this.userProfileCache = defaultProfile;
        return defaultProfile;
      }

      this.userProfileCache = data;
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }

  /**
   * Update user profile locally and in database
   */
  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
    try {
      // Update cache immediately
      if (this.userProfileCache) {
        this.userProfileCache = { ...this.userProfileCache, ...updates };
      }

      // Try database update
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', userId);

      if (error) {
        console.log('Database update failed, keeping local changes');
      }

      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Failed to update profile:', error);
      return false;
    }
  }

  /**
   * Create a new post and update stats
   */
  static async createPost(
    userId: string,
    content: string,
    postType: 'general' | 'review' | 'recommendation',
    bookTitle?: string,
    bookAuthor?: string,
    rating?: number
  ): Promise<{ success: boolean; postId?: string; pointsEarned?: number }> {
    try {
      const postData = {
        user_id: userId,
        content: content.trim(),
        post_type: postType,
        book_title: postType === 'review' ? bookTitle : null,
        book_author: postType === 'review' ? bookAuthor : null,
        rating: postType === 'review' ? rating : null
      };

      let postId = '';
      const pointsEarned = postType === 'review' ? 50 : 10;

      // Try database insert
      try {
        const { data, error } = await supabase
          .from('community_posts')
          .insert(postData)
          .select('id')
          .single();

        if (error) throw error;
        postId = data.id;
      } catch (dbError) {
        console.log('Database insert failed, using local state');
        postId = Date.now().toString();
      }

      // Update user stats
      const currentProfile = this.userProfileCache;
      if (currentProfile) {
        const updates = {
          community_points: currentProfile.community_points + pointsEarned,
          ...(postType === 'review' ? { total_reviews: currentProfile.total_reviews + 1 } : {})
        };
        
        await this.updateUserProfile(userId, updates);
      }

      // Add post to local cache
      const newPost: CommunityPost = {
        id: postId,
        ...postData,
        created_at: new Date().toISOString(),
        likes_count: 0,
        comments_count: 0,
        profiles: {
          username: currentProfile?.username || null,
          display_name: currentProfile?.display_name || null,
          avatar_url: '/placeholder.svg',
          total_nfts_earned: currentProfile?.total_nfts_earned || 0
        }
      };

      this.postsCache = [newPost, ...this.postsCache];
      this.notifyListeners();

      return { success: true, postId, pointsEarned };
    } catch (error) {
      console.error('Failed to create post:', error);
      return { success: false };
    }
  }

  /**
   * Like/unlike a post and update stats
   */
  static async toggleLike(userId: string, postId: string): Promise<{ success: boolean; liked: boolean }> {
    try {
      // Find the post in cache
      const postIndex = this.postsCache.findIndex(post => post.id === postId);
      const post = this.postsCache[postIndex];
      
      if (!post) return { success: false, liked: false };

      const isCurrentlyLiked = post.is_liked || false;
      const newLikedState = !isCurrentlyLiked;

      // Update local cache immediately
      this.postsCache[postIndex] = {
        ...post,
        likes_count: newLikedState ? post.likes_count + 1 : post.likes_count - 1,
        is_liked: newLikedState
      };

      // Update post author's stats if they received a like
      if (post.user_id !== userId && this.userProfileCache) {
        // This is someone else's post, update their like count
        // Note: In a real app, you'd need to fetch the post author's profile
      }

      // Try database update
      try {
        if (newLikedState) {
          await supabase
            .from('post_likes')
            .insert({ post_id: postId, user_id: userId });
        } else {
          await supabase
            .from('post_likes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', userId);
        }

        // Award points for liking
        if (newLikedState) {
          await this.updateUserProfile(userId, {
            community_points: (this.userProfileCache?.community_points || 0) + 5
          });
        }
      } catch (dbError) {
        console.log('Database like operation failed, using local state');
      }

      this.notifyListeners();
      return { success: true, liked: newLikedState };
    } catch (error) {
      console.error('Failed to toggle like:', error);
      return { success: false, liked: false };
    }
  }

  /**
   * Get community posts (from cache or database)
   */
  static async getCommunityPosts(forceRefresh = false): Promise<CommunityPost[]> {
    if (!forceRefresh && this.postsCache.length > 0) {
      return this.postsCache;
    }

    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          profiles:user_id (
            username,
            display_name,
            avatar_url,
            total_nfts_earned
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.log('Using mock posts');
        this.postsCache = this.getMockPosts();
      } else {
        this.postsCache = data || [];
      }

      return this.postsCache;
    } catch (error) {
      console.error('Error fetching posts:', error);
      return this.getMockPosts();
    }
  }

  /**
   * Get mock posts for development
   */
  private static getMockPosts(): CommunityPost[] {
    return [
      {
        id: '1',
        content: "Just finished 'The Seven Husbands of Evelyn Hugo' and I'm absolutely blown away! 📚✨",
        post_type: 'review',
        book_title: 'The Seven Husbands of Evelyn Hugo',
        book_author: 'Taylor Jenkins Reid',
        rating: 5,
        likes_count: 24,
        comments_count: 8,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        user_id: 'user1',
        profiles: {
          username: 'bookworm_sarah',
          display_name: 'Sarah Chen',
          avatar_url: '/placeholder.svg',
          total_nfts_earned: 3
        }
      },
      {
        id: '2',
        content: "Looking for sci-fi recommendations! I loved Project Hail Mary. What are your favorites? 🚀",
        post_type: 'recommendation',
        likes_count: 18,
        comments_count: 12,
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        user_id: 'user2',
        profiles: {
          username: 'scifi_explorer',
          display_name: 'Alex Rivera',
          avatar_url: '/placeholder.svg',
          total_nfts_earned: 5
        }
      }
    ];
  }

  /**
   * Clear cache (useful for testing)
   */
  static clearCache() {
    this.userProfileCache = null;
    this.postsCache = [];
    this.notifyListeners();
  }

  /**
   * Get cached user profile
   */
  static getCachedProfile(): UserProfile | null {
    return this.userProfileCache;
  }

  /**
   * Get cached posts
   */
  static getCachedPosts(): CommunityPost[] {
    return this.postsCache;
  }
}