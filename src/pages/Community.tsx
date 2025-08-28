import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, Bookmark, Send, Users, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface CommunityPost {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  likes_count: number;
  comments_count: number;
  profiles: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

const Community = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchPosts();
  }, [user, navigate]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          profiles:user_id (
            username,
            display_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      if (data) setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load community posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPost = async () => {
    if (!newPost.trim() || !user) return;

    setPosting(true);
    try {
      const { error } = await supabase
        .from('community_posts')
        .insert({
          content: newPost.trim(),
          user_id: user.id
        });

      if (error) throw error;

      // Update community stats
      await supabase.rpc('update_community_stats', {
        user_id: user.id,
        reviews_increment: 1
      });

      setNewPost('');
      fetchPosts();
      toast({
        title: "Success",
        description: "Your post has been published!",
      });
    } catch (error) {
      console.error('Error posting:', error);
      toast({
        title: "Error",
        description: "Failed to publish post",
        variant: "destructive"
      });
    } finally {
      setPosting(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user) return;

    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        // Like
        await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });
      }

      fetchPosts();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">BookVerse Community</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Dashboard
            </Button>
            <Button variant="outline" onClick={() => navigate('/')}>
              Home
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Create New Post */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Share Your Thoughts
            </CardTitle>
            <CardDescription>
              What are you reading? Share a review, recommendation, or just chat about books!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="What's on your mind about books today? Share a review, ask for recommendations, or start a discussion..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={500}
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {newPost.length}/500 characters
              </span>
              <Button 
                onClick={handleSubmitPost}
                disabled={!newPost.trim() || posting}
                className="bg-gradient-primary"
              >
                {posting ? 'Posting...' : 'Post'}
                <Send className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Community Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{posts.length}</p>
                  <p className="text-xs text-muted-foreground">Community Posts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-2xl font-bold">
                    {posts.reduce((sum, post) => sum + post.likes_count, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Likes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                <p className="text-muted-foreground">Be the first to share something with the community!</p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  {/* User Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar>
                      <AvatarImage src={post.profiles.avatar_url} />
                      <AvatarFallback>
                        {(post.profiles.display_name || post.profiles.username || 'U')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">
                        {post.profiles.display_name || post.profiles.username}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString()} at{' '}
                        {new Date(post.created_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="mb-4">
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>
                  </div>

                  {/* Engagement Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLikePost(post.id)}
                        className="flex items-center gap-2 text-muted-foreground hover:text-red-500"
                      >
                        <Heart className="w-4 h-4" />
                        <span>{post.likes_count}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2 text-muted-foreground hover:text-blue-500"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.comments_count}</span>
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <Bookmark className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Community;