// import React, { useState, useEffect } from 'react';
// import { useAuth } from '@/components/auth/AuthContext';
// import { supabase } from '@/integrations/supabase/client';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Textarea } from '@/components/ui/textarea';
// import { Badge } from '@/components/ui/badge';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Input } from '@/components/ui/input';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Progress } from '@/components/ui/progress';
// import { 
//   Heart, 
//   MessageCircle, 
//   Share2, 
//   Send, 
//   Users, 
//   BookOpen,
//   Star,
//   Award,
//   Clock,
//   Search,
//   Plus,
//   Home,
//   Trophy,
//   Target
// } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import { useToast } from '@/hooks/use-toast';

// interface CommunityPost {
//   id: string;
//   content: string;
//   created_at: string;
//   user_id: string;
//   likes_count: number;
//   comments_count: number;
//   book_title?: string | null;
//   book_author?: string | null;
//   rating?: number | null;
//   post_type: 'general' | 'review' | 'recommendation';
//   profiles: {
//     username: string | null;
//     display_name: string | null;
//     avatar_url: string | null;
//     total_nfts_earned: number | null;
//   };
//   is_liked?: boolean;
// }

// interface UserProfile {
//   username: string | null;
//   display_name: string | null;
//   total_reviews: number | null;
//   total_nfts_earned: number | null;
//   community_points: number | null;
//   reading_streak: number | null;
//   total_likes_received: number | null;
//   total_comments_received: number | null;
// }

// interface Community {
//   id: string;
//   name: string;
//   description: string | null;
//   icon: string | null;
//   color_gradient: string | null;
//   member_count: number;
//   is_joined?: boolean;
// }

// const Community = () => {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const { toast } = useToast();
  
//   // State management
//   const [posts, setPosts] = useState<CommunityPost[]>([]);
//   const [communities, setCommunities] = useState<Community[]>([]);
//   const [newPost, setNewPost] = useState('');
//   const [postType, setPostType] = useState<'general' | 'review' | 'recommendation'>('general');
//   const [bookTitle, setBookTitle] = useState('');
//   const [bookAuthor, setBookAuthor] = useState('');
//   const [rating, setRating] = useState<number>(5);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [activeTab, setActiveTab] = useState('all');
//   const [loading, setLoading] = useState(true);
//   const [posting, setPosting] = useState(false);
//   const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

//   // Mock data for development
//   const mockCommunities: Community[] = [
//     { id: '1', name: "Sci-Fi Universe", description: "Explore futuristic worlds", icon: "🚀", color_gradient: "from-blue-500 to-purple-600", member_count: 3420 },
//     { id: '2', name: "Fantasy Realm", description: "Magic and adventures", icon: "🐉", color_gradient: "from-purple-500 to-pink-600", member_count: 4150 },
//     { id: '3', name: "Mystery & Thriller", description: "Unravel mysteries", icon: "🔍", color_gradient: "from-red-500 to-orange-600", member_count: 2890 },
//     { id: '4', name: "Romance Readers", description: "Love stories", icon: "💕", color_gradient: "from-pink-500 to-rose-600", member_count: 3800 }
//   ];

//   const mockPosts: CommunityPost[] = [
//     {
//       id: '1',
//       content: "Just finished 'The Seven Husbands of Evelyn Hugo' and I'm absolutely blown away! 📚✨ The storytelling is incredible!",
//       post_type: 'review',
//       book_title: 'The Seven Husbands of Evelyn Hugo',
//       book_author: 'Taylor Jenkins Reid',
//       rating: 5,
//       likes_count: 24,
//       comments_count: 8,
//       created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
//       user_id: 'user1',
//       profiles: {
//         username: 'bookworm_sarah',
//         display_name: 'Sarah Chen',
//         avatar_url: '/placeholder.svg',
//         total_nfts_earned: 3
//       }
//     },
//     {
//       id: '2',
//       content: "Looking for sci-fi recommendations! I loved Project Hail Mary. What are your favorites? 🚀",
//       post_type: 'recommendation',
//       likes_count: 18,
//       comments_count: 12,
//       created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
//       user_id: 'user2',
//       profiles: {
//         username: 'scifi_explorer',
//         display_name: 'Alex Rivera',
//         avatar_url: '/placeholder.svg',
//         total_nfts_earned: 5
//       }
//     }
//   ];

//   useEffect(() => {
//     if (!user) {
//       navigate('/auth');
//       return;
//     }
//     initializeData();
//   }, [user, navigate]);

//   const initializeData = async () => {
//     await Promise.all([
//       fetchUserProfile(),
//       fetchPosts(),
//       fetchCommunities()
//     ]);
//     setLoading(false);
//   };
//   const fetchUserProfile = async () => {
//     try {
//       const { data, error } = await supabase
//         .from('profiles')
//         .select('*')
//         .eq('user_id', user?.id)
//         .single();
      
//       if (error) {
//         setUserProfile({
//           username: user?.email?.split('@')[0] || 'user',
//           display_name: user?.email?.split('@')[0] || 'User',
//           total_reviews: 0,
//           total_nfts_earned: 0,
//           community_points: 0,
//           reading_streak: 0,
//           total_likes_received: 0,
//           total_comments_received: 0
//         });
//       } else {
//         setUserProfile(data);
//       }
//     } catch (error) {
//       console.error('Error fetching profile:', error);
//     }
//   };

//   const fetchPosts = async () => {
//     try {
//       const { data, error } = await supabase
//         .from('community_posts')
//         .select(`
//           *,
//           profiles:user_id (
//             username,
//             display_name,
//             avatar_url,
//             total_nfts_earned
//           )
//         `)
//         .order('created_at', { ascending: false })
//         .limit(50);

//       if (error) {
//         setPosts(mockPosts);
//       } else {
//         setPosts(
//           (data || [])
//             .filter(
//               (post: any) =>
//                 post.profiles &&
//                 typeof post.profiles === 'object' &&
//                 !('error' in post.profiles) &&
//                 'username' in post.profiles &&
//                 'display_name' in post.profiles &&
//                 'avatar_url' in post.profiles &&
//                 'total_nfts_earned' in post.profiles
//             )
//             .map((post: any) => ({
//               ...post,
//               profiles: {
//                 username: post.profiles.username,
//                 display_name: post.profiles.display_name,
//                 avatar_url: post.profiles.avatar_url,
//                 total_nfts_earned: post.profiles.total_nfts_earned,
//               },
//             }))
//         );
//       }
//     } catch (error) {
//       setPosts(mockPosts);
//     }
//   };

//   const fetchCommunities = async () => {
//     try {
//       const { data, error } = await supabase
//         .from('communities')
//         .select('*')
//         .eq('is_active', true);

//       if (error) {
//         setCommunities(mockCommunities);
//       } else {
//         setCommunities(data || []);
//       }
//     } catch (error) {
//       setCommunities(mockCommunities);
//     }
//   };

//   const handleSubmitPost = async () => {
//     if (!newPost.trim() || !user) return;

//     setPosting(true);
//     try {
//       const postData = {
//         content: newPost.trim(),
//         user_id: user.id,
//         post_type: postType,
//         book_title: postType === 'review' ? bookTitle : null,
//         book_author: postType === 'review' ? bookAuthor : null,
//         rating: postType === 'review' ? rating : null
//       };

//       try {
//         const { error } = await supabase
//           .from('community_posts')
//           .insert(postData);

//         if (error) throw error;

//         await trackEngagementActivity(postType === 'review' ? 'review' : 'post', postType === 'review' ? 50 : 10);
        
//       } catch (dbError) {
//         const newPostObj: CommunityPost = {
//           id: Date.now().toString(),
//           ...postData,
//           created_at: new Date().toISOString(),
//           likes_count: 0,
//           comments_count: 0,
//           profiles: {
//             username: userProfile?.username || user.email?.split('@')[0] || 'user',
//             display_name: userProfile?.display_name || user.email?.split('@')[0] || 'User',
//             avatar_url: '/placeholder.svg',
//             total_nfts_earned: userProfile?.total_nfts_earned || 0
//           }
//         };
//         setPosts(prev => [newPostObj, ...prev]);
//       }

//       setNewPost('');
//       setBookTitle('');
//       setBookAuthor('');
//       setRating(5);
//       setPostType('general');

//       toast({
//         title: "Success!",
//         description: postType === 'review' 
//           ? "Review posted! You earned 50 community points 🎉" 
//           : "Post shared! You earned 10 points 🎉",
//       });

//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to publish post",
//         variant: "destructive"
//       });
//     } finally {
//       setPosting(false);
//     }
//   };

//   const handleLikePost = async (postId: string) => {
//     if (!user) return;

//     try {
//       setPosts(prev => prev.map(post => 
//         post.id === postId 
//           ? { 
//               ...post, 
//               likes_count: post.is_liked ? post.likes_count - 1 : post.likes_count + 1,
//               is_liked: !post.is_liked 
//             }
//           : post
//       ));

//       try {
//         const { data: existingLike } = await supabase
//           .from('post_likes')
//           .select('id')
//           .eq('post_id', postId)
//           .eq('user_id', user.id)
//           .single();

//         if (existingLike) {
//           await supabase
//             .from('post_likes')
//             .delete()
//             .eq('post_id', postId)
//             .eq('user_id', user.id);
//         } else {
//           await supabase
//             .from('post_likes')
//             .insert({ post_id: postId, user_id: user.id });
          
//           await trackEngagementActivity('like', 5);
//         }
//       } catch (dbError) {
//         // fallback to local state
//       }

//     } catch (error) {
//       // fallback to local state
//     }
//   };

//   const handleJoinCommunity = async (communityId: string) => {
//     if (!user) return;

//     try {
//       setCommunities(prev => prev.map(community =>
//         community.id === communityId
//           ? { ...community, is_joined: true, member_count: community.member_count + 1 }
//           : community
//       ));

//       try {
//         await supabase
//           .from('community_memberships')
//           .insert({
//             community_id: communityId,
//             user_id: user.id
//           });

//         await trackEngagementActivity('join_community', 25);
//       } catch (dbError) {
//         // fallback to local state
//       }

//       toast({
//         title: "Welcome!",
//         description: "You've joined the community! +25 points earned 🎉"
//       });

//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to join community",
//         variant: "destructive"
//       });
//     }
//   };

//   const trackEngagementActivity = async (activityType: string, points: number) => {
//     try {
//       await supabase.rpc('track_engagement_activity', {
//         user_id: user?.id,
//         activity_type: activityType,
//         points_earned: points,
//         metadata: {}
//       });
//     } catch (error) {
//       // fallback to local state
//     }
//   };

//   const filteredPosts = posts.filter(post => {
//     const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          (post.profiles.display_name || '').toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesTab = activeTab === 'all' || post.post_type === activeTab;
//     return matchesSearch && matchesTab;
//   });

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
//         </div>
//       );
//     };
//   return (
//     <div className="min-h-screen bg-gradient-subtle">
//       {/* Header */}
//       <header className="border-b bg-card/95 backdrop-blur-sm sticky top-0 z-10">
//         <div className="container mx-auto px-4 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <Users className="h-6 w-6 text-primary" />
//               <span className="text-xl font-bold bg-gradient-literary bg-clip-text text-transparent">
//                 BookVerse Community
//               </span>
//             </div>
//             <div className="flex items-center gap-4">
//               <Button variant="outline" onClick={() => navigate('/dashboard')}>
//                 <Award className="w-4 h-4 mr-2" />
//                 Dashboard
//               </Button>
//               <Button variant="outline" onClick={() => navigate('/')}>
//                 <Home className="w-4 h-4 mr-2" />
//                 Home
//               </Button>
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="container mx-auto px-4 py-8">
//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
//           {/* Left Sidebar - User Stats */}
//           <div className="lg:col-span-1 space-y-6">
//             {/* User Profile Card */}
//             <Card className="shadow-elegant">
//               <CardHeader className="pb-3">
//                 <div className="flex items-center gap-3">
//                   <Avatar className="w-12 h-12">
//                     <AvatarImage src="/placeholder.svg" />
//                     <AvatarFallback className="bg-gradient-primary text-primary-foreground">
//                       {userProfile?.display_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
//                     </AvatarFallback>
//                   </Avatar>
//                   <div>
//                     <h3 className="font-semibold">
//                       {userProfile?.display_name || user?.email?.split('@')[0]}
//                     </h3>
//                     <p className="text-sm text-muted-foreground">
//                       @{userProfile?.username || user?.email?.split('@')[0]}
//                     </p>
//                   </div>
//                 </div>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <div className="grid grid-cols-2 gap-3 text-center">
//                   <div>
//                     <p className="text-lg font-bold text-primary">
//                       {userProfile?.total_reviews || 0}
//                     </p>
//                     <p className="text-xs text-muted-foreground">Reviews</p>
//                   </div>
//                   <div>
//                     <p className="text-lg font-bold text-secondary">
//                       {userProfile?.total_nfts_earned || 0}
//                     </p>
//                     <p className="text-xs text-muted-foreground">NFTs</p>
//                   </div>
//                   <div>
//                     <p className="text-lg font-bold text-accent">
//                       {userProfile?.community_points || 0}
//                     </p>
//                     <p className="text-xs text-muted-foreground">Points</p>
//                   </div>
//                   <div>
//                     <p className="text-lg font-bold text-orange-500">
//                       {userProfile?.reading_streak || 0}
//                     </p>
//                     <p className="text-xs text-muted-foreground">Streak</p>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Communities to Join */}
//             <Card className="shadow-elegant">
//               <CardHeader>
//                 <CardTitle className="text-lg">Join Communities</CardTitle>
//                 <CardDescription>Connect with fellow readers</CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 {communities.slice(0, 4).map((community) => (
//                   <div key={community.id} className="flex items-center justify-between p-3 border rounded-lg hover:shadow-sm transition-shadow">
//                     <div className="flex items-center gap-3">
//                       <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${community.color_gradient} flex items-center justify-center`}>
//                         {community.icon}
//                       </div>
//                       <div>
//                         <p className="font-medium text-sm">{community.name}</p>
//                         <p className="text-xs text-muted-foreground">{community.member_count.toLocaleString()} members</p>
//                       </div>
//                     </div>
//                     <Button 
//                       size="sm" 
//                       variant={community.is_joined ? "default" : "outline"}
//                       onClick={() => !community.is_joined && handleJoinCommunity(community.id)}
//                       disabled={community.is_joined}
//                     >
//                       {community.is_joined ? (
//                         <>
//                           <Award className="w-3 h-3 mr-1" />
//                           Joined
//                         </>
//                       ) : (
//                         <>
//                           <Plus className="w-3 h-3 mr-1" />
//                           Join
//                         </>
//                       )}
//                     </Button>
//                   </div>
//                 ))}
//               </CardContent>
//             </Card>
//           </div>

//           {/* Main Feed */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* Create New Post */}
//             <Card className="shadow-elegant">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Send className="h-5 w-5 text-primary" />
//                   Share with the Community
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 {/* Post Type Selection */}
//                 <Tabs value={postType} onValueChange={(value) => setPostType(value as any)}>
//                   <TabsList className="grid w-full grid-cols-3">
//                     <TabsTrigger value="general">
//                       <MessageCircle className="w-4 h-4 mr-2" />
//                       General
//                     </TabsTrigger>
//                     <TabsTrigger value="review">
//                       <Star className="w-4 h-4 mr-2" />
//                       Review
//                     </TabsTrigger>
//                     <TabsTrigger value="recommendation">
//                       <BookOpen className="w-4 h-4 mr-2" />
//                       Recommend
//                     </TabsTrigger>
//                   </TabsList>

//                   <TabsContent value="general" className="space-y-4 mt-4">
//                     <Textarea
//                       placeholder="What's on your mind about books today? Share thoughts, ask questions, or start a discussion..."
//                       value={newPost}
//                       onChange={(e) => setNewPost(e.target.value)}
//                       className="min-h-[120px] resize-none"
//                       maxLength={280}
//                     />
//                   </TabsContent>

//                   <TabsContent value="review" className="space-y-4 mt-4">
//                     <div className="grid grid-cols-2 gap-3">
//                       <Input
//                         placeholder="Book Title"
//                         value={bookTitle}
//                         onChange={(e) => setBookTitle(e.target.value)}
//                       />
//                       <Input
//                         placeholder="Author"
//                         value={bookAuthor}
//                         onChange={(e) => setBookAuthor(e.target.value)}
//                       />
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <span className="text-sm font-medium">Rating:</span>
//                       <div className="flex gap-1">
//                         {[1, 2, 3, 4, 5].map((star) => (
//                           <button
//                             key={star}
//                             onClick={() => setRating(star)}
//                             className="p-1"
//                           >
//                             <Star
//                               className={`w-5 h-5 ${
//                                 star <= rating 
//                                   ? 'text-yellow-400 fill-current' 
//                                   : 'text-gray-300'
//                               }`}
//                             />
//                           </button>
//                         ))}
//                       </div>
//                     </div>
//                     <Textarea
//                       placeholder="Write your book review... What did you think? Would you recommend it?"
//                       value={newPost}
//                       onChange={(e) => setNewPost(e.target.value)}
//                       className="min-h-[120px] resize-none"
//                       maxLength={280}
//                     />
//                   </TabsContent>

//                   <TabsContent value="recommendation" className="space-y-4 mt-4">
//                     <Textarea
//                       placeholder="Recommend a book! Tell the community about a great read they should check out..."
//                       value={newPost}
//                       onChange={(e) => setNewPost(e.target.value)}
//                       className="min-h-[120px] resize-none"
//                       maxLength={280}
//                     />
//                   </TabsContent>
//                 </Tabs>

//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-4">
//                     <span className="text-sm text-muted-foreground">
//                       {newPost.length}/280 characters
//                     </span>
//                     <Badge variant="outline" className="text-xs">
//                       +{postType === 'review' ? '50' : '10'} points
//                     </Badge>
//                   </div>
//                   <Button 
//                     onClick={handleSubmitPost}
//                     disabled={!newPost.trim() || posting || (postType === 'review' && (!bookTitle || !bookAuthor))}
//                     className="bg-gradient-primary text-primary-foreground hover:shadow-glow transition-all duration-300"
//                   >
//                     {posting ? 'Posting...' : 'Post'}
//                     <Send className="w-4 h-4 ml-2" />
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Feed Filters */}
//             <Card className="shadow-sm">
//               <CardContent className="pt-6">
//                 <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
//                   <div className="relative flex-1 max-w-sm">
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
//                     <Input
//                       placeholder="Search posts..."
//                       value={searchTerm}
//                       onChange={(e) => setSearchTerm(e.target.value)}
//                       className="pl-10"
//                     />
//                   </div>
//                   <Tabs value={activeTab} onValueChange={setActiveTab}>
//                     <TabsList>
//                       <TabsTrigger value="all">All Posts</TabsTrigger>
//                       <TabsTrigger value="review">Reviews</TabsTrigger>
//                       <TabsTrigger value="recommendation">Recommendations</TabsTrigger>
//                     </TabsList>
//                   </Tabs>
//                 </div>
//               </CardContent>
//             </Card>
//             {/* Posts Feed */}
//             <div className="space-y-6">
//               {filteredPosts.length === 0 ? (
//                 <Card className="shadow-elegant">
//                   <CardContent className="text-center py-12">
//                     <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
//                     <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
//                     <p className="text-muted-foreground">Be the first to share something with the community!</p>
//                   </CardContent>
//                 </Card>
//               ) : (
//                 filteredPosts.map((post) => (
//                   <Card key={post.id} className="hover:shadow-book transition-all duration-300 group">
//                     <CardContent className="pt-6">
//                       {/* User Info Header */}
//                       <div className="flex items-center gap-3 mb-4">
//                         <Avatar className="w-10 h-10">
//                           <AvatarImage src={post.profiles.avatar_url || '/placeholder.svg'} />
//                           <AvatarFallback className="bg-gradient-literary text-primary-foreground">
//                             {(post.profiles.display_name || post.profiles.username || 'U')[0].toUpperCase()}
//                           </AvatarFallback>
//                         </Avatar>
//                         <div>
//                           <div className="flex items-center gap-2">
//                             <p className="text-sm text-muted-foreground">
//                               {post.profiles.display_name || post.profiles.username || 'Anonymous'}
//                             </p>
//                             {(post.profiles.total_nfts_earned || 0) > 0 && (
//                               <Badge variant="secondary" className="text-xs">
//                                 <Award className="w-3 h-3 mr-1" />
//                                 {post.profiles.total_nfts_earned} NFTs
//                               </Badge>
//                             )}
//                           </div>
//                           <div className="flex items-center gap-2 text-xs text-muted-foreground">
//                             <span>@{post.profiles.username || 'user'}</span>
//                             <span>•</span>
//                             <Clock className="w-3 h-3" />
//                             <span>{new Date(post.created_at).toLocaleDateString()}</span>
//                           </div>
//                         </div>
//                       </div>

//                       {/* Book Info for Reviews */}
//                       {post.post_type === 'review' && post.book_title && (
//                         <div className="mb-4 p-3 bg-muted/50 rounded-lg">
//                           <div className="flex items-center gap-3">
//                             <div className="w-12 h-16 bg-gradient-literary rounded flex items-center justify-center">
//                               <BookOpen className="w-6 h-6 text-primary-foreground" />
//                             </div>
//                             <div>
//                               <h4 className="font-semibold text-sm">{post.book_title}</h4>
//                               <p className="text-xs text-muted-foreground">by {post.book_author}</p>
//                               <div className="flex items-center gap-1 mt-1">
//                                 {[...Array(5)].map((_, i) => (
//                                   <Star
//                                     key={i}
//                                     className={`w-4 h-4 ${
//                                       i < (post.rating || 0)
//                                         ? 'text-yellow-400 fill-current'
//                                         : 'text-gray-300'
//                                     }`}
//                                   />
//                                 ))}
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       )}

//                       {/* Post Content */}
//                       <div className="mb-4">
//                         <p className="text-foreground leading-relaxed whitespace-pre-wrap">
//                           {post.content}
//                         </p>
//                       </div>

//                       {/* Engagement Actions */}
//                       <div className="flex items-center justify-between pt-4 border-t border-border/50">
//                         <div className="flex items-center gap-6">
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => handleLikePost(post.id)}
//                             className={`flex items-center gap-2 transition-colors ${
//                               post.is_liked
//                                 ? 'text-red-500 hover:text-red-600'
//                                 : 'text-muted-foreground hover:text-red-500'
//                             }`}
//                           >
//                             <Heart className={`w-4 h-4 ${post.is_liked ? 'fill-current' : ''}`} />
//                             <span>{post.likes_count}</span>
//                           </Button>
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             className="flex items-center gap-2 text-muted-foreground hover:text-blue-500 transition-colors"
//                           >
//                             <MessageCircle className="w-4 h-4" />
//                             <span>{post.comments_count}</span>
//                           </Button>
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             className="text-muted-foreground hover:text-green-500 transition-colors"
//                           >
//                             <Share2 className="w-4 h-4" />
//                           </Button>
//                         </div>
//                         <Badge
//                           variant={post.post_type === 'review' ? 'default' : 'outline'}
//                           className="text-xs capitalize"
//                         >
//                           {post.post_type}
//                         </Badge>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 ))
//               )}

//               {/* NFT Progress Card */}
//               <Card className="shadow-elegant">
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2 text-lg">
//                     <Award className="h-5 w-5 text-secondary" />
//                     Next NFT Reward
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <div className="text-center">
//                     <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-gold flex items-center justify-center text-2xl mb-3">
//                       🏆
//                     </div>
//                     <h3 className="font-semibold">Community Champion</h3>
//                     <p className="text-sm text-muted-foreground mb-3">
//                       Write 10 quality reviews to unlock
//                     </p>
//                     <div className="space-y-2">
//                       <div className="flex justify-between text-sm">
//                         <span>Progress</span>
//                         <span>{Math.min(((userProfile?.total_reviews || 0) / 10) * 100, 100).toFixed(0)}%</span>
//                       </div>
//                       <Progress value={Math.min(((userProfile?.total_reviews || 0) / 10) * 100, 100)} className="h-2" />
//                       <p className="text-xs text-muted-foreground">
//                         {userProfile?.total_reviews || 0}/10 reviews completed
//                       </p>
//                     </div>
//                   </div>
//                   <div className="space-y-2 text-sm">
//                     <div className="flex items-center justify-between">
//                       <span>Reward Value</span>
//                       <span className="font-semibold text-secondary">$25 Voucher</span>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <span>Redeemable At</span>
//                       <span className="text-muted-foreground">Partner Stores</span>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>

//               {/* Reading Challenge */}
//               <Card className="shadow-elegant">
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2 text-lg">
//                     <Target className="h-5 w-5 text-accent" />
//                     Reading Challenge
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-3">
//                   <div className="text-center">
//                     <p className="text-2xl font-bold text-primary">
//                       {userProfile?.reading_streak || 0}
//                     </p>
//                     <p className="text-sm text-muted-foreground">Day streak</p>
//                   </div>
//                   <div className="space-y-2">
//                     <div className="flex justify-between text-sm">
//                       <span>Goal: 30 days</span>
//                       <span>{Math.min(((userProfile?.reading_streak || 0) / 30) * 100, 100).toFixed(0)}%</span>
//                     </div>
//                     <Progress value={Math.min(((userProfile?.reading_streak || 0) / 30) * 100, 100)} className="h-2" />
//                   </div>
//                   <Button size="sm" variant="outline" className="w-full">
//                     <Clock className="w-4 h-4 mr-2" />
//                     Log Today's Reading
//                   </Button>
//                 </CardContent>
//               </Card>

//               {/* Top Contributors */}
//               <Card className="shadow-elegant">
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2 text-lg">
//                     <Trophy className="h-5 w-5 text-amber-500" />
//                     Top Contributors
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-3">
//                   {[
//                     { name: "Emma Wilson", points: 2850, nfts: 8, rank: 1 },
//                     { name: "James Rodriguez", points: 2340, nfts: 6, rank: 2 },
//                     { name: "Sophia Kim", points: 1980, nfts: 5, rank: 3 },
//                   ].map((contributor) => (
//                     <div key={contributor.name} className="flex items-center justify-between">
//                       <div className="flex items-center gap-3">
//                         <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
//                           contributor.rank === 1 ? 'bg-yellow-500 text-white' :
//                           contributor.rank === 2 ? 'bg-gray-400 text-white' :
//                           'bg-amber-600 text-white'
//                         }`}>
//                           {contributor.rank}
//                         </div>
//                         <div>
//                           <p className="font-medium text-sm">{contributor.name}</p>
//                           <p className="text-xs text-muted-foreground">
//                             {contributor.points.toLocaleString()} points • {contributor.nfts} NFTs
//                           </p>
//                         </div>
//                       </div>
//                       <Button size="sm" variant="ghost" className="text-xs">
//                         Follow
//                       </Button>
//                     </div>
//                   ))}
//                 </CardContent>
//               </Card>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )};

//   export default Community;

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Send, 
  Users, 
  TrendingUp, 
  BookOpen,
  Star,
  Award,
  Clock,
  Search,
  Plus,
  Home,
  Trophy,
  Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useSharedData } from '@/hooks/useSharedData';

const Community = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, posts, loading, createPost, toggleLike } = useSharedData(user?.id);
  
  // Local state for form and UI
  const [newPost, setNewPost] = useState('');
  const [postType, setPostType] = useState<'general' | 'review' | 'recommendation'>('general');
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [posting, setPosting] = useState(false);

  // Mock communities data
  const communities = [
    { id: '1', name: "Sci-Fi Universe", description: "Explore futuristic worlds", icon: "🚀", color_gradient: "from-blue-500 to-purple-600", member_count: 3420 },
    { id: '2', name: "Fantasy Realm", description: "Magic and adventures", icon: "🐉", color_gradient: "from-purple-500 to-pink-600", member_count: 4150 },
    { id: '3', name: "Mystery & Thriller", description: "Unravel mysteries", icon: "🔍", color_gradient: "from-red-500 to-orange-600", member_count: 2890 },
    { id: '4', name: "Romance Readers", description: "Love stories", icon: "💕", color_gradient: "from-pink-500 to-rose-600", member_count: 3800 }
  ];

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
  }, [user, navigate]);

  const handleSubmitPost = async () => {
    if (!newPost.trim() || !user) return;

    setPosting(true);
    try {
      const result = await createPost(newPost, postType, bookTitle, bookAuthor, rating);
      
      if (result.success) {
        // Reset form
        setNewPost('');
        setBookTitle('');
        setBookAuthor('');
        setRating(5);
        setPostType('general');

        toast({
          title: "Success!",
          description: `Post created! You earned ${result.pointsEarned || 10} points 🎉`
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create post",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error posting:', error);
      toast({
        title: "Error",
        description: "Failed to publish post",
        variant: "destructive"
      });
    } finally {
      setPosting(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user) return;
    await toggleLike(postId);
  };

  const handleJoinCommunity = async (communityId: string) => {
    // Mock community joining for now
    toast({
      title: "Welcome!",
      description: "You've joined the community! +25 points earned 🎉"
    });
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (post.profiles.display_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || post.post_type === activeTab;
    return matchesSearch && matchesTab;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-card/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold bg-gradient-literary bg-clip-text text-transparent">
                BookVerse Community
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                <Award className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button variant="outline" onClick={() => navigate('/')}>
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar - User Stats */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-elegant">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                      {(profile?.display_name || user?.email || 'U')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">
                      {profile?.display_name || user?.email?.split('@')[0] || 'Reader'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      @{profile?.username || user?.email?.split('@')[0] || 'user'}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div>
                    <p className="text-lg font-bold text-primary">{profile?.total_reviews || 0}</p>
                    <p className="text-xs text-muted-foreground">Reviews</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-secondary">{profile?.total_nfts_earned || 0}</p>
                    <p className="text-xs text-muted-foreground">NFTs</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-accent">{profile?.community_points || 0}</p>
                    <p className="text-xs text-muted-foreground">Points</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-orange-500">{profile?.reading_streak || 0}</p>
                    <p className="text-xs text-muted-foreground">Streak</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Communities */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="text-lg">Join Communities</CardTitle>
                <CardDescription>Connect with fellow readers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {communities.map((community) => (
                  <div key={community.id} className="flex items-center justify-between p-3 border rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${community.color_gradient} flex items-center justify-center`}>
                        {community.icon}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{community.name}</p>
                        <p className="text-xs text-muted-foreground">{community.member_count.toLocaleString()} members</p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleJoinCommunity(community.id)}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Join
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-primary" />
                  Share with the Community
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs value={postType} onValueChange={(value) => setPostType(value as any)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="review">Review</TabsTrigger>
                    <TabsTrigger value="recommendation">Recommend</TabsTrigger>
                  </TabsList>

                  <TabsContent value="general" className="space-y-4 mt-4">
                    <Textarea
                      placeholder="What's on your mind about books today?"
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      className="min-h-[120px] resize-none"
                      maxLength={280}
                    />
                  </TabsContent>

                  <TabsContent value="review" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Book Title"
                        value={bookTitle}
                        onChange={(e) => setBookTitle(e.target.value)}
                      />
                      <Input
                        placeholder="Author"
                        value={bookAuthor}
                        onChange={(e) => setBookAuthor(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Rating:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} onClick={() => setRating(star)}>
                            <Star className={`w-5 h-5 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <Textarea
                      placeholder="Write your book review..."
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      className="min-h-[120px] resize-none"
                      maxLength={280}
                    />
                  </TabsContent>

                  <TabsContent value="recommendation" className="space-y-4 mt-4">
                    <Textarea
                      placeholder="Recommend a book!"
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      className="min-h-[120px] resize-none"
                      maxLength={280}
                    />
                  </TabsContent>
                </Tabs>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{newPost.length}/280</span>
                    <Badge variant="outline" className="text-xs">+{postType === 'review' ? '50' : '10'} points</Badge>
                  </div>
                  <Button 
                    onClick={handleSubmitPost}
                    disabled={!newPost.trim() || posting || (postType === 'review' && (!bookTitle || !bookAuthor))}
                    className="bg-gradient-primary text-primary-foreground hover:shadow-glow"
                  >
                    {posting ? 'Posting...' : 'Post'}
                    <Send className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Feed Filters */}
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search posts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                      <TabsTrigger value="all">All Posts</TabsTrigger>
                      <TabsTrigger value="review">Reviews</TabsTrigger>
                      <TabsTrigger value="recommendation">Recommendations</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardContent>
            </Card>

            {/* Posts Feed */}
            <div className="space-y-6">
              {filteredPosts.length === 0 ? (
                <Card className="shadow-elegant">
                  <CardContent className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                    <p className="text-muted-foreground">Be the first to share something!</p>
                  </CardContent>
                </Card>
              ) : (
                filteredPosts.map((post) => (
                  <Card key={post.id} className="hover:shadow-book transition-all duration-300">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={post.profiles.avatar_url || '/placeholder.svg'} />
                            <AvatarFallback className="bg-gradient-literary text-primary-foreground">
                              {(post.profiles.display_name || post.profiles.username || 'U')[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">
                                {post.profiles.display_name || post.profiles.username || 'Anonymous'}
                              </p>
                              {(post.profiles.total_nfts_earned || 0) > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  <Award className="w-3 h-3 mr-1" />
                                  {post.profiles.total_nfts_earned} NFTs
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>@{post.profiles.username || 'user'}</span>
                              <span>•</span>
                              <Clock className="w-3 h-3" />
                              <span>{new Date(post.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant={post.post_type === 'review' ? 'default' : 'outline'} className="text-xs capitalize">
                          {post.post_type}
                        </Badge>
                      </div>

                      {/* Book Info for Reviews */}
                      {post.post_type === 'review' && post.book_title && (
                        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-16 bg-gradient-literary rounded flex items-center justify-center">
                              <BookOpen className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm">{post.book_title}</h4>
                              <p className="text-sm text-muted-foreground">by {post.book_author}</p>
                              {post.rating && (
                                <div className="flex items-center gap-1 mt-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-4 h-4 ${i < post.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Post Content */}
                      <div className="mb-4">
                        <p className="text-foreground leading-relaxed whitespace-pre-wrap">{post.content}</p>
                      </div>

                      {/* Engagement Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <div className="flex items-center gap-6">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLikePost(post.id)}
                            className={`flex items-center gap-2 transition-colors ${
                              post.is_liked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-red-500'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${post.is_liked ? 'fill-current' : ''}`} />
                            <span>{post.likes_count}</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground hover:text-blue-500">
                            <MessageCircle className="w-4 h-4" />
                            <span>{post.comments_count}</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-green-500">
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-yellow-500">
                          <Bookmark className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Community Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Posts</span>
                  <span className="font-semibold">{posts.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Likes</span>
                  <span className="font-semibold">{posts.reduce((sum, post) => sum + post.likes_count, 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Your Points</span>
                  <span className="font-semibold text-secondary">{profile?.community_points || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Award className="h-5 w-5 text-secondary" />
                  Next NFT Reward
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-gold flex items-center justify-center text-2xl mb-3">🏆</div>
                  <h3 className="font-semibold">Review Master</h3>
                  <p className="text-sm text-muted-foreground mb-3">Write 10 reviews to unlock</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.min(((profile?.total_reviews || 0) / 10) * 100, 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={Math.min(((profile?.total_reviews || 0) / 10) * 100, 100)} className="h-2" />
                    <p className="text-xs text-muted-foreground">{profile?.total_reviews || 0}/10 reviews</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;