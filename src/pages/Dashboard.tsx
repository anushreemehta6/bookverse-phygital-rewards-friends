import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Book, Award, Users, Zap, Trophy, Star, Calendar, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  wallet_address: string;
  total_books_read: number;
  total_reviews: number;
  total_nfts_earned: number;
  reading_streak: number;
  community_points: number;
  total_likes_received: number;
  total_comments_received: number;
}

interface NFTReward {
  id: string;
  name: string;
  description: string;
  rarity: string;
  mint_criteria: any;
  value_points: number;
  redeemable_location: string;
}

interface UserNFT {
  id: string;
  nft_reward: NFTReward;
  earned_at: string;
  is_redeemed: boolean;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [nftRewards, setNftRewards] = useState<NFTReward[]>([]);
  const [userNfts, setUserNfts] = useState<UserNFT[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchUserData();
  }, [user, navigate]);

  const fetchUserData = async () => {
    try {
      // Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch NFT rewards
      const { data: nftRewardsData } = await supabase
        .from('nft_rewards')
        .select('*')
        .eq('is_active', true)
        .order('value_points', { ascending: true });

      if (nftRewardsData) {
        setNftRewards(nftRewardsData);
      }

      // Fetch user's earned NFTs
      const { data: userNftsData } = await supabase
        .from('user_nfts')
        .select(`
          *,
          nft_reward:nft_rewards(*)
        `)
        .eq('user_id', user?.id);

      if (userNftsData) {
        setUserNfts(userNftsData as UserNFT[]);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateNFTProgress = (criteria: any, profile: UserProfile | null) => {
    if (!profile) return 0;
    
    if (criteria.reviews_count) {
      return Math.min((profile.total_reviews / criteria.reviews_count) * 100, 100);
    }
    if (criteria.likes_received) {
      return Math.min((profile.total_likes_received / criteria.likes_received) * 100, 100);
    }
    if (criteria.comments_received) {
      return Math.min((profile.total_comments_received / criteria.comments_received) * 100, 100);
    }
    if (criteria.community_points) {
      return Math.min((profile.community_points / criteria.community_points) * 100, 100);
    }
    if (criteria.reading_streak) {
      return Math.min((profile.reading_streak / criteria.reading_streak) * 100, 100);
    }
    return 0;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'bg-gray-500';
      case 'Rare': return 'bg-blue-500';
      case 'Epic': return 'bg-purple-500';
      case 'Legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
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
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Book className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">BookVerse Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {profile?.display_name || profile?.username}
            </span>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reviews Written</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.total_reviews || 0}</div>
              <p className="text-xs text-muted-foreground">Share your thoughts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Likes Received</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.total_likes_received || 0}</div>
              <p className="text-xs text-muted-foreground">Community engagement</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comments Received</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.total_comments_received || 0}</div>
              <p className="text-xs text-muted-foreground">Discussion starter</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Community Points</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.community_points || 0}</div>
              <p className="text-xs text-muted-foreground">Total earned</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">NFTs Earned</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.total_nfts_earned || 0}</div>
              <p className="text-xs text-muted-foreground">Collectible rewards</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reading Streak</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.reading_streak || 0}</div>
              <p className="text-xs text-muted-foreground">Days in a row</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available NFT Rewards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                NFT Rewards Progress
              </CardTitle>
              <CardDescription>
                Complete these activities to mint exclusive NFT rewards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {nftRewards.map((reward) => {
                const progress = calculateNFTProgress(reward.mint_criteria, profile);
                const isEarned = userNfts.some(nft => nft.nft_reward.id === reward.id);
                
                return (
                  <div key={reward.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getRarityColor(reward.rarity)}`} />
                        <div>
                          <h4 className="font-semibold">{reward.name}</h4>
                          <p className="text-sm text-muted-foreground">{reward.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={reward.rarity === 'Legendary' ? 'default' : 'secondary'}>
                          {reward.rarity}
                        </Badge>
                        {isEarned && (
                          <Badge variant="default" className="bg-green-500">
                            <Trophy className="w-3 h-3 mr-1" />
                            Earned
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Redeemable at: {reward.redeemable_location}
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Earned NFTs Collection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Your NFT Collection
              </CardTitle>
              <CardDescription>
                Your earned NFT rewards and redemption status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userNfts.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No NFTs earned yet</p>
                  <p className="text-sm text-muted-foreground">Complete activities above to start collecting!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userNfts.map((userNft) => (
                    <div key={userNft.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${getRarityColor(userNft.nft_reward.rarity)}`} />
                        <div>
                          <h4 className="font-semibold">{userNft.nft_reward.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Earned on {new Date(userNft.earned_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={userNft.nft_reward.rarity === 'Legendary' ? 'default' : 'secondary'}>
                          {userNft.nft_reward.rarity}
                        </Badge>
                        {userNft.is_redeemed ? (
                          <Badge variant="outline" className="text-green-600">
                            Redeemed
                          </Badge>
                        ) : (
                          <Button size="sm" variant="outline">
                            Redeem
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Start your journey to earning more NFT rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="h-20 flex-col gap-2" variant="outline">
                <Book className="h-6 w-6" />
                <span>Add Book Review</span>
              </Button>
              <Button 
                className="h-20 flex-col gap-2" 
                variant="outline"
                onClick={() => navigate('/community')}
              >
                <Users className="h-6 w-6" />
                <span>Join Community</span>
              </Button>
              <Button className="h-20 flex-col gap-2" variant="outline">
                <Calendar className="h-6 w-6" />
                <span>Update Reading Streak</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;