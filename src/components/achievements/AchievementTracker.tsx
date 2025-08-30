import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Trophy, 
  Target, 
  Award, 
  CheckCircle, 
  Clock,
  Gift,
  Star,
  BookOpen,
  Users,
  Flame
} from 'lucide-react';
import { FlowNFTService, FlowNFT } from '@/lib/flow/nft-service';
import { useAuth } from '@/components/auth/AuthContext';
import { useFlowWallet } from '@/components/flow/FlowWalletProvider';
import { useToast } from '@/hooks/use-toast';
import { StreakData } from '@/lib/streakTracker';

interface AchievementTrackerProps {
  streakData?: StreakData;
  userStats?: {
    reviews: number;
    likes: number;
    communityPoints: number;
    posts: number;
    uniqueGenres: number;
  };
}

interface AchievementType {
  id: string;
  name: string;
  description: string;
  rarity: string;
  rewardValue: string;
  criteria: Record<string, number>;
  icon: React.ComponentType<{ className?: string }>;
}

const achievementTypes: AchievementType[] = [
  {
    id: 'golden_bookmark',
    name: 'Golden Bookmark',
    description: 'Earned for writing 10 exceptional book reviews',
    rarity: 'Rare',
    rewardValue: '$15 Discount',
    criteria: { reviews: 10, likes: 50 },
    icon: BookOpen
  },
  {
    id: 'reading_streak_master',
    name: 'Reading Streak Master',
    description: 'Complete 30 days of consecutive reading activity',
    rarity: 'Uncommon', 
    rewardValue: '10% Off Purchase',
    criteria: { reading_streak: 30 },
    icon: Flame
  },
  {
    id: 'community_champion',
    name: 'Community Champion',
    description: 'Awarded for being top contributor in your genre community',
    rarity: 'Epic',
    rewardValue: 'Free Book + Coffee',
    criteria: { community_points: 500, posts: 20 },
    icon: Users
  },
  {
    id: 'genre_explorer',
    name: 'Genre Explorer',
    description: 'Read and review books from 5 different genres',
    rarity: 'Common',
    rewardValue: '$5 Discount',
    criteria: { unique_genres: 5, reviews: 5 },
    icon: Star
  }
];

export const AchievementTracker: React.FC<AchievementTrackerProps> = ({
  streakData,
  userStats = { reviews: 0, likes: 0, communityPoints: 0, posts: 0, uniqueGenres: 0 }
}) => {
  const { user: authUser } = useAuth();
  const { user: flowUser } = useFlowWallet();
  const isAuthenticated = !!flowUser;
  const { toast } = useToast();

  const [userNFTs, setUserNFTs] = useState<FlowNFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [minting, setMinting] = useState<string | null>(null);

  useEffect(() => {
    if (flowUser?.addr) {
      loadUserNFTs();
    } else {
      setLoading(false);
    }
  }, [flowUser?.addr]);

  const loadUserNFTs = async () => {
    if (!flowUser?.addr) return;

    try {
      const nfts = await FlowNFTService.getUserNFTs(flowUser.addr);
      setUserNFTs(nfts);
    } catch (error) {
      console.error('Failed to load user NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAchievementProgress = (achievement: AchievementType) => {
    const progress: Record<string, { current: number; required: number; percentage: number }> = {};
    
    for (const [key, required] of Object.entries(achievement.criteria)) {
      let current = 0;
      
      switch (key) {
        case 'reviews':
          current = userStats.reviews;
          break;
        case 'likes':
          current = userStats.likes;
          break;
        case 'reading_streak':
          current = streakData?.current_streak || 0;
          break;
        case 'community_points':
          current = userStats.communityPoints;
          break;
        case 'posts':
          current = userStats.posts;
          break;
        case 'unique_genres':
          current = userStats.uniqueGenres;
          break;
      }
      
      progress[key] = {
        current,
        required,
        percentage: Math.min((current / required) * 100, 100)
      };
    }
    
    return progress;
  };

  const isAchievementCompleted = (achievement: AchievementType) => {
    const progress = checkAchievementProgress(achievement);
    return Object.values(progress).every(p => p.current >= p.required);
  };

  const hasAchievementNFT = (achievementId: string) => {
    return userNFTs.some(nft => nft.achievementType === achievementId);
  };

  const handleClaimAchievement = async (achievementId: string) => {
    if (!flowUser?.addr || !authUser?.id) return;

    setMinting(achievementId);
    try {
      // In a real implementation, this would be called by an admin/backend service
      // For demo purposes, we'll show what the minting process would look like
      toast({
        title: "Achievement Qualified! 🎉",
        description: "You've earned this achievement! NFT minting will be processed by our system.",
      });

      // Simulate the minting process
      // In production, this would trigger a backend service that has minting permissions
      console.log(`Minting NFT for achievement: ${achievementId} to address: ${flowUser.addr}`);
      
      // Reload NFTs after a delay to simulate processing
      setTimeout(() => {
        loadUserNFTs();
        setMinting(null);
      }, 2000);

    } catch (error) {
      toast({
        title: "Claim Failed",
        description: "Failed to process your achievement claim. Please try again.",
        variant: "destructive"
      });
      setMinting(null);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common': return 'bg-gray-500 text-white';
      case 'uncommon': return 'bg-green-500 text-white';
      case 'rare': return 'bg-blue-500 text-white';
      case 'epic': return 'bg-purple-500 text-white';
      case 'legendary': return 'bg-yellow-500 text-black';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Achievement Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Achievement Progress
        </CardTitle>
        <CardDescription>
          Complete reading challenges to earn exclusive NFT rewards
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {achievementTypes.map((achievement) => {
          const progress = checkAchievementProgress(achievement);
          const isCompleted = isAchievementCompleted(achievement);
          const hasNFT = hasAchievementNFT(achievement.id);
          const Icon = achievement.icon;

          return (
            <div key={achievement.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${hasNFT ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <Icon className={`w-5 h-5 ${hasNFT ? 'text-green-600' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      {achievement.name}
                      {hasNFT && <CheckCircle className="w-4 h-4 text-green-500" />}
                    </h3>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={getRarityColor(achievement.rarity)}>
                    {achievement.rarity}
                  </Badge>
                  {hasNFT && (
                    <Badge variant="default" className="bg-green-500">
                      <Gift className="w-3 h-3 mr-1" />
                      Owned
                    </Badge>
                  )}
                </div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-2">
                {Object.entries(progress).map(([key, data]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="capitalize">{key.replace('_', ' ')}</span>
                      <span>{data.current} / {data.required}</span>
                    </div>
                    <Progress value={data.percentage} className="h-2" />
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium">Reward: </span>
                  <span className="text-muted-foreground">{achievement.rewardValue}</span>
                </div>
                
                {hasNFT ? (
                  <Button size="sm" variant="outline" disabled>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Completed
                  </Button>
                ) : isCompleted && isAuthenticated ? (
                  <Button
                    size="sm"
                    onClick={() => handleClaimAchievement(achievement.id)}
                    disabled={minting === achievement.id}
                    className="bg-gradient-primary"
                  >
                    {minting === achievement.id ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Award className="w-4 h-4 mr-2" />
                        Claim NFT
                      </>
                    )}
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" disabled>
                    <Target className="w-4 h-4 mr-2" />
                    In Progress
                  </Button>
                )}
              </div>

              {isCompleted && !isAuthenticated && (
                <Alert>
                  <Award className="h-4 w-4" />
                  <AlertDescription>
                    Connect your Flow wallet to claim your achievement NFT!
                  </AlertDescription>
                </Alert>
              )}
            </div>
          );
        })}

        {!isAuthenticated && (
          <Alert>
            <Trophy className="h-4 w-4" />
            <AlertDescription>
              Connect your Flow wallet to start earning achievement NFTs and redeem rewards at partner bookstores.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};