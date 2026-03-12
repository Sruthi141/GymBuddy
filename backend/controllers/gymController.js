const Gym = require('../models/Gym');
const User = require('../models/User');
const Notification = require('../models/Notification');
const CollaborationTicket = require('../models/CollaborationTicket');
const { sendVerificationEmail } = require('../services/emailService');

/**
 * @route   POST /api/gyms
 * @desc    Create a new gym (gym owners only)
 * @access  Private/GymOwner
 */const createGym = async (req, res, next) => {
    try {
        const gymData = {
            ...req.body,
            owner: req.user._id
        };

        // Convert latitude/longitude to GeoJSON format if provided
        if (req.body.latitude && req.body.longitude) {
            gymData.location = {
                type: 'Point',
                coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)]
            };
            delete gymData.latitude;
            delete gymData.longitude;
        }

        const gym = await Gym.create(gymData);

        // Notify all users within 10km of the new gym (if coordinates provided)
        if (gym.location && gym.location.coordinates && gym.location.coordinates.length === 2) {
            const [lng, lat] = gym.location.coordinates;
            const radiusInRadians = 10 / 6371; // 10km in radians

            // Find users with coordinates set who are within ~10km
            const nearbyUsers = await User.find({
                'coordinates.latitude': { $ne: null },
                'coordinates.longitude': { $ne: null },
                role: 'user'
            }).select('_id coordinates');

            // Filter by haversine distance (simple approach since User doesn't have 2dsphere)
            const toRad = (deg) => deg * (Math.PI / 180);
            const haversine = (lat1, lng1, lat2, lng2) => {
                const R = 6371;
                const dLat = toRad(lat2 - lat1);
                const dLng = toRad(lng2 - lng1);
                const a = Math.sin(dLat / 2) ** 2 +
                    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
                return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            };

            const usersToNotify = nearbyUsers.filter(u =>
                haversine(u.coordinates.latitude, u.coordinates.longitude, lat, lng) <= 10
            );

            if (usersToNotify.length > 0) {
                const notifications = usersToNotify.map(u => ({
                    user: u._id,
                    type: 'nearby-gym',
                    message: `📍 A new gym "${gym.name}" just opened near you in ${gym.address?.city || 'your area'}! Check it out.`,
                    relatedId: gym._id,
                    relatedModel: 'Gym'
                }));
                await Notification.insertMany(notifications);
            }
        }

        res.status(201).json({
            message: 'Gym created successfully',
            gym
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/gyms/nearby
 * @desc    Get gyms near a given latitude/longitude
 * @access  Public
 */
const getNearbyGyms = async (req, res, next) => {
    try {
        const { lat, lng, radius = 10 } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ message: 'lat and lng query params are required' });
        }

        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        const radiusInMeters = parseFloat(radius) * 1000;

        const gyms = await Gym.find({
            isActive: true,
            location: {
                $near: {
                    $geometry: { type: 'Point', coordinates: [longitude, latitude] },
                    $maxDistance: radiusInMeters
                }
            }
        })
            .populate('owner', 'name email')
            .limit(30);

        // Attach distance (km) to each gym
        const toRad = (deg) => deg * (Math.PI / 180);
        const haversine = (lat1, lng1, lat2, lng2) => {
            const R = 6371;
            const dLat = toRad(lat2 - lat1);
            const dLng = toRad(lng2 - lng1);
            const a = Math.sin(dLat / 2) ** 2 +
                Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
            return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        };

        const gymsWithDistance = gyms.map(gym => {
            const g = gym.toObject();
            if (gym.location && gym.location.coordinates && gym.location.coordinates.length === 2) {
                const [gLng, gLat] = gym.location.coordinates;
                g.distanceKm = parseFloat(haversine(latitude, longitude, gLat, gLng).toFixed(1));
            }
            return g;
        });

        gymsWithDistance.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));

        res.json({
            gyms: gymsWithDistance,
            total: gymsWithDistance.length,
            userLocation: { latitude, longitude }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/gyms
 * @desc    Get all gyms with optional filtering
 * @access  Public
 */
const getGyms = async (req, res, next) => {
    try {
        const { city, facilities, minPrice, maxPrice, page = 1, limit = 20 } = req.query;
        const filter = { isActive: true };

        if (city) {
            filter['address.city'] = { $regex: city, $options: 'i' };
        }
        if (facilities) {
            filter.facilities = { $in: facilities.split(',') };
        }
        if (minPrice || maxPrice) {
            filter['pricing.monthly'] = {};
            if (minPrice) filter['pricing.monthly'].$gte = parseInt(minPrice);
            if (maxPrice) filter['pricing.monthly'].$lte = parseInt(maxPrice);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const gyms = await Gym.find(filter)
            .populate('owner', 'name email')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ rating: -1 });

        const total = await Gym.countDocuments(filter);

        res.json({
            gyms,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/gyms/:id
 * @desc    Get single gym details
 * @access  Public
 */
const getGymById = async (req, res, next) => {
    try {
        const gym = await Gym.findById(req.params.id)
            .populate('owner', 'name email');

        if (!gym) {
            return res.status(404).json({ message: 'Gym not found' });
        }

        res.json({ gym });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   PUT /api/gyms/:id
 * @desc    Update gym details (owner only)
 * @access  Private/GymOwner
 */
const updateGym = async (req, res, next) => {
    try {
        const gym = await Gym.findById(req.params.id);

        if (!gym) {
            return res.status(404).json({ message: 'Gym not found' });
        }

        // Only owner or admin can update
        if (gym.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this gym' });
        }

        const updatedGym = await Gym.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json({
            message: 'Gym updated successfully',
            gym: updatedGym
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/gyms/owner/my-gyms
 * @desc    Get gyms owned by current user
 * @access  Private/GymOwner
 */
const getMyGyms = async (req, res, next) => {
    try {
        const gyms = await Gym.find({ owner: req.user._id });

        // Get visitor stats for each gym
        const gymsWithStats = await Promise.all(
            gyms.map(async (gym) => {
                const activeTickets = await CollaborationTicket.countDocuments({
                    gym: gym._id,
                    status: { $in: ['active', 'completed'] }
                });

                return {
                    ...gym.toObject(),
                    activeCollaborations: activeTickets
                };
            })
        );

        res.json({ gyms: gymsWithStats });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/gyms/owner/visit-history
 * @desc    Get ticket/visit history for all gyms owned by current user
 * @access  Private/GymOwner
 */
const getGymVisitHistory = async (req, res, next) => {
    try {
        // Find all gyms owned by this user
        const gyms = await Gym.find({ owner: req.user._id }).select('_id name address totalVisitors');

        const gymIds = gyms.map(g => g._id);

        // Fetch all tickets for these gyms (active + completed)
        const tickets = await CollaborationTicket.find({
            gym: { $in: gymIds },
            status: { $in: ['active', 'completed'] }
        })
            .populate('participants', 'name profilePicture')
            .populate('gym', 'name')
            .sort({ updatedAt: -1 })
            .limit(50);

        // Build per-gym stats map
        const gymStatsMap = {};
        gyms.forEach(g => {
            gymStatsMap[g._id.toString()] = {
                gymId: g._id,
                gymName: g.name,
                city: g.address?.city,
                totalVisitors: g.totalVisitors || 0,
                completedVisits: 0,
                activeVisits: 0,
                recentTickets: []
            };
        });

        tickets.forEach(t => {
            const key = t.gym?._id?.toString() || t.gym?.toString();
            if (!gymStatsMap[key]) return;
            if (t.status === 'completed') gymStatsMap[key].completedVisits++;
            if (t.status === 'active') gymStatsMap[key].activeVisits++;
            if (gymStatsMap[key].recentTickets.length < 10) {
                gymStatsMap[key].recentTickets.push({
                    _id: t._id,
                    status: t.status,
                    workoutType: t.workoutType,
                    workoutDate: t.workoutDate,
                    participants: t.participants,
                    updatedAt: t.updatedAt
                });
            }
        });

        res.json({
            gymStats: Object.values(gymStatsMap),
            totalTickets: tickets.length
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   DELETE /api/gyms/:id
 * @desc    Delete gym (admin only)
 * @access  Private/Admin
 */
const deleteGym = async (req, res, next) => {
    try {
        const gym = await Gym.findById(req.params.id);
        if (!gym) {
            return res.status(404).json({ message: 'Gym not found' });
        }
        // Gym owners can only delete their own gym; admins can delete any
        if (req.user.role !== 'admin' && gym.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this gym' });
        }
        await Gym.findByIdAndDelete(req.params.id);
        res.json({ message: 'Gym deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createGym,
    getGyms,
    getGymById,
    getNearbyGyms,
    updateGym,
    getMyGyms,
    getGymVisitHistory,
    deleteGym
};

