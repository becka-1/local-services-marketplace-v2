import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import {
  createRequest,
  getRequestsByRequester,
  getRequestsByProvider,
  getRequestById,
  updateRequest,
  deleteRequest,
} from '../controllers/requestController.js';

const router = express.Router();

router.post("/", verifyToken, createRequest);
router.get("/requester/:userId", verifyToken, getRequestsByRequester);
router.get("/provider/:userId", verifyToken, getRequestsByProvider);
router.get("/:id", verifyToken, getRequestById);
router.patch("/:id", verifyToken, updateRequest);
router.delete("/:id", verifyToken, deleteRequest);

export default router;
