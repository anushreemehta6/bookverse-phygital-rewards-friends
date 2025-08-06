import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, BookOpen, Users, Sparkles } from "lucide-react";

const BookVerseHeader = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold bg-gradient-literary bg-clip-text text-transparent">
            BookVerse
          </span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Button variant="ghost" className="text-foreground hover:text-primary">
            <Users className="w-4 h-4 mr-2" />
            Communities
          </Button>
          <Button variant="ghost" className="text-foreground hover:text-primary">
            <Sparkles className="w-4 h-4 mr-2" />
            NFT Collection
          </Button>
          <Button variant="ghost" className="text-foreground hover:text-primary">
            Discover
          </Button>
        </nav>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-gradient-gold text-secondary-foreground">
                12 NFTs
              </Badge>
              <Avatar className="w-8 h-8">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" onClick={() => setIsAuthenticated(true)}>
                Sign In
              </Button>
              <Button className="bg-gradient-primary text-primary-foreground hover:shadow-glow transition-all duration-300">
                Join BookVerse
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default BookVerseHeader;