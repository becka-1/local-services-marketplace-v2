import express from 'express';
import upload from '../middleware/updload.js';
import { verifyToken } from '../middleware/authMiddleware.js';

import {
  getAllServices,
  getServiceById,
  createService,
  getServiceImages,
  getServiceImage,
  updateService,
  deleteService,
  deleteServiceImage,
  getFeaturedServices,
} from "../controllers/serviceController.js";

const router = express.Router();


// =========================
// Services
// =========================

router.get("/", getAllServices);

router.get("/featured", getFeaturedServices);

router.get("/:id", getServiceById);

router.post(
  "/",
  verifyToken,
  upload.array("images", 5),
  createService
);

router.patch(
  "/:id",
  verifyToken,
  upload.array("images", 5),
  updateService
);

router.delete(
  "/:id",
  verifyToken,
  deleteService
);


// =========================
// Service Images
// =========================

router.get(
  "/:id/images",
  getServiceImages
);

router.get(
  "/:id/images/:imageId",
  getServiceImage
);

router.delete(
  "/:id/images/:imageId",
  verifyToken,
  deleteServiceImage
);


export default router;