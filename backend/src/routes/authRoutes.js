import express from 'express';
import { registerRequest, registerConfirm, login, logout, getMe, googleLogin } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register/request', registerRequest);
router.post('/register/confirm', registerConfirm);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/logout', logout);
router.get('/me', verifyToken, getMe);

export default router;
