import { Post, User } from "@/types";
import { formatDate, formatNumber } from "@/utils/formatters";
import { AntDesign, Feather } from "@expo/vector-icons";
import { View, Text, Alert, Image, TouchableOpacity } from "react-native";
import { useMutation } from "@tanstack/react-query";
import { useApiClient, userApi } from "../utils/api";
import { useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onDelete: (postId: string) => void;
  onComment: (post: Post) => void;
  isLiked?: boolean;
  currentUser: User;
  onUserPress?: (user: User) => void;
}

const PostCard = ({ currentUser, onDelete, onLike, post, isLiked, onComment, onUserPress }: PostCardProps) => {
  const isOwnPost = post.user._id === currentUser._id;
  const api = useApiClient();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const isFollowing = currentUser.following?.includes(post.user._id);
  const followMutation = useMutation({
    mutationFn: (targetUserId: string) => userApi.followUser(api, targetUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  const handleDelete = () => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDelete(post._id),
      },
    ]);
  };

  return (
    <View className="border-b border-gray-100 bg-white">
      <View className="flex-row p-4">
        <TouchableOpacity onPress={() => onUserPress && onUserPress(post.user)}>
          <Image
            source={{ uri: post.user.profilePicture || "" }}
            className="w-12 h-12 rounded-full mr-3"
          />
        </TouchableOpacity>

        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <View className="flex-row items-center">
              <TouchableOpacity onPress={() => onUserPress && onUserPress(post.user)}>
                <Text className="font-bold text-gray-900 mr-1">
                  {post.user.firstName} {post.user.lastName}
                </Text>
              </TouchableOpacity>
              <Text className="text-gray-500 ml-1">
                @{post.user.username} · {formatDate(post.createdAt)}
              </Text>
            </View>
            {isOwnPost ? (
              <TouchableOpacity onPress={handleDelete}>
                <Feather name="trash" size={20} color="#657786" />
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  className={`px-3 py-1 rounded-full ml-2 ${isFollowing ? "bg-gray-200" : "bg-blue-500"}`}
                  onPress={() => followMutation.mutate(post.user._id)}
                  disabled={followMutation.isPending}
                >
                  <Text className={`text-xs font-semibold ${isFollowing ? "text-gray-900" : "text-white"}`}>
                    {isFollowing ? "Following" : "Follow"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="ml-2 px-2 py-1 bg-gray-100 rounded-full"
                  onPress={() => navigation.navigate("messages", { userId: post.user._id })}
                >
                  <Feather name="mail" size={18} color="#1DA1F2" />
                </TouchableOpacity>
              </>
            )}
          </View>

          {post.content && (
            <Text className="text-gray-900 text-base leading-5 mb-3">{post.content}</Text>
          )}

          {post.image && (
            <Image
              source={{ uri: post.image }}
              className="w-full h-48 rounded-2xl mb-3"
              resizeMode="cover"
            />
          )}

          <View className="flex-row justify-between max-w-xs">
            <TouchableOpacity className="flex-row items-center" onPress={() => onComment(post)}>
              <Feather name="message-circle" size={18} color="#657786" />
              <Text className="text-gray-500 text-sm ml-2">
                {formatNumber(post.comments?.length || 0)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center">
              <Feather name="repeat" size={18} color="#657786" />
              <Text className="text-gray-500 text-sm ml-2">0</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center" onPress={() => onLike(post._id)}>
              {isLiked ? (
                <AntDesign name="heart" size={18} color="#E0245E" />
              ) : (
                <Feather name="heart" size={18} color="#657786" />
              )}

              <Text className={`text-sm ml-2 ${isLiked ? "text-red-500" : "text-gray-500"}`}>
                {formatNumber(post.likes?.length || 0)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity>
              <Feather name="share" size={18} color="#657786" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default PostCard;
