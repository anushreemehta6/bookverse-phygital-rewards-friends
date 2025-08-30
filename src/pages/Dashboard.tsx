// import React, { useEffect, useState } from 'react';
// import { useAuth } from '@/components/auth/AuthContext';
// import { supabase } from '@/integrations/supabase/client';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { Progress } from '@/components/ui/progress';
// import { Book, Award, Users, Zap, Trophy, Star, Calendar, Target } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

// interface UserProfile {
//   id: string;
//   username: string;
//   display_name: string;
//   wallet_address: string;
//   total_books_read: number;
//   total_reviews: number;
//   total_nfts_earned: number;
//   reading_streak: number;
//   community_points: number;
// }

// interface NFTReward {
//   id: string;
//   name: string;
//   description: string;
//   rarity: string;
//   mint_criteria: any;
//   value_points: number;
//   redeemable_location: string;
// }

// interface UserNFT {
//   id: string;
//   nft_reward: NFTReward;
//   earned_at: string;
//   is_redeemed: boolean;
// }

// const Dashboard = () => {
//   const { user, signOut } = useAuth();
//   const [profile, setProfile] = useState<UserProfile | null>(null);
//   const [nftRewards, setNftRewards] = useState<NFTReward[]>([]);
//   const [userNfts, setUserNfts] = useState<UserNFT[]>([]);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!user) {
//       navigate('/auth');
//       return;
//     }
//     fetchUserData();
//   }, [user, navigate]);

//   const fetchUserData = async () => {
//     try {
//       // Fetch user profile
//       const { data: profileData } = await supabase
//         .from('profiles')
//         .select('*')
//         .eq('user_id', user?.id)
//         .single();

//       if (profileData) {
//         setProfile(profileData);
//       }

//       // Fetch NFT rewards
//       const { data: nftRewardsData } = await supabase
//         .from('nft_rewards')
//         .select('*')
//         .eq('is_active', true)
//         .order('value_points', { ascending: true });

//       if (nftRewardsData) {
//         setNftRewards(nftRewardsData);
//       }

//       // Fetch user's earned NFTs
//       const { data: userNftsData } = await supabase
//         .from('user_nfts')
//         .select(`
//           *,
//           nft_reward:nft_rewards(*)
//         `)
//         .eq('user_id', user?.id);

//       if (userNftsData) {
//         setUserNfts(userNftsData as UserNFT[]);
//       }
//     } catch (error) {
//       console.error('Error fetching user data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const calculateNFTProgress = (criteria: any, profile: UserProfile | null) => {
//     if (!profile) return 0;
    
//     if (criteria.books_read) {
//       return Math.min((profile.total_books_read / criteria.books_read) * 100, 100);
//     }
//     if (criteria.reviews_count) {
//       return Math.min((profile.total_reviews / criteria.reviews_count) * 100, 100);
//     }
//     if (criteria.community_points) {
//       return Math.min((profile.community_points / criteria.community_points) * 100, 100);
//     }
//     if (criteria.reading_streak) {
//       return Math.min((profile.reading_streak / criteria.reading_streak) * 100, 100);
//     }
//     return 0;
//   };

//   const getRarityColor = (rarity: string) => {
//     switch (rarity) {
//       case 'Common': return 'bg-gray-500';
//       case 'Rare': return 'bg-blue-500';
//       case 'Epic': return 'bg-purple-500';
//       case 'Legendary': return 'bg-yellow-500';
//       default: return 'bg-gray-500';
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       {/* Header */}
//       <header className="border-b bg-card">
//         <div className="container mx-auto px-4 py-4 flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <Book className="h-6 w-6 text-primary" />
//             <span className="text-xl font-bold">BookVerse Dashboard</span>
//           </div>
//           <div className="flex items-center gap-4">
//             <span className="text-sm text-muted-foreground">
//               Welcome, {profile?.display_name || profile?.username}
//             </span>
//             <Button variant="outline" onClick={signOut}>
//               Sign Out
//             </Button>
//           </div>
//         </div>
//       </header>

//       <div className="container mx-auto px-4 py-8 space-y-8">
//         {/* Stats Overview */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Books Read</CardTitle>
//               <Book className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{profile?.total_books_read || 0}</div>
//               <p className="text-xs text-muted-foreground">Keep reading to unlock NFTs</p>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Reviews Written</CardTitle>
//               <Star className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{profile?.total_reviews || 0}</div>
//               <p className="text-xs text-muted-foreground">Share your thoughts</p>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">NFTs Earned</CardTitle>
//               <Award className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{profile?.total_nfts_earned || 0}</div>
//               <p className="text-xs text-muted-foreground">Collectible rewards</p>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Reading Streak</CardTitle>
//               <Zap className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{profile?.reading_streak || 0}</div>
//               <p className="text-xs text-muted-foreground">Days in a row</p>
//             </CardContent>
//           </Card>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//           {/* Available NFT Rewards */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <Target className="h-5 w-5" />
//                 NFT Rewards Progress
//               </CardTitle>
//               <CardDescription>
//                 Complete these activities to mint exclusive NFT rewards
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               {nftRewards.map((reward) => {
//                 const progress = calculateNFTProgress(reward.mint_criteria, profile);
//                 const isEarned = userNfts.some(nft => nft.nft_reward.id === reward.id);
                
//                 return (
//                   <div key={reward.id} className="space-y-3">
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-3">
//                         <div className={`w-3 h-3 rounded-full ${getRarityColor(reward.rarity)}`} />
//                         <div>
//                           <h4 className="font-semibold">{reward.name}</h4>
//                           <p className="text-sm text-muted-foreground">{reward.description}</p>
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <Badge variant={reward.rarity === 'Legendary' ? 'default' : 'secondary'}>
//                           {reward.rarity}
//                         </Badge>
//                         {isEarned && (
//                           <Badge variant="default" className="bg-green-500">
//                             <Trophy className="w-3 h-3 mr-1" />
//                             Earned
//                           </Badge>
//                         )}
//                       </div>
//                     </div>
//                     <div className="space-y-2">
//                       <div className="flex justify-between text-sm">
//                         <span>Progress</span>
//                         <span>{Math.round(progress)}%</span>
//                       </div>
//                       <Progress value={progress} className="h-2" />
//                     </div>
//                     <p className="text-xs text-muted-foreground">
//                       Redeemable at: {reward.redeemable_location}
//                     </p>
//                   </div>
//                 );
//               })}
//             </CardContent>
//           </Card>

//           {/* Earned NFTs Collection */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <Trophy className="h-5 w-5" />
//                 Your NFT Collection
//               </CardTitle>
//               <CardDescription>
//                 Your earned NFT rewards and redemption status
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               {userNfts.length === 0 ? (
//                 <div className="text-center py-8">
//                   <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
//                   <p className="text-muted-foreground">No NFTs earned yet</p>
//                   <p className="text-sm text-muted-foreground">Complete activities above to start collecting!</p>
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   {userNfts.map((userNft) => (
//                     <div key={userNft.id} className="flex items-center justify-between p-4 border rounded-lg">
//                       <div className="flex items-center gap-3">
//                         <div className={`w-4 h-4 rounded-full ${getRarityColor(userNft.nft_reward.rarity)}`} />
//                         <div>
//                           <h4 className="font-semibold">{userNft.nft_reward.name}</h4>
//                           <p className="text-sm text-muted-foreground">
//                             Earned on {new Date(userNft.earned_at).toLocaleDateString()}
//                           </p>
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <Badge variant={userNft.nft_reward.rarity === 'Legendary' ? 'default' : 'secondary'}>
//                           {userNft.nft_reward.rarity}
//                         </Badge>
//                         {userNft.is_redeemed ? (
//                           <Badge variant="outline" className="text-green-600">
//                             Redeemed
//                           </Badge>
//                         ) : (
//                           <Button size="sm" variant="outline">
//                             Redeem
//                           </Button>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </div>

//         {/* Quick Actions */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Quick Actions</CardTitle>
//             <CardDescription>
//               Start your journey to earning more NFT rewards
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <Button className="h-20 flex-col gap-2" variant="outline">
//                 <Book className="h-6 w-6" />
//                 <span>Add Book Review</span>
//               </Button>
//               <Button className="h-20 flex-col gap-2" variant="outline">
//                 <Users className="h-6 w-6" />
//                 <span>Join Community</span>
//               </Button>
//               <Button className="h-20 flex-col gap-2" variant="outline">
//                 <Calendar className="h-6 w-6" />
//                 <span>Update Reading Streak</span>
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Book, 
  Award, 
  Users, 
  Zap, 
  Trophy, 
  Star, 
  Calendar, 
  Target, 
  Heart,
  MessageCircle,
  TrendingUp,
  Sparkles,
  Home,
  BookOpen,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useSharedData } from '@/hooks/useSharedData';
import { WalletConnect } from '@/components/flow/WalletConnect';
import { useFlowWallet } from '@/components/flow/FlowWalletProvider';
import { ReadingStreakComponent } from '@/components/gamification/ReadingStreakTracker';
import { NFTCollection } from '@/components/nft/NFTCollection';
import { AchievementTracker } from '@/components/achievements/AchievementTracker';
import { PhygitalRedemptionCenter } from '@/components/nft/PhygitalRedemptionCenter';
import { StreakData } from '@/lib/streakTracker';

interface UserProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  wallet_address: string | null;
  total_books_read: number | null;
  total_reviews: number | null;
  total_nfts_earned: number | null;
  reading_streak: number | null;
  community_points: number | null;
  total_likes_received: number | null;
  total_comments_received: number | null;
  total_shares_received: number | null;
}

interface NFTReward {
  id: string;
  name: string;
  description: string;
  rarity: string;
  mint_criteria: any;
  value_points: number | null;
  redeemable_location: string | null;
}

interface UserNFT {
  id: string;
  nft_reward: NFTReward;
  earned_at: string;
  is_redeemed: boolean | null;
}

interface EngagementStats {
  total_posts: number;
  total_likes_received: number;
  total_comments_received: number;
  communities_joined: number;
  engagement_score: number;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Use shared hook for synchronized data
  const { profile, communities, userCommunities, loading, joinCommunity } = useSharedData(user?.id);
  
  // Flow wallet integration
  const { user: flowUser, balance } = useFlowWallet();
  
  // Local state for dashboard-specific data
  const [nftRewards, setNftRewards] = useState<NFTReward[]>([]);
  const [userNfts, setUserNfts] = useState<UserNFT[]>([]);
  const [engagementStats, setEngagementStats] = useState<EngagementStats>({
    total_posts: 0,
    total_likes_received: 0,
    total_comments_received: 0,
    communities_joined: 0,
    engagement_score: 0
  });
  const [streakData, setStreakData] = useState<StreakData | undefined>();

  // Handle community joining from dashboard
  const handleJoinCommunity = async (communityId: string) => {
    if (!user) return;
    
    try {
      const result = await joinCommunity(communityId);
      
      if (result.success) {
        toast({
          title: "Welcome!",
          description: `You've joined the community! +${result.pointsEarned || 25} points earned 🎉`
        });
      } else {
        toast({
          title: "Info",
          description: result.error || "Unable to join community",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join community",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // Fetch dashboard-specific data (NFTs, etc.)
    fetchDashboardData();
  }, [user, navigate]);
  
  const fetchDashboardData = async () => {
    try {
      // Fetch engagement statistics
      try {
        const { data: engagementData, error: engagementError } = await supabase
          .rpc('get_user_engagement_stats', { user_id: user?.id });

        if (!engagementError && engagementData && engagementData.length > 0) {
          setEngagementStats({
            total_posts: engagementData[0].total_posts || 0,
            total_likes_received: engagementData[0].total_likes_given ?? 0,
            total_comments_received: engagementData[0].total_comments_given ?? 0,
            communities_joined: engagementData[0].communities_joined || 0,
            engagement_score: engagementData[0].engagement_score || 0
          });
        }
      } catch (error) {
        console.log('Engagement stats function not available, using defaults');
      }

      // Fetch NFT rewards
      const { data: nftRewardsData } = await supabase
        .from('nft_rewards')
        .select('*')
        .eq('is_active', true)
        .order('value_points', { ascending: true });

      if (nftRewardsData) {
        setNftRewards(nftRewardsData);
      } else {
        // Mock NFT rewards if database doesn't have them
        const mockRewards: NFTReward[] = [
          {
            id: '1',
            name: 'Bookworm Badge',
            description: 'Read your first 5 books',
            rarity: 'Common',
            mint_criteria: { books_read: 5 },
            value_points: 100,
            redeemable_location: 'Virtual Badge'
          },
          {
            id: '2',
            name: 'Review Master',
            description: 'Write 10 quality reviews',
            rarity: 'Rare',
            mint_criteria: { reviews_count: 10, likes_received: 50 },
            value_points: 250,
            redeemable_location: 'Local Bookstore Discount'
          },
          {
            id: '3',
            name: 'Community Champion',
            description: 'Earn 500 community points',
            rarity: 'Epic',
            mint_criteria: { community_points: 500 },
            value_points: 500,
            redeemable_location: 'Premium Book Club Access'
          }
        ];
        setNftRewards(mockRewards);
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
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Warning",
        description: "Some data couldn't be loaded. Using defaults.",
        variant: "destructive"
      });
    }
  };

  const calculateNFTProgress = (criteria: any, profile: UserProfile | null) => {
    if (!profile) return 0;
    
    let progress = 0;
    let total = 0;
    
    if (criteria.books_read) {
      progress += Math.min(profile.total_books_read || 0, criteria.books_read);
      total += criteria.books_read;
    }
    if (criteria.reviews_count) {
      progress += Math.min(profile.total_reviews || 0, criteria.reviews_count);
      total += criteria.reviews_count;
    }
    if (criteria.likes_received) {
      progress += Math.min(profile.total_likes_received || 0, criteria.likes_received);
      total += criteria.likes_received;
    }
    if (criteria.community_points) {
      progress += Math.min(profile.community_points || 0, criteria.community_points);
      total += criteria.community_points;
    }
    if (criteria.reading_streak) {
      progress += Math.min(profile.reading_streak || 0, criteria.reading_streak);
      total += criteria.reading_streak;
    }
    
    return total > 0 ? (progress / total) * 100 : 0;
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

  const getRarityBadgeVariant = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return 'default';
      case 'Epic': return 'secondary';
      default: return 'outline';
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
    <div className="min-h-screen bg-gradient-subtle">
      {/* Enhanced Header */}
      <header className="border-b bg-card/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Book className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold bg-gradient-literary bg-clip-text text-transparent">
              BookVerse Dashboard
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/community')}>
              <Users className="w-4 h-4 mr-2" />
              Community
            </Button>
            <Button variant="outline" onClick={() => navigate('/')}>
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            <WalletConnect variant="inline" showBalance={true} />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Welcome, {profile?.display_name || profile?.username || 'Reader'}
              </span>
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <Card className="hover:shadow-elegant transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Books Read</CardTitle>
              <Book className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{profile?.total_books_read || 0}</div>
              <p className="text-xs text-muted-foreground">Keep reading to unlock NFTs</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-elegant transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reviews Written</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{profile?.total_reviews || 0}</div>
              <p className="text-xs text-muted-foreground">Share your thoughts</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-elegant transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Likes Received</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{profile?.total_likes_received || 0}</div>
              <p className="text-xs text-muted-foreground">Community love</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-elegant transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comments Received</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{profile?.total_comments_received || 0}</div>
              <p className="text-xs text-muted-foreground">Discussions started</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-elegant transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Community Points</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{profile?.community_points || 0}</div>
              <p className="text-xs text-muted-foreground">Total earned</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-elegant transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">NFTs Earned</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">{profile?.total_nfts_earned || 0}</div>
              <p className="text-xs text-muted-foreground">Collectible rewards</p>
            </CardContent>
          </Card>
        </div>

        {/* Wallet & Web3 Integration */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <WalletConnect variant="card" showBalance={true} />
          </div>
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="text-lg">Web3 Benefits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Award className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Own Your NFTs</p>
                  <p className="text-xs text-muted-foreground">True digital ownership</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Plus className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Real Rewards</p>
                  <p className="text-xs text-muted-foreground">Redeem at partner stores</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Community</p>
                  <p className="text-xs text-muted-foreground">Join the Web3 book ecosystem</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievement & NFT Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Achievement Tracker with Flow Integration */}
          <AchievementTracker 
            streakData={streakData}
            userStats={{
              reviews: profile?.total_reviews || 0,
              likes: profile?.total_likes_received || 0,
              communityPoints: profile?.community_points || 0,
              posts: engagementStats.total_posts,
              uniqueGenres: 3, // This would come from actual data
            }}
          />

          {/* NFT Collection with Phygital Redemption */}
          <NFTCollection className="h-fit" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* NFT Rewards Progress */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                NFT Rewards Progress
              </CardTitle>
              <CardDescription>
                Complete these activities to mint exclusive NFT rewards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {nftRewards.slice(0, 3).map((reward) => {
                const progress = calculateNFTProgress(reward.mint_criteria, profile);
                const isEarned = userNfts.some(nft => nft.nft_reward.id === reward.id);
                
                return (
                  <div key={reward.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getRarityColor(reward.rarity)}`} />
                        <div>
                          <h4 className="font-semibold text-sm">{reward.name}</h4>
                          <p className="text-xs text-muted-foreground">{reward.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getRarityBadgeVariant(reward.rarity)} className="text-xs">
                          {reward.rarity}
                        </Badge>
                        {isEarned && (
                          <Badge variant="default" className="bg-green-500 text-xs">
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
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-secondary" />
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
                  <p className="text-sm text-muted-foreground">Complete activities to start collecting!</p>
                  <Button 
                    className="mt-4 bg-gradient-primary"
                    onClick={() => navigate('/community')}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Join Community
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userNfts.map((userNft) => (
                    <div key={userNft.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${getRarityColor(userNft.nft_reward.rarity)}`} />
                        <div>
                          <h4 className="font-semibold text-sm">{userNft.nft_reward.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            Earned on {new Date(userNft.earned_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getRarityBadgeVariant(userNft.nft_reward.rarity)} className="text-xs">
                          {userNft.nft_reward.rarity}
                        </Badge>
                        {userNft.is_redeemed ? (
                          <Badge variant="outline" className="text-green-600 text-xs">
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

          {/* Engagement Summary */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                Engagement Summary
              </CardTitle>
              <CardDescription>
                Your community activity and next milestones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-primary">{engagementStats.total_posts}</p>
                  <p className="text-xs text-muted-foreground">Posts Created</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-red-500">{engagementStats.total_likes_received}</p>
                  <p className="text-xs text-muted-foreground">Likes Received</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-blue-500">{engagementStats.total_comments_received}</p>
                  <p className="text-xs text-muted-foreground">Comments Received</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-purple-500">{userCommunities.length}</p>
                  <p className="text-xs text-muted-foreground">Communities</p>
                </div>
              </div>
              
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-semibold text-sm">Next Milestone</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Community Champion</span>
                    <span>{Math.min(((profile?.community_points || 0) / 500) * 100, 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={Math.min(((profile?.community_points || 0) / 500) * 100, 100)} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {500 - (profile?.community_points || 0)} more points needed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* NFT Rewards Progress */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                NFT Rewards Progress
              </CardTitle>
              <CardDescription>
                Complete these activities to mint exclusive NFT rewards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {nftRewards.slice(0, 3).map((reward) => {
                const progress = calculateNFTProgress(reward.mint_criteria, profile);
                const isEarned = userNfts.some(nft => nft.nft_reward.id === reward.id);
                
                return (
                  <div key={reward.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getRarityColor(reward.rarity)}`} />
                        <div>
                          <h4 className="font-semibold text-sm">{reward.name}</h4>
                          <p className="text-xs text-muted-foreground">{reward.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getRarityBadgeVariant(reward.rarity)} className="text-xs">
                          {reward.rarity}
                        </Badge>
                        {isEarned && (
                          <Badge variant="default" className="bg-green-500 text-xs">
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
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-secondary" />
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
                  <p className="text-sm text-muted-foreground">Complete activities to start collecting!</p>
                  <Button 
                    className="mt-4 bg-gradient-primary"
                    onClick={() => navigate('/community')}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Join Community
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userNfts.map((userNft) => (
                    <div key={userNft.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${getRarityColor(userNft.nft_reward.rarity)}`} />
                        <div>
                          <h4 className="font-semibold text-sm">{userNft.nft_reward.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            Earned on {new Date(userNft.earned_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getRarityBadgeVariant(userNft.nft_reward.rarity)} className="text-xs">
                          {userNft.nft_reward.rarity}
                        </Badge>
                        {userNft.is_redeemed ? (
                          <Badge variant="outline" className="text-green-600 text-xs">
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

          {/* Engagement Summary */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                Engagement Summary
              </CardTitle>
              <CardDescription>
                Your community activity and next milestones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-primary">{engagementStats.total_posts}</p>
                  <p className="text-xs text-muted-foreground">Posts Created</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-red-500">{engagementStats.total_likes_received}</p>
                  <p className="text-xs text-muted-foreground">Likes Received</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-blue-500">{engagementStats.total_comments_received}</p>
                  <p className="text-xs text-muted-foreground">Comments Received</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-purple-500">{userCommunities.length}</p>
                  <p className="text-xs text-muted-foreground">Communities</p>
                </div>
              </div>
              
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-semibold text-sm">Next Milestone</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Community Champion</span>
                    <span>{Math.min(((profile?.community_points || 0) / 500) * 100, 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={Math.min(((profile?.community_points || 0) / 500) * 100, 100)} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {500 - (profile?.community_points || 0)} more points needed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Enhanced Quick Actions */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Start your journey to earning more NFT rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                className="h-20 flex-col gap-2 bg-gradient-primary text-primary-foreground hover:shadow-glow" 
                onClick={() => navigate('/community')}
              >
                <Users className="h-6 w-6" />
                <span>Join Community</span>
                <span className="text-xs opacity-80">+25 points</span>
              </Button>
              
              <Button className="h-20 flex-col gap-2" variant="outline">
                <BookOpen className="h-6 w-6" />
                <span>Write Review</span>
                <span className="text-xs text-muted-foreground">+50 points</span>
              </Button>
              
              <Button className="h-20 flex-col gap-2" variant="outline">
                <Calendar className="h-6 w-6" />
                <span>Log Reading</span>
                <span className="text-xs text-muted-foreground">+10 points</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reading Goals */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-accent" />
              Reading Goals
            </CardTitle>
            <CardDescription>
              Track your progress towards reading milestones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ReadingStreakComponent onStreakUpdate={(newStreakData) => {
                // Update the profile state when streak changes
                setStreakData(newStreakData);
                if (profile) {
                  // This would typically trigger a refresh of the shared data
                  console.log('Streak updated:', newStreakData);
                }
              }} />

              {/* Community Engagement */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold">Community Engagement</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Posts Created</span>
                    <Badge variant="outline">{engagementStats.total_posts}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Communities Joined</span>
                    <Badge variant="outline">{engagementStats.communities_joined}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Engagement Score</span>
                    <Badge variant="secondary">{engagementStats.engagement_score}</Badge>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  className="w-full bg-gradient-primary" 
                  onClick={() => navigate('/community')}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Visit Community
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My Communities Section */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              My Communities
            </CardTitle>
            <CardDescription>
              Communities you've joined and available communities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Joined Communities */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Joined Communities ({userCommunities.length})</h3>
                {userCommunities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No communities joined yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {userCommunities.slice(0, 3).map((membership) => (
                      <div key={membership.community_id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${membership.community.color_gradient || 'from-blue-500 to-purple-600'} flex items-center justify-center`}>
                          {membership.community.icon || '📚'}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{membership.community.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Joined {new Date(membership.joined_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          <Award className="w-3 h-3 mr-1" />
                          Member
                        </Badge>
                      </div>
                    ))}
                    {userCommunities.length > 3 && (
                      <Button variant="ghost" size="sm" className="w-full" onClick={() => navigate('/community')}>
                        View all {userCommunities.length} communities
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Available Communities to Join */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Discover More Communities</h3>
                <div className="space-y-2">
                  {communities
                    .filter(community => !userCommunities.some(membership => membership.community_id === community.id))
                    .slice(0, 3)
                    .map((community) => (
                      <div key={community.id} className="flex items-center gap-3 p-3 border rounded-lg hover:shadow-sm transition-shadow">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${community.color_gradient || 'from-gray-500 to-gray-600'} flex items-center justify-center`}>
                          {community.icon || '📚'}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{community.name}</p>
                          <p className="text-xs text-muted-foreground">{community.member_count.toLocaleString()} members</p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleJoinCommunity(community.id)}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Join
                        </Button>
                      </div>
                    ))}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full" 
                    onClick={() => navigate('/community')}
                  >
                    Explore All Communities
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Phygital Redemption Center */}
        <PhygitalRedemptionCenter />
      </div>
    </div>
  );
};

export default Dashboard;