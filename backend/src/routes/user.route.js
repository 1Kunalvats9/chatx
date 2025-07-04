import express from 'express';
import { followUser, getCurrentUser, getUserProfile, syncUser, updateProfile, getFollowingUsers } from '../controllers/user.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import { sendMessage, getConversation, getConversations } from '../controllers/message.controller.js';

const router = express.Router()

router.get('/profile/:username',getUserProfile)
router.post('/sync',protectRoute,syncUser);
router.get('/me',protectRoute,getCurrentUser)
router.put('/profile',protectRoute,updateProfile)
router.post('/follow/:targetUserId',protectRoute,followUser)
router.post('/messages/:userId', protectRoute, sendMessage);
router.get('/messages/:userId', protectRoute, getConversation);
router.get('/messages/conversations', protectRoute, getConversations);
router.get('/following', protectRoute, getFollowingUsers);


export default router