import express from 'express';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';
import { getAllUsersAdmin, getAllServicesAdmin } from '../controllers/adminController.js';

const router = express.Router();

router.use(verifyToken, isAdmin);

router.get('/users', getAllUsersAdmin);
router.get('/services', getAllServicesAdmin);

export default router;
