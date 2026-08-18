import express from 'express';
import upload from '../middleware/updload.js';

import {
  getAllServices,
  getServiceById,
  createService,
  getServiceImages,
  getServiceImage,
  updateService,
  deleteService,
  deleteServiceImage,
} from "../controllers/serviceController.js";

const router = express.Router();


// =========================
// Services
// =========================

router.get("/", getAllServices);

router.get("/:id", getServiceById);

router.post(
  "/",
  upload.array("images", 5),
  createService
);

router.patch(
  "/:id",
  upload.array("images", 5),
  updateService
);

router.delete(
  "/:id",
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
  deleteServiceImage
);


export default router;