const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Multer adds req.files; for JSON-only posts, upload.none() prevents body parse issues
const uploadOrNone = (req, res, next) => {
    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('multipart/form-data')) {
        return upload.array('media', 5)(req, res, next);
    }
    next();
};
const {
    getFeed,
    createPost,
    getPost,
    updatePost,
    deletePost,
    toggleLike,
    addComment,
    toggleSave
} = require('../controllers/postController');

router.get('/', auth, getFeed);
router.post('/', auth, uploadOrNone, createPost);
router.get('/:id', auth, getPost);
router.put('/:id', auth, updatePost);
router.delete('/:id', auth, deletePost);
router.post('/:id/like', auth, toggleLike);
router.post('/:id/comment', auth, addComment);
router.post('/:id/save', auth, toggleSave);

module.exports = router;
