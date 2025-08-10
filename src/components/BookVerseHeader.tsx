import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, BookOpen, Users, Sparkles, Wallet, Award } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { useNavigate } from "react-router-dom";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const BookVerseHeader = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        setWalletAddress(accounts[0]);
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    } else {
      alert('Please install MetaMask to connect your wallet');
    }
  };

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
          {user ? (
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span>3 NFTs</span>
              </Badge>
              <Button 
                onClick={() => navigate('/dashboard')}
                variant="outline"
              >
                Dashboard
              </Button>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>
                    {user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {user.email?.split('@')[0]}
                </span>
              </div>
            </div>
          ) : (
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Join BookVerse
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default BookVerseHeader;