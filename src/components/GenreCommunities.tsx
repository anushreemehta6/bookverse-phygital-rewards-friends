import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Calendar, Sparkles } from "lucide-react";

const communities = [
  {
    id: 1,
    name: "Sci-Fi Universe",
    description: "Explore futuristic worlds and cutting-edge science fiction",
    members: 3420,
    posts: 892,
    trending: true,
    color: "from-blue-500 to-purple-600",
    icon: "🚀",
    recentEvent: "Book Club: Foundation Series"
  },
  {
    id: 2,
    name: "Mystery & Thriller",
    description: "Unravel mysteries and discuss page-turning thrillers",
    members: 2890,
    posts: 1200,
    trending: false,
    color: "from-red-500 to-orange-600",
    icon: "🔍",
    recentEvent: "Author Q&A with Gillian Flynn"
  },
  {
    id: 3,
    name: "Fantasy Realm",
    description: "Magic, dragons, and epic adventures await",
    members: 4150,
    posts: 1500,
    trending: true,
    color: "from-purple-500 to-pink-600",
    icon: "🐉",
    recentEvent: "Brandon Sanderson Reading"
  },
  {
    id: 4,
    name: "Literary Fiction",
    description: "Thought-provoking narratives and beautiful prose",
    members: 2100,
    posts: 650,
    trending: false,
    color: "from-green-500 to-teal-600",
    icon: "📖",
    recentEvent: "Poetry Month Celebration"
  },
  {
    id: 5,
    name: "Romance Readers",
    description: "Love stories that make your heart flutter",
    members: 3800,
    posts: 1800,
    trending: true,
    color: "from-pink-500 to-rose-600",
    icon: "💕",
    recentEvent: "Valentine's Day Book Exchange"
  },
  {
    id: 6,
    name: "Non-Fiction Hub",
    description: "Real stories, biographies, and educational content",
    members: 1950,
    posts: 420,
    trending: false,
    color: "from-indigo-500 to-blue-600",
    icon: "📚",
    recentEvent: "Biography Book Discussion"
  }
];

const GenreCommunities = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Discover Your
            <span className="bg-gradient-literary bg-clip-text text-transparent"> Reading Tribe</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join genre-specific communities where passionate readers share recommendations, 
            host book clubs, and earn exclusive NFT rewards together.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {communities.map((community) => (
            <Card key={community.id} className="group hover:shadow-book transition-all duration-300 cursor-pointer">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${community.color} flex items-center justify-center text-2xl shadow-lg`}>
                    {community.icon}
                  </div>
                  {community.trending && (
                    <Badge className="bg-gradient-gold text-secondary-foreground">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Trending
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {community.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {community.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{community.members.toLocaleString()} members</span>
                  </div>
                  <div className="text-muted-foreground">
                    {community.posts} posts this week
                  </div>
                </div>

                {/* Recent Event */}
                <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{community.recentEvent}</span>
                </div>

                {/* Join Button */}
                <Button 
                  className="w-full bg-gradient-primary text-primary-foreground hover:shadow-glow transition-all duration-300 group"
                  onClick={() => window.location.href = '/community'}
                >
                  Join Community
                  <Sparkles className="w-4 h-4 ml-2 group-hover:animate-pulse" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10">
            Browse All Communities
          </Button>
        </div>
      </div>
    </section>
  );
};

export default GenreCommunities;