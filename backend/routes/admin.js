const express = require('express');
const router = express.Router();
const { getPlatformStats } = require('../controllers/adminController');
const { getAllUsers, deleteUser, updateUserRole } = require('../controllers/userController');
const { getGyms, deleteGym } = require('../controllers/gymController');
const { auth, authorize } = require('../middleware/auth');

// All admin routes require admin role
router.use(auth, authorize('admin'));

// GET /api/admin/stats
router.get('/stats', getPlatformStats);

// Users
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Gyms
router.get('/gyms', getGyms);
router.delete('/gyms/:id', deleteGym);

module.exports = router;
