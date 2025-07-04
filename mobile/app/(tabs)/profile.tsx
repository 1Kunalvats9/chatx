import EditProfileModal from "@/components/EditProfileModal";
import PostsList from "@/components/PostsList";
import SignOutButton from "@/components/SignOutButton";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePosts } from "@/hooks/usePosts";
import { useProfile } from "@/hooks/useProfile";
import { Feather } from "@expo/vector-icons";
import { format } from "date-fns";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import { useApiClient, userApi } from "../../utils/api";

const ProfileScreens = () => {
  const route = useRoute();
  // @ts-ignore
  const username = route.params?.username as string | undefined;
  const { currentUser, isLoading } = useCurrentUser();
  const insets = useSafeAreaInsets();

  const {
    posts: userPosts,
    refetch: refetchPosts,
    isLoading: isRefetching,
  } = usePosts(username || currentUser?.username);

  const {
    isEditModalVisible,
    openEditModal,
    closeEditModal,
    formData,
    saveProfile,
    updateFormField,
    isUpdating,
    refetch: refetchProfile,
    profileData,
    isProfileLoading,
  } = useProfile(username);

  const api = useApiClient();
  const followMutation = useMutation({
    mutationFn: (targetUserId: string) => userApi.followUser(api, targetUserId),
    onSuccess: () => {
      refetchProfile();
    },
  });

  if (isLoading || isProfileLoading) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <ActivityIndicator size="large" color="#1DA1F2" />
      </View>
    );
  }

  const isOwnProfile = !username || username === currentUser?.username;
  const isFollowing = currentUser?.following?.includes(profileData._id);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <View>
          <Text className="text-xl font-bold text-gray-900">
            {profileData.firstName} {profileData.lastName}
          </Text>
          <Text className="text-sm text-gray-500">{userPosts.length} Posts</Text>
        </View>
        {isOwnProfile ? <SignOutButton /> : null}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              refetchProfile();
              refetchPosts();
            }}
            tintColor="#1DA1F2"
          />
        }
      >
        <Image
          source={{
            uri:
              profileData.bannerImage ||
              "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop",
          }}
          className="w-full h-48"
          resizeMode="cover"
        />

        <View className="px-4 pb-4 border-b border-gray-100">
          <View className="flex-row items-end justify-between mb-4 -mt-16">
            <Image
              source={{ uri: profileData.profilePicture }}
              className="w-32 h-32 border-4 border-white rounded-full"
            />
            {isOwnProfile ? (
              <TouchableOpacity
                className="px-6 py-2 border border-gray-300 rounded-full"
                onPress={openEditModal}
              >
                <Text className="font-semibold text-gray-900">Edit profile</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                className={`px-6 py-2 rounded-full ${isFollowing ? "bg-gray-200" : "bg-blue-500"}`}
                onPress={() => followMutation.mutate(profileData._id)}
                disabled={followMutation.isPending}
              >
                <Text className={`font-semibold ${isFollowing ? "text-gray-900" : "text-white"}`}>
                  {isFollowing ? "Following" : "Follow"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View className="mb-4">
            <View className="flex-row items-center mb-1">
              <Text className="mr-1 text-xl font-bold text-gray-900">
                {profileData.firstName} {profileData.lastName}
              </Text>
              <Feather name="check-circle" size={20} color="#1DA1F2" />
            </View>
            <Text className="mb-2 text-gray-500">@{profileData.username}</Text>
            <Text className="mb-3 text-gray-900">{profileData.bio}</Text>

            <View className="flex-row items-center mb-2">
              <Feather name="map-pin" size={16} color="#657786" />
              <Text className="ml-2 text-gray-500">{profileData.location}</Text>
            </View>

            <View className="flex-row items-center mb-3">
              <Feather name="calendar" size={16} color="#657786" />
              <Text className="ml-2 text-gray-500">
                Joined {format(new Date(profileData.createdAt), "MMMM yyyy")}
              </Text>
            </View>

            <View className="flex-row">
              <TouchableOpacity className="mr-6">
                <Text className="text-gray-900">
                  <Text className="font-bold">{profileData.following?.length}</Text>
                  <Text className="text-gray-500"> Following</Text>
                </Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text className="text-gray-900">
                  <Text className="font-bold">{profileData.followers?.length}</Text>
                  <Text className="text-gray-500"> Followers</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <PostsList username={profileData?.username} />
      </ScrollView>

      <EditProfileModal
        isVisible={isEditModalVisible}
        onClose={closeEditModal}
        formData={formData}
        saveProfile={saveProfile}
        updateFormField={updateFormField}
        isUpdating={isUpdating}
      />
    </SafeAreaView>
  );
};

export default ProfileScreens;
