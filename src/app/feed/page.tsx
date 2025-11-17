import { useState } from "react";
import Header from "~/components/Header";
import { Heart, MessageCircle, Send, Image as ImageIcon } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

interface Post {
  id: string;
  author: string;
  avatar: string;
  role: "student" | "business" | "traveler";
  content: string;
  image?: string;
  likes: number;
  comments: number;
  timestamp: string;
  liked?: boolean;
}

const SocialFeed = () => {
  const [newPost, setNewPost] = useState("");
  const [posts, setPosts] = useState<Post[]>([
    {
      id: "1",
      author: "Sarah Johnson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      role: "student",
      content: "Just finished leading an amazing tour through the Swiss Alps! The views were absolutely breathtaking. Can't wait for the next adventure! 🏔️",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
      likes: 42,
      comments: 8,
      timestamp: "2 hours ago",
      liked: false,
    },
    {
      id: "2",
      author: "Rome Adventures Co.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rome",
      role: "business",
      content: "Exciting news! We're launching a new sunset tour of the Colosseum. Limited spots available for this unique experience. Book now!",
      likes: 128,
      comments: 23,
      timestamp: "5 hours ago",
      liked: true,
    },
    {
      id: "3",
      author: "Emma Chen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
      role: "traveler",
      content: "Santorini exceeded all my expectations! The sunset cruise was magical. Huge thanks to Greek Island Tours for the incredible experience! ⛵️",
      image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=600&q=80",
      likes: 89,
      comments: 15,
      timestamp: "1 day ago",
      liked: false,
    },
  ]);

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleCreatePost = () => {
    if (!newPost.trim()) return;
    
    const post: Post = {
      id: Date.now().toString(),
      author: "You",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
      role: "student",
      content: newPost,
      likes: 0,
      comments: 0,
      timestamp: "Just now",
      liked: false,
    };
    
    setPosts([post, ...posts]);
    setNewPost("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header userRole="student" />
      
      <main className="container max-w-2xl py-8 px-4">
        {/* Create Post */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Avatar>
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=You" />
                <AvatarFallback>Y</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <Textarea
                  placeholder="Share your experience..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="sm">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Add Image
                  </Button>
                  <Button onClick={handleCreatePost} variant="gradient">
                    <Send className="w-4 h-4 mr-2" />
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feed */}
        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-4">
                {/* Post Header */}
                <div className="flex items-start gap-3 mb-4">
                  <Avatar>
                    <AvatarImage src={post.avatar} />
                    <AvatarFallback>{post.author[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{post.author}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {post.role}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{post.timestamp}</p>
                  </div>
                </div>

                {/* Post Content */}
                <p className="mb-4 whitespace-pre-wrap">{post.content}</p>

                {/* Post Image */}
                {post.image && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <img
                      src={post.image}
                      alt="Post"
                      className="w-full h-auto"
                    />
                  </div>
                )}

                {/* Post Actions */}
                <div className="flex items-center gap-6 pt-3 border-t">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-2 transition-colors ${
                      post.liked ? "text-accent" : "text-muted-foreground hover:text-accent"
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${post.liked ? "fill-accent" : ""}`} />
                    <span className="text-sm font-medium">{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">{post.comments}</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default SocialFeed;
