import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../../utils/api";
import { messageApi, userApi } from "../../utils/api";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Modal,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { User } from "../../types";

// Message type
interface Message {
  _id: string;
  sender: User;
  receiver: User;
  content: string;
  createdAt: string;
}

type ConversationMap = Record<string, Message[]>;

const MessagesScreen = () => {
  const insets = useSafeAreaInsets();
  const api = useApiClient();
  const queryClient = useQueryClient();
  const { currentUser } = useCurrentUser();

  const [searchText, setSearchText] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  // Fetch all conversations
  const { data: conversationsData = {}, isLoading: isConversationsLoading } = useQuery<ConversationMap>({
    queryKey: ["conversations"],
    queryFn: () => messageApi.getConversations(api).then(res => res.data.conversations),
  });

  // Fetch messages for selected conversation
  const { data: messagesData = [], refetch: refetchMessages } = useQuery<Message[]>({
    queryKey: ["messages", selectedUserId],
    queryFn: () => selectedUserId ? messageApi.getConversation(api, selectedUserId).then(res => res.data.messages) : [],
    enabled: !!selectedUserId,
  });

  // Fetch users you follow
  const { data: followingData = [] } = useQuery<User[]>({
    queryKey: ["following"],
    queryFn: () => userApi.getFollowing(api).then(res => res.data.users),
  });

  // Filter following users by search and not already in conversations
  const messagedUserIds = new Set(Object.keys(conversationsData));
  const filteredFollowing = followingData.filter(
    (user) =>
      user._id !== currentUser?._id &&
      !messagedUserIds.has(user._id) &&
      (user.username.toLowerCase().includes(searchText.toLowerCase()) ||
        user.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchText.toLowerCase()))
  );

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => {
      if (!selectedUserId) return Promise.reject();
      return messageApi.sendMessage(api, selectedUserId, content);
    },
    onSuccess: () => {
      setNewMessage("");
      refetchMessages();
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  // Open a conversation
  const openConversation = (userId: string) => {
    setSelectedUserId(userId);
    setIsChatOpen(true);
  };

  const closeChatModal = () => {
    setIsChatOpen(false);
    setSelectedUserId(null);
    setNewMessage("");
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      sendMessageMutation.mutate(newMessage.trim());
    }
  };

  // Prepare conversations list
  const conversationsList = Object.entries(conversationsData).map(([userId, messages]) => {
    const lastMsg = messages[messages.length - 1];
    const partner = lastMsg.sender._id === currentUser?._id ? lastMsg.receiver : lastMsg.sender;
    return {
      userId,
      user: {
        name: partner.firstName + (partner.lastName ? " " + partner.lastName : ""),
        username: partner.username,
        avatar: partner.profilePicture,
        verified: false, // You can update this if you have a verified field
      },
      lastMessage: lastMsg.content,
      time: new Date(lastMsg.createdAt).toLocaleTimeString(),
    };
  });

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <Text className="text-xl font-bold text-gray-900">Messages</Text>
        <TouchableOpacity>
          <Feather name="edit" size={24} color="#1DA1F2" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="px-4 py-3 border-b border-gray-100">
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3">
          <Feather name="search" size={20} color="#657786" />
          <TextInput
            placeholder="Search for people and groups"
            className="flex-1 ml-3 text-base"
            placeholderTextColor="#657786"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* CONVERSATIONS LIST */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
      >
        {/* Show filtered following users for new chat */}
        {searchText.trim() && filteredFollowing.length > 0 && (
          <View className="bg-gray-50 border-b border-gray-100">
            <Text className="px-4 pt-4 pb-2 text-xs text-gray-500">Start a new conversation</Text>
            {filteredFollowing.map((user) => (
              <TouchableOpacity
                key={user._id}
                className="flex-row items-center p-4 border-b border-gray-50 active:bg-gray-100"
                onPress={() => openConversation(user._id)}
              >
                <Image
                  source={{ uri: user.profilePicture }}
                  className="size-12 rounded-full mr-3"
                />
                <View>
                  <Text className="font-semibold text-gray-900">{user.firstName} {user.lastName}</Text>
                  <Text className="text-gray-500 text-sm">@{user.username}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {/* Existing conversations */}
        {conversationsList.map((conversation) => (
          <TouchableOpacity
            key={conversation.userId}
            className="flex-row items-center p-4 border-b border-gray-50 active:bg-gray-50"
            onPress={() => openConversation(conversation.userId)}
          >
            <Image
              source={{ uri: conversation.user.avatar }}
              className="size-12 rounded-full mr-3"
            />
            <View className="flex-1">
              <View className="flex-row items-center justify-between mb-1">
                <View className="flex-row items-center gap-1">
                  <Text className="font-semibold text-gray-900">{conversation.user.name}</Text>
                  {conversation.user.verified && (
                    <Feather name="check-circle" size={16} color="#1DA1F2" className="ml-1" />
                  )}
                  <Text className="text-gray-500 text-sm ml-1">@{conversation.user.username}</Text>
                </View>
                <Text className="text-gray-500 text-sm">{conversation.time}</Text>
              </View>
              <Text className="text-sm text-gray-500" numberOfLines={1}>
                {conversation.lastMessage}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Quick Actions */}
      <View className="px-4 py-2 border-t border-gray-100 bg-gray-50">
        <Text className="text-xs text-gray-500 text-center">
          Tap to open
        </Text>
      </View>

      <Modal visible={isChatOpen} animationType="slide" presentationStyle="pageSheet">
        {selectedUserId && (
          <SafeAreaView className="flex-1">
            {/* Chat Header */}
            {/* You can fetch and display user info here if needed */}

            {/* Chat Messages Area */}
            <ScrollView className="flex-1 px-4 py-4">
              <View className="mb-4">
                <Text className="text-center text-gray-400 text-sm mb-4">
                  This is the beginning of your conversation
                </Text>

                {/* Conversation Messages */}
                {messagesData.map((message: Message) => (
                  <View
                    key={message._id}
                    className={`flex-row mb-3 ${message.sender._id === currentUser?._id ? "justify-end" : ""}`}
                  >
                    {message.sender._id !== currentUser?._id && (
                      <Image
                        source={{ uri: message.sender.profilePicture }}
                        className="size-8 rounded-full mr-2"
                      />
                    )}
                    <View className={`flex-1 ${message.sender._id === currentUser?._id ? "items-end" : ""}`}>
                      <View
                        className={`rounded-2xl px-4 py-3 max-w-xs ${
                          message.sender._id === currentUser?._id ? "bg-blue-500" : "bg-gray-100"
                        }`}
                      >
                        <Text className={message.sender._id === currentUser?._id ? "text-white" : "text-gray-900"}>
                          {message.content}
                        </Text>
                      </View>
                      <Text className="text-xs text-gray-400 mt-1">{new Date(message.createdAt).toLocaleTimeString()}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>

            {/* Message Input */}
            <View className="flex-row items-center px-4 py-3 border-t border-gray-100">
              <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-3 mr-3">
                <TextInput
                  className="flex-1 text-base"
                  placeholder="Start a message..."
                  placeholderTextColor="#657786"
                  value={newMessage}
                  onChangeText={setNewMessage}
                  multiline
                />
              </View>
              <TouchableOpacity
                onPress={sendMessage}
                className={`size-10 rounded-full items-center justify-center ${
                  newMessage.trim() ? "bg-blue-500" : "bg-gray-300"
                }`}
                disabled={!newMessage.trim() || sendMessageMutation.isPending}
              >
                <Feather name="send" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
};

export default MessagesScreen;
