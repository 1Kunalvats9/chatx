import Message from '../models/message.model.js';
import User from '../models/user.model.js';
import asyncHandler from 'express-async-handler';
import { getAuth } from '@clerk/express';
import Notification from '../models/notification.model.js';

// Send a message to a user you follow
export const sendMessage = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { userId: receiverId } = req.params;
  const { content } = req.body;

  if (!content) return res.status(400).json({ error: 'Message content required' });

  const sender = await User.findOne({ clerkId: userId });
  const receiver = await User.findById(receiverId);
  if (!sender || !receiver) return res.status(404).json({ error: 'User not found' });

  // Only allow messaging if sender follows receiver
  if (!sender.following.includes(receiverId)) {
    return res.status(403).json({ error: 'You can only message users you follow' });
  }

  const message = await Message.create({
    sender: sender._id,
    receiver: receiver._id,
    content,
  });

  // Create a notification for the receiver
  await Notification.create({
    from: sender._id,
    to: receiver._id,
    type: 'message',
  });

  res.status(201).json({ message });
});

// Get conversation with a user
export const getConversation = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { userId: otherUserId } = req.params;

  const currentUser = await User.findOne({ clerkId: userId });
  if (!currentUser) return res.status(404).json({ error: 'User not found' });

  const messages = await Message.find({
    $or: [
      { sender: currentUser._id, receiver: otherUserId },
      { sender: otherUserId, receiver: currentUser._id },
    ],
  })
    .sort({ createdAt: 1 })
    .populate('sender receiver', 'username firstName lastName profilePicture');

  res.status(200).json({ messages });
});

// Get all conversations for current user
export const getConversations = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const currentUser = await User.findOne({ clerkId: userId });
  if (!currentUser) return res.status(404).json({ error: 'User not found' });

  // Find all users the current user has messaged or received messages from
  const messages = await Message.find({
    $or: [
      { sender: currentUser._id },
      { receiver: currentUser._id },
    ],
  }).sort({ createdAt: -1 });

  // Group by conversation partner
  const conversations = {};
  messages.forEach((msg) => {
    const partnerId = msg.sender.equals(currentUser._id) ? msg.receiver.toString() : msg.sender.toString();
    if (!conversations[partnerId]) conversations[partnerId] = [];
    conversations[partnerId].push(msg);
  });

  res.status(200).json({ conversations });
}); 