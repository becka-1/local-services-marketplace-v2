import express from 'express';

import {
  getProfile,
  getProfilePicture,
  updateProfile,
  deleteProfilePicture,
  addSocialLink,
  deleteSocialLink
} from "../controllers/profileController.js";

import upload from '../middleware/updload.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get(
  "/:id/profile-picture",
  getProfilePicture
);

router.get(
  "/:id",
  getProfile
);

router.put(
  "/:id",
  verifyToken,
  upload.single("profile_picture"),
  updateProfile
);

router.delete(
  "/:id/profile-picture",
  verifyToken,
  deleteProfilePicture
);

router.post(
  "/:id/social-links",
  verifyToken,
  addSocialLink
);

router.delete(
  "/:id/social-links/:socialId",
  verifyToken,
  deleteSocialLink
);

export default router;