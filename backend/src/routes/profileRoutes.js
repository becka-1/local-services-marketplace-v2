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
  upload.single("profile_picture"),
  updateProfile
);

router.delete(
  "/:id/profile-picture",
  deleteProfilePicture
);

router.post(
  "/:id/social-links",
  addSocialLink
);

router.delete(
  "/:id/social-links/:socialId",
  deleteSocialLink
);

export default router;