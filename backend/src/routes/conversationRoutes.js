import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import {
  getConversations,
  getMessages,
  createConversation,
  sendMessageRest,
} from '../controllers/conversationController.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getConversations);
router.get('/:id/messages', getMessages);
router.post('/', createConversation);
router.post('/:id/messages', sendMessageRest);

export default router;
