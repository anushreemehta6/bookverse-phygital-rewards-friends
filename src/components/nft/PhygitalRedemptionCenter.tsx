import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  MapPin, 
  Gift, 
  Scan, 
  CheckCircle, 
  AlertTriangle,
  ExternalLink,
  Navigation,
  Store,
  Coffee,
  Book
} from 'lucide-react';
import { FlowNFT, FlowNFTService } from '@/lib/flow/nft-service';
import { useFlowWallet } from '@/components/flow/FlowWalletProvider';
import { useToast } from '@/hooks/use-toast';

interface PartnerLocation {
  id: string;
  name: string;
  address: string;
  type: 'bookstore' | 'cafe' | 'online';
  acceptedNFTs: string[];
  redemptionOffers: string[];
  coordinates?: { lat: number; lng: number };
  contact?: string;
  hours?: string;
}

const mockPartnerLocations: PartnerLocation[] = [
  {
    id: '1',
    name: 'Barnes & Noble Downtown',
    address: '123 Main St, Downtown',
    type: 'bookstore',
    acceptedNFTs: ['golden_bookmark', 'reading_streak_master', 'genre_explorer'],
    redemptionOffers: ['$15 Discount on Books', '10% Off Purchase', '$5 Discount'],
    contact: '(555) 123-4567',
    hours: '9 AM - 9 PM'
  },
  {
    id: '2',
    name: 'Indie Book Corner',
    address: '456 Literary Lane',
    type: 'bookstore',
    acceptedNFTs: ['community_champion', 'genre_explorer'],
    redemptionOffers: ['Free Book + Coffee', '$5 Discount'],
    contact: '(555) 987-6543',
    hours: '10 AM - 8 PM'
  },
  {
    id: '3',
    name: 'BookVerse Online Store',
    address: 'bookverse.com/store',
    type: 'online',
    acceptedNFTs: ['golden_bookmark', 'reading_streak_master', 'community_champion', 'genre_explorer'],
    redemptionOffers: ['Digital Rewards', 'Premium Access', 'Exclusive Content'],
    contact: 'support@bookverse.com',
    hours: '24/7'
  }
];

interface PhygitalRedemptionCenterProps {
  className?: string;
}

export const PhygitalRedemptionCenter: React.FC<PhygitalRedemptionCenterProps> = ({ className }) => {
  const { user } = useFlowWallet();
  const isAuthenticated = !!user;
  const { toast } = useToast();
  
  const [userNFTs, setUserNFTs] = useState<FlowNFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNFT, setSelectedNFT] = useState<FlowNFT | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<PartnerLocation | null>(null);
  const [redemptionCode, setRedemptionCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    if (user?.addr) {
      loadUserNFTs();
    } else {
      setLoading(false);
    }
  }, [user?.addr]);

  const loadUserNFTs = async () => {
    if (!user?.addr) return;

    try {
      const nfts = await FlowNFTService.getUserNFTs(user.addr);
      // Filter to only show unredeemed NFTs
      setUserNFTs(nfts.filter(nft => !nft.isRedeemed));
    } catch (error) {
      console.error('Failed to load NFTs:', error);
      toast({
        title: "Error",
        description: "Failed to load your NFT collection",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRedemption = async () => {
    if (!selectedNFT || !selectedLocation) return;

    setRedeeming(true);
    try {
      const txId = await FlowNFTService.redeemNFT(selectedNFT.id, selectedLocation.name);
      
      if (txId) {
        // Generate redemption code
        const code = `BV-${selectedNFT.id}-${Date.now().toString(36).toUpperCase()}`;
        setRedemptionCode(code);

        toast({
          title: "Redemption Successful! 🎉",
          description: `Your NFT has been redeemed. Show your redemption code to the partner store.`
        });

        // Refresh NFTs
        await loadUserNFTs();
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

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'bookstore': return <Store className="w-4 h-4" />;
      case 'cafe': return <Coffee className="w-4 h-4" />;
      case 'online': return <ExternalLink className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getEligibleOffers = (nftType: string) => {
    return mockPartnerLocations.filter(location => 
      location.acceptedNFTs.includes(nftType)
    );
  };

  if (!isAuthenticated || !user) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-green-500" />
            Phygital Redemption Center
          </CardTitle>
          <CardDescription>
            Connect your Flow wallet to redeem NFT rewards at partner locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please connect your Flow wallet to access the redemption center.
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
            <Gift className="h-5 w-5 text-green-500" />
            Phygital Redemption Center
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

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-green-500" />
            Phygital Redemption Center
          </CardTitle>
          <CardDescription>
            Redeem your achievement NFTs for real-world rewards at partner locations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Available NFTs for Redemption */}
          <div className="space-y-3">
            <h3 className="font-semibold">Your Redeemable NFTs ({userNFTs.length})</h3>
            
            {userNFTs.length === 0 ? (
              <Alert>
                <Book className="h-4 w-4" />
                <AlertDescription>
                  You don't have any unredeemed NFTs yet. Complete achievements to earn redeemable rewards!
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userNFTs.map((nft) => {
                  const eligibleOffers = getEligibleOffers(nft.achievementType);
                  
                  return (
                    <Card key={nft.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">
                            {nft.display?.name || nft.achievementType}
                          </CardTitle>
                          <Badge variant="secondary">#{nft.id}</Badge>
                        </div>
                        <CardDescription className="text-xs">
                          {nft.display?.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-xs text-muted-foreground">
                          Available at {eligibleOffers.length} partner location(s)
                        </div>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              className="w-full"
                              disabled={eligibleOffers.length === 0}
                            >
                              <Scan className="w-4 h-4 mr-2" />
                              Redeem Reward
                            </Button>
                          </DialogTrigger>
                          
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <Gift className="w-5 h-5 text-green-500" />
                                Redeem {nft.display?.name || nft.achievementType}
                              </DialogTitle>
                              <DialogDescription>
                                Choose a partner location to redeem your NFT reward
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                              {eligibleOffers.map((location) => {
                                const offerIndex = location.acceptedNFTs.indexOf(nft.achievementType);
                                const offer = location.redemptionOffers[offerIndex] || location.redemptionOffers[0];
                                
                                return (
                                  <div key={location.id} className="border rounded-lg p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                          {getLocationIcon(location.type)}
                                        </div>
                                        <div>
                                          <h4 className="font-semibold">{location.name}</h4>
                                          <p className="text-sm text-muted-foreground">{location.address}</p>
                                        </div>
                                      </div>
                                      <Badge variant="outline" className="bg-green-50 text-green-700">
                                        {offer}
                                      </Badge>
                                    </div>
                                    
                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                      <span>{location.contact}</span>
                                      <span>{location.hours}</span>
                                    </div>
                                    
                                    <Button
                                      size="sm"
                                      className="w-full"
                                      onClick={() => {
                                        setSelectedNFT(nft);
                                        setSelectedLocation(location);
                                        handleRedemption();
                                      }}
                                      disabled={redeeming}
                                    >
                                      {redeeming ? 'Redeeming...' : 'Redeem Here'}
                                    </Button>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Redemption Success */}
                            {redemptionCode && (
                              <Alert className="border-green-200 bg-green-50">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <AlertDescription>
                                  <div className="space-y-2">
                                    <p className="font-semibold text-green-800">Redemption Successful!</p>
                                    <p className="text-sm">Your redemption code:</p>
                                    <div className="bg-white border border-green-200 rounded p-2 font-mono text-lg text-center">
                                      {redemptionCode}
                                    </div>
                                    <p className="text-xs text-green-700">
                                      Show this code to the partner store to claim your reward. 
                                      Screenshot this for your records.
                                    </p>
                                  </div>
                                </AlertDescription>
                              </Alert>
                            )}
                          </DialogContent>
                        </Dialog>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Partner Locations */}
          <div className="space-y-3">
            <h3 className="font-semibold">Partner Locations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockPartnerLocations.map((location) => (
                <Card key={location.id} className="text-center">
                  <CardHeader className="pb-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                      {getLocationIcon(location.type)}
                    </div>
                    <CardTitle className="text-sm">{location.name}</CardTitle>
                    <CardDescription className="text-xs">{location.address}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-xs">
                      <p><strong>Contact:</strong> {location.contact}</p>
                      <p><strong>Hours:</strong> {location.hours}</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {location.redemptionOffers.map((offer, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {offer}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="space-y-3">
            <h3 className="font-semibold">How Phygital Redemption Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="font-bold text-blue-600">1</span>
                </div>
                <p className="text-sm font-medium">Earn NFTs</p>
                <p className="text-xs text-muted-foreground">Complete reading achievements</p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="font-bold text-green-600">2</span>
                </div>
                <p className="text-sm font-medium">Choose Location</p>
                <p className="text-xs text-muted-foreground">Select a partner store</p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="font-bold text-purple-600">3</span>
                </div>
                <p className="text-sm font-medium">Redeem Online</p>
                <p className="text-xs text-muted-foreground">Get your redemption code</p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="font-bold text-orange-600">4</span>
                </div>
                <p className="text-sm font-medium">Claim Reward</p>
                <p className="text-xs text-muted-foreground">Show code at store</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};