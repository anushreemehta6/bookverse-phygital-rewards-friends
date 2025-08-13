import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Sparkles, ArrowRight } from "lucide-react";
import heroImage from "@/assets/bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${heroImage})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-background/70 to-background/50" />
      </div>

      {/* Content */}
      <div className="relative z-5 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <Badge 
            variant="secondary" 
            className="mb-6 bg-gradient-gold text-secondary-foreground hover:shadow-elegant transition-all duration-300"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Phygital NFT Rewards • Beta Launch
          </Badge>

          {/* Main Heading */}
          <h1 >
           <span className="text-5xl md:text-7xl font-bold mb-6 leading-tight"> Where Books Meet</span> 
            <span className="text-3xl md:text-5xl font-bold mb-6 leading-tight block bg-gradient-literary bg-clip-text text-transparent">
              Community & NFTs
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-l md:text-xl  mb-8 max-w-2xl mx-auto leading-relaxed">
            Join a vibrant social platform for book lovers. Share reviews, discover communities, 
            and earn phygital NFTs redeemable at partner bookstores.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center items-center gap-8 mb-10 text-sm">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="font-semibold">50K+ Books Reviewed</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-accent" />
              <span className="font-semibold">10K+ Active Readers</span>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-secondary" />
              <span className="font-semibold">5K+ NFTs Earned</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-gradient-primary text-primary-foreground hover:shadow-glow transition-all duration-300 group px-8 py-6 text-lg"
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-primary text-primary hover:bg-secondary text-black px-8 py-6 text-lg"
            >
              Explore Communities
            </Button>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      {/* <div className="absolute top-20 left-10 animate-float">
        <div className="w-12 h-12 bg-gradient-gold rounded-lg flex items-center justify-center shadow-elegant">
          <BookOpen className="w-6 h-6 text-secondary-foreground" />
        </div>
      </div>
      <div className="absolute bottom-20 right-10 animate-float" style={{ animationDelay: '1s' }}>
        <div className="w-16 h-16 bg-gradient-literary rounded-full flex items-center justify-center shadow-glow">
          <Sparkles className="w-8 h-8 text-primary-foreground" />
        </div>
      </div> */}
    </section>
  );
};

export default HeroSection;