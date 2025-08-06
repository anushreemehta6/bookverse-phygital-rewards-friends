import BookVerseHeader from "@/components/BookVerseHeader";
import HeroSection from "@/components/HeroSection";
import SocialFeed from "@/components/SocialFeed";
import GenreCommunities from "@/components/GenreCommunities";
import NFTShowcase from "@/components/NFTShowcase";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <BookVerseHeader />
      <HeroSection />
      <SocialFeed />
      <GenreCommunities />
      <NFTShowcase />
    </div>
  );
};

export default Index;
