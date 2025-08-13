import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, BookOpen, Star, Bookmark } from "lucide-react";

const mockPosts = [
  {
    id: 1,
    user: {
      name: "Sarah Chen",
      avatar: "/placeholder.svg",
      rank: "Literary Explorer"
    },
    book: {
      title: "The Seven Husbands of Evelyn Hugo",
      author: "Taylor Jenkins Reid",
      rating: 5,
      cover: "/placeholder.svg"
    },
    content: "Just finished this masterpiece! The storytelling is absolutely incredible. The way Jenkins Reid weaves through decades of Hollywood glamour while exploring themes of love, ambition, and identity is pure brilliance. 📚✨",
    timestamp: "2 hours ago",
    likes: 42,
    comments: 8,
    nftEarned: true,
    genre: "Fiction"
  },
  {
    id: 2,
    user: {
      name: "Marcus Rivera",
      avatar: "/placeholder.svg",
      rank: "Genre Master"
    },
    book: {
      title: "Project Hail Mary",
      author: "Andy Weir",
      rating: 4,
      cover: "/placeholder.svg"
    },
    content: "Science fiction at its finest! Weir's blend of humor and hard science creates such an engaging read. The friendship that develops is unexpectedly heartwarming. Perfect for both sci-fi lovers and newcomers to the genre.",
    timestamp: "5 hours ago",
    likes: 38,
    comments: 12,
    nftEarned: false,
    genre: "Sci-Fi"
  },
  {
    id: 3,
    user: {
      name: "Elena Kowalski",
      avatar: "/placeholder.svg",
      rank: "Community Builder"
    },
    book: {
      title: "Klara and the Sun",
      author: "Kazuo Ishiguro",
      rating: 4,
      cover: "/placeholder.svg"
    },
    content: "Ishiguro's exploration of consciousness and love through an AI's perspective is hauntingly beautiful. This book will stay with me for a long time. The prose is elegant and the themes are deeply moving.",
    timestamp: "1 day ago",
    likes: 56,
    comments: 15,
    nftEarned: true,
    genre: "Literary Fiction"
  }
];

const SocialFeed = () => {
  return (
    <section className="py-16 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Latest from the 
            <span className="bg-gradient-literary bg-clip-text text-transparent"> Community</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover what fellow readers are sharing, reviewing, and discussing in our vibrant literary community.
          </p>
        </div>

       
          <div className="max-w-2xl mx-auto space-y-6 ">
          {mockPosts.map((post) => (
            <Card key={post.id} className="shadow-elegant hover:shadow-book transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={post.user.avatar} />
                      <AvatarFallback>{post.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-sm">{post.user.name}</h3>
                      <p className="text-xs text-muted-foreground">{post.user.rank} • {post.timestamp}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {post.genre}
                    </Badge>
                    {post.nftEarned && (
                      <Badge className="bg-gradient-gold text-secondary-foreground text-xs">
                        NFT Earned!
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Book Info */}
                <div className="flex space-x-4 p-4 bg-muted/50 rounded-lg">
                  <div className="w-16 h-20 bg-gradient-literary rounded flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{post.book.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">by {post.book.author}</p>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < post.book.rating ? 'text-secondary fill-current' : 'text-muted-foreground/30'}`} 
                        />
                      ))}
                      <span className="text-sm text-muted-foreground ml-2">{post.book.rating}/5</span>
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <p className="text-sm leading-relaxed">{post.content}</p>

                {/* Engagement Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-500 transition-colors">
                      <Heart className="w-4 h-4 mr-1" />
                      {post.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary transition-colors">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {post.comments}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-accent transition-colors">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-secondary transition-colors">
                    <Bookmark className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      
       

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10">
            View All Posts
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SocialFeed;