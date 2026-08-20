import express from 'express';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';
import { 
  getAdminStats,
  getAllUsersAdmin, 
  getUserDetails,
  updateUserRole,
  deleteUser,
  getAllServicesAdmin,
  getAllRequestsAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllReports,
  updateReportStatus
} from '../controllers/adminController.js';

const router = express.Router();

router.use(verifyToken, isAdmin);

// Stats
router.get('/stats', getAdminStats);

// Users
router.get('/users', getAllUsersAdmin);
router.get('/users/:id', getUserDetails);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Services & Requests
router.get('/services', getAllServicesAdmin);
router.get('/requests', getAllRequestsAdmin);

// Categories
router.post('/categories', createCategory);
router.patch('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Reports
router.get('/reports', getAllReports);
router.patch('/reports/:id/status', updateReportStatus);

export default router;
