const express = require('express');
const router = express.Router();
const { createGym, getGyms, getGymById, getNearbyGyms, updateGym, getMyGyms, getGymVisitHistory, deleteGym } = require('../controllers/gymController');
const { auth, authorize } = require('../middleware/auth');

// GET /api/gyms/nearby (must be before /:id)
router.get('/nearby', getNearbyGyms);

// GET /api/gyms (public)
router.get('/', getGyms);

// GET /api/gyms/owner/my-gyms (gym owner)
router.get('/owner/my-gyms', auth, authorize('gymOwner', 'admin'), getMyGyms);

// GET /api/gyms/owner/visit-history (gym owner)
router.get('/owner/visit-history', auth, authorize('gymOwner', 'admin'), getGymVisitHistory);

// GET /api/gyms/:id (public)
router.get('/:id', getGymById);

// POST /api/gyms (gym owner)
router.post('/', auth, authorize('gymOwner', 'admin'), createGym);

// PUT /api/gyms/:id (gym owner)
router.put('/:id', auth, authorize('gymOwner', 'admin'), updateGym);

// DELETE /api/gyms/:id (gym owner deletes own; admin deletes any)
router.delete('/:id', auth, authorize('gymOwner', 'admin'), deleteGym);

module.exports = router;
