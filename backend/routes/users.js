const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, updateProfilePhoto, updateCoverPhoto, getAllUsers, deleteUser, updateUserLocation } = require('../controllers/userController');
const { auth, authorize } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

// GET /api/users/profile
router.get('/profile', auth, getProfile);

// PUT /api/users/profile
router.put('/profile', auth, updateProfile);

// PUT /api/users/profile/photo (multipart)
router.put('/profile/photo', auth, (req, res, next) => {
    uploadSingle('photo')(req, res, (err) => { if (err) return next(err); next(); });
}, updateProfilePhoto);

// PUT /api/users/profile/cover (multipart)
router.put('/profile/cover', auth, (req, res, next) => {
    uploadSingle('cover')(req, res, (err) => { if (err) return next(err); next(); });
}, updateCoverPhoto);

// PUT /api/users/location  (saves GPS coordinates)
router.put('/location', auth, updateUserLocation);

// GET /api/users (admin only)
router.get('/', auth, authorize('admin'), getAllUsers);

// DELETE /api/users/:id (admin only)
router.delete('/:id', auth, authorize('admin'), deleteUser);

module.exports = router;
