import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePosts } from "@/hooks/usePosts";
import { Post } from "@/types";
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import PostCard from "./PostCard";
import { useState } from "react";
import CommentsModal from "./CommentsModal";

const PostsList = ({ username }: { username?: string }) => {
  // Destructure isLoading and error from both hooks, rename to avoid clashes
  const {
    currentUser,
    isLoading: isCurrentUserLoading,
    error: currentUserError,
    refetch: refetchCurrentUser,
  } = useCurrentUser();

  const {
    posts,
    isLoading: isPostsLoading,
    error: postsError,
    refetch: refetchPosts,
    toggleLike,
    deletePost,
    checkIsLiked,
  } = usePosts(username);

  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const selectedPost = selectedPostId ? posts.find((p: Post) => p._id === selectedPostId) : null;

  // Combine loading states: show loading if either user or posts are loading
  if (isCurrentUserLoading || isPostsLoading) {
    return (
      <View className="items-center p-8">
        <ActivityIndicator size="large" color="#1DA1F2" />
        <Text className="mt-2 text-gray-500">Loading data...</Text>
      </View>
    );
  }

  // Combine error states: show error if either user or posts failed to load
  if (currentUserError || postsError) {
    const errorMessage = currentUserError
      ? "Failed to load user data."
      : "Failed to load posts.";
    return (
      <View className="items-center p-8">
        <Text className="mb-4 text-gray-500">{errorMessage}</Text>
        <TouchableOpacity
          className="px-4 py-2 bg-blue-500 rounded-lg"
          onPress={() => {
            // Refetch based on which data failed, or refetch all
            if (currentUserError) refetchCurrentUser();
            if (postsError) refetchPosts();
          }}
        >
          <Text className="font-semibold text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // IMPORTANT: Ensure currentUser is available after loading.
  // If isLoading is false but currentUser is null, it means the user is not logged in
  // or getCurrentUser returned no data.
  if (!currentUser) {
    return (
      <View className="items-center p-8">
        <Text className="text-gray-500">No user data available. Please log in.</Text>
      </View>
    );
  }

  // If we reach here, both currentUser and posts are loaded (or posts are empty)
  if (posts.length === 0) {
    return (
      <View className="items-center p-8">
        <Text className="text-gray-500">No posts yet</Text>
      </View>
    );
  }

  return (
    <>
      {posts.map((post: Post) => (
        <PostCard
          key={post._id}
          post={post}
          onLike={toggleLike}
          onDelete={deletePost}
          onComment={(post: Post) => setSelectedPostId(post._id)}
          currentUser={currentUser} // This will now be a valid User object
          isLiked={checkIsLiked(post.likes, currentUser)}
        />
      ))}

      <CommentsModal selectedPost={selectedPost} onClose={() => setSelectedPostId(null)} />
    </>
  );
};

export default PostsList;