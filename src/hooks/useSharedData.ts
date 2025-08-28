import { useState, useEffect } from 'react';
import { SharedDataService, UserProfile, CommunityPost } from '@/lib/sharedDataService';

export const useSharedData = (userId: string | undefined) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch profile and posts
        const [userProfile, communityPosts] = await Promise.all([
          SharedDataService.getUserProfile(userId),
          SharedDataService.getCommunityPosts()
        ]);

        setProfile(userProfile);
        setPosts(communityPosts);
      } catch (error) {
        console.error('Error fetching shared data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Subscribe to data changes
    const unsubscribe = SharedDataService.subscribe(() => {
      setProfile(SharedDataService.getCachedProfile());
      setPosts(SharedDataService.getCachedPosts());
    });

    return unsubscribe;
  }, [userId]);

  const createPost = async (
    content: string,
    postType: 'general' | 'review' | 'recommendation',
    bookTitle?: string,
    bookAuthor?: string,
    rating?: number
  ) => {
    if (!userId) return { success: false };

    const result = await SharedDataService.createPost(
      userId,
      content,
      postType,
      bookTitle,
      bookAuthor,
      rating
    );

    return result;
  };

  const toggleLike = async (postId: string) => {
    if (!userId) return { success: false, liked: false };

    const result = await SharedDataService.toggleLike(userId, postId);
    return result;
  };

  const refreshData = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const [userProfile, communityPosts] = await Promise.all([
        SharedDataService.getUserProfile(userId, true), // Force refresh
        SharedDataService.getCommunityPosts(true) // Force refresh
      ]);

      setProfile(userProfile);
      setPosts(communityPosts);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    posts,
    loading,
    createPost,
    toggleLike,
    refreshData
  };
};