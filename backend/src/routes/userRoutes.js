import express from 'express';

import {
  getUserProfile,
  getUserServices,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/:id", getUserProfile);

router.get("/:id/services", getUserServices);

export default router;