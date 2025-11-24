"use client";

import { useState } from "react";
import Header from "~/components/Header";
import { Heart, MessageCircle, Send, Image as ImageIcon } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { api } from "~/trpc/react";
import { useSession } from "~/components/AuthProvider";

interface Post {
  id: string;
  content: string;
  likes: number;
  comments: number;
  createdAt: Date;
  updatedAt: Date;
  liked: number | undefined;
  postedBy: {
    id: string;
    name: string;
    image: string | null;
  } | null;
}

const SocialFeed = () => {
  const [newPost, setNewPost] = useState("");
  const [post, postQuery] = api.social.getAllPosts.useSuspenseQuery();
  const [posts, setPosts] = useState<Post[]>(post);
  const {
    data: session,
    isPending, //loading state
    error, //error object
    refetch, //refetch the session
  } = useSession();
  const handleLike = (postId: string) => {
    api.social.likePost.useMutation().mutate(postId);
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
              liked: post.liked ? 0 : 1,
            }
          : post,
      ),
    );
  };

  const handleCreatePost = () => {
    if (newPost.trim() === "") return;

    api.social.createPost.useMutation().mutate({content: newPost}, {
      onSuccess: (createdPost) => {
        setPosts((prevPosts) => [{...createdPost!, liked: 0, likes: 0, comments: 0, postedBy: { id: (session?.user.id ?? ""), name: (session?.user.name ?? ""), image: (session?.user.image ?? null) }}!, ...prevPosts]);
      }
    });
    setNewPost("");
  };

  return (
    <>
      
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
                    <AvatarImage src={post.postedBy?.image ?? undefined} />
                    <AvatarFallback>{post.postedBy?.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{post.postedBy?.name}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{post.updatedAt.toLocaleString()}</p>
                  </div>
                </div>

                {/* Post Content */}
                <p className="mb-4 whitespace-pre-wrap">{post.content}</p>

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
    </>
  );
};

export default SocialFeed;
