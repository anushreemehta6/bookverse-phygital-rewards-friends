import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Gift, MapPin, Star, Clock, ArrowRight } from "lucide-react";

const nftRewards = [
  {
    id: 1,
    name: "Golden Bookmark",
    description: "Earned for writing 10 exceptional book reviews",
    rarity: "Rare",
    redeemableAt: "Barnes & Noble",
    value: "$15 Discount",
    earnedBy: 1250,
    gradient: "from-amber-400 to-yellow-600",
    icon: "🔖"
  },
  {
    id: 2,
    name: "Community Champion",
    description: "Awarded for being top contributor in your genre community",
    rarity: "Epic",
    redeemableAt: "Local Independent Bookstores",
    value: "Free Book + Coffee",
    earnedBy: 420,
    gradient: "from-purple-500 to-pink-600",
    icon: "🏆"
  },
  {
    id: 3,
    name: "Reading Streak Master",
    description: "Complete 30 days of consecutive reading activity",
    rarity: "Uncommon",
    redeemableAt: "Any Partner Store",
    value: "10% Off Purchase",
    earnedBy: 2100,
    gradient: "from-green-500 to-emerald-600",
    icon: "📅"
  },
  {
    id: 4,
    name: "Genre Explorer",
    description: "Read and review books from 5 different genres",
    rarity: "Common",
    redeemableAt: "Online Bookstores",
    value: "$5 Discount",
    earnedBy: 3800,
    gradient: "from-blue-500 to-cyan-600",
    icon: "🗺️"
  }
];

const recentRedemptions = [
  { user: "Alex K.", item: "Golden Bookmark", store: "Barnes & Noble", time: "2 hours ago" },
  { user: "Maria S.", item: "Community Champion", store: "The Book Nook", time: "5 hours ago" },
  { user: "James R.", item: "Reading Streak", store: "Amazon Books", time: "1 day ago" }
];

const NFTShowcase = () => {
  return (
    <section className="py-16 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Earn Phygital
            <span className="bg-gradient-gold bg-clip-text text-transparent"> NFT Rewards</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Your reading engagement translates into valuable NFT tokens that unlock real-world rewards 
            at our partner bookstores. From discounts to exclusive merchandise and events.
          </p>
        </div>

        {/* NFT Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {nftRewards.map((nft) => (
            <Card key={nft.id} className="group hover:shadow-glow transition-all duration-500 cursor-pointer overflow-hidden">
              <CardHeader className="pb-4">
                <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${nft.gradient} flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {nft.icon}
                </div>
                <div className="text-center space-y-2">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {nft.name}
                  </CardTitle>
                  <Badge 
                    variant={nft.rarity === 'Epic' ? 'default' : nft.rarity === 'Rare' ? 'secondary' : 'outline'}
                    className="text-xs"
                  >
                    {nft.rarity}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {nft.description}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="font-medium">{nft.redeemableAt}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Gift className="w-4 h-4 text-secondary" />
                    <span className="font-medium text-secondary">{nft.value}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Star className="w-4 h-4" />
                    <span>{nft.earnedBy.toLocaleString()} earned</span>
                  </div>
                </div>

                <Button 
                  size="sm" 
                  className="w-full bg-gradient-primary text-primary-foreground hover:shadow-elegant transition-all duration-300"
                >
                  Learn How to Earn
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Redemptions */}
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span>Recent Redemptions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentRedemptions.map((redemption, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-literary rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-primary-foreground">
                          {redemption.user.split(' ')[0][0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          <span className="text-primary">{redemption.user}</span> redeemed{' '}
                          <span className="font-semibold">{redemption.item}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">at {redemption.store}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{redemption.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                  View All Redemptions
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default NFTShowcase;