import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Award, 
  Gift, 
  MapPin, 
  Clock, 
  ExternalLink,
  Wallet,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { FlowNFT, FlowNFTService } from '@/lib/flow/nft-service';
import { useFlowWallet } from '@/components/flow/FlowWalletProvider';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface NFTCollectionProps {
  className?: string;
}

export const NFTCollection: React.FC<NFTCollectionProps> = ({ className }) => {
  const { user } = useFlowWallet();
  const isAuthenticated = !!user;
  const { user: authUser } = useAuth();
  const { toast } = useToast();
  
  const [nfts, setNfts] = useState<FlowNFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [collectionSetup, setCollectionSetup] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<FlowNFT | null>(null);
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    if (user?.addr) {
      checkCollectionAndLoadNFTs();
    } else {
      setLoading(false);
    }
  }, [user?.addr]);

  const checkCollectionAndLoadNFTs = async () => {
    if (!user?.addr) return;

    setLoading(true);
    try {
      // Check if collection is setup
      const isSetup = await FlowNFTService.isCollectionSetup(user.addr);
      setCollectionSetup(isSetup);

      if (isSetup) {
        // Load NFTs
        const userNFTs = await FlowNFTService.getUserNFTs(user.addr);
        setNfts(userNFTs);
      }
    } catch (error) {
      console.error('Failed to load NFT collection:', error);
      toast({
        title: "Error",
        description: "Failed to load your NFT collection",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetupCollection = async () => {
    try {
      const txId = await FlowNFTService.setupCollection();
      if (txId) {
        toast({
          title: "Collection Setup Complete! ✅",
          description: "Your NFT collection is now ready to receive achievement rewards."
        });
        setCollectionSetup(true);
      } else {
        throw new Error('Setup failed');
      }
    } catch (error) {
      toast({
        title: "Setup Failed",
        description: "Failed to setup your NFT collection. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRedeemNFT = async (nftId: string, location: string = "BookVerse Partner Store") => {
    setRedeeming(true);
    try {
      const txId = await FlowNFTService.redeemNFT(nftId, location);
      if (txId) {
        toast({
          title: "NFT Redeemed! 🎉",
          description: `Your NFT has been successfully redeemed at ${location}.`
        });
        
        // Reload NFTs to show updated status
        await checkCollectionAndLoadNFTs();
        setSelectedNFT(null);
      } else {
        throw new Error('Redemption failed');
      }
    } catch (error) {
      toast({
        title: "Redemption Failed",
        description: "Failed to redeem your NFT. Please try again.",
        variant: "destructive"
      });
    } finally {
      setRedeeming(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case 'common': return 'bg-gray-500';
      case 'uncommon': return 'bg-green-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            NFT Collection
          </CardTitle>
          <CardDescription>
            Connect your Flow wallet to view your achievement NFTs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Wallet className="h-4 w-4" />
            <AlertDescription>
              Please connect your Flow wallet to access your NFT collection.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            NFT Collection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!collectionSetup) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            NFT Collection
          </CardTitle>
          <CardDescription>
            Set up your collection to start earning achievement NFTs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your NFT collection needs to be set up before you can receive achievement rewards.
            </AlertDescription>
          </Alert>
          
          <Button onClick={handleSetupCollection} className="w-full">
            <Gift className="w-4 h-4 mr-2" />
            Setup NFT Collection
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Your Achievement NFTs ({nfts.length})
          </CardTitle>
          <CardDescription>
            Collectible rewards for your reading achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          {nfts.length === 0 ? (
            <Alert>
              <Gift className="h-4 w-4" />
              <AlertDescription>
                No achievement NFTs yet. Keep reading and engaging with the community to earn your first NFT!
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nfts.map((nft) => (
                <Dialog key={nft.id}>
                  <DialogTrigger asChild>
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">
                            #{nft.id}
                          </Badge>
                          {nft.isRedeemed && (
                            <Badge variant="default" className="text-xs bg-green-500">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Redeemed
                            </Badge>
                          )}
                        </div>
                        {nft.display?.thumbnail && (
                          <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                            <img 
                              src={nft.display.thumbnail} 
                              alt={nft.display.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </CardHeader>
                      <CardContent>
                        <h3 className="font-semibold text-sm mb-1">
                          {nft.display?.name || nft.achievementType}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {nft.display?.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="w-3 h-3" />
                          <span className="text-xs">
                            {new Date(nft.mintedAt * 1000).toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-500" />
                        {nft.display?.name || nft.achievementType}
                      </DialogTitle>
                      <DialogDescription>
                        Achievement NFT #{nft.id}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      {nft.display?.thumbnail && (
                        <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                          <img 
                            src={nft.display.thumbnail} 
                            alt={nft.display.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <p className="text-sm">{nft.display?.description}</p>
                        
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">
                            Type: {nft.achievementType}
                          </Badge>
                          <Badge variant="secondary">
                            Minted: {new Date(nft.mintedAt * 1000).toLocaleDateString()}
                          </Badge>
                        </div>

                        {nft.metadata && Object.keys(nft.metadata).length > 0 && (
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Metadata:</p>
                            {Object.entries(nft.metadata).map(([key, value]) => (
                              <p key={key} className="text-xs text-muted-foreground">
                                {key}: {value}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`https://testnet.flowscan.org/account/${user.addr}`, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View on Flowscan
                        </Button>
                        
                        {!nft.isRedeemed && (
                          <Button
                            size="sm"
                            onClick={() => handleRedeemNFT(nft.id)}
                            disabled={redeeming}
                          >
                            <MapPin className="w-4 h-4 mr-2" />
                            {redeeming ? 'Redeeming...' : 'Redeem Reward'}
                          </Button>
                        )}
                      </div>

                      {nft.isRedeemed && (
                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            Redeemed on {new Date((nft.redeemedAt || 0) * 1000).toLocaleDateString()}
                            {nft.redemptionLocation && ` at ${nft.redemptionLocation}`}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};