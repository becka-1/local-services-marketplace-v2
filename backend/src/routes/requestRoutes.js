import express from 'express';
import {
  createRequest,
  getRequestsByRequester,
  getRequestsByProvider,
  getRequestById,
  updateRequest,
  deleteRequest,
} from '../controllers/requestController.js';

const router = express.Router();

router.post("/", createRequest);
router.get("/requester/:userId", getRequestsByRequester);
router.get("/provider/:userId", getRequestsByProvider);
router.get("/:id", getRequestById);
router.patch("/:id", updateRequest);
router.delete("/:id", deleteRequest);

export default router;
