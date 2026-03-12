const Post = require('../models/Post');
const User = require('../models/User');

/**
 * GET /api/posts - Feed (paginated)
 */
const getFeed = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);
        const skip = (page - 1) * limit;
        const type = req.query.type;

        const query = { status: 'active' };
        if (type) query.type = type;

        const posts = await Post.find(query)
            .populate('author', 'name profilePhoto profilePicture')
            .populate('gym', 'name address')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Post.countDocuments(query);

        res.json({
            posts,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/posts - Create post
 */
const createPost = async (req, res, next) => {
    try {
        const { content, type, gymId } = req.body || {};
        const media = (req.files || []).map((f) => ({ url: `/uploads/${f.filename}`, type: 'image' }));

        const post = await Post.create({
            author: req.user._id,
            gym: gymId || null,
            type: type || 'gym-photo',
            content: content?.trim() || '',
            media
        });

        await post.populate('author', 'name profilePhoto profilePicture');
        await post.populate('gym', 'name address');

        res.status(201).json({ post });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/posts/:id - Single post
 */
const getPost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', 'name profilePhoto profilePicture')
            .populate('gym', 'name address');

        if (!post) return res.status(404).json({ message: 'Post not found' });
        if (post.status !== 'active') return res.status(404).json({ message: 'Post not found' });

        res.json({ post });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/posts/:id - Update post
 */
const updatePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to edit this post' });
        }

        const { content, type } = req.body;
        if (content !== undefined) post.content = content?.trim() || '';
        if (type) post.type = type;
        await post.save();

        await post.populate('author', 'name profilePhoto profilePicture');
        await post.populate('gym', 'name address');

        res.json({ post });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/posts/:id - Delete post
 */
const deletePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }

        await post.deleteOne();
        res.json({ message: 'Post deleted' });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/posts/:id/like - Toggle like
 */
const toggleLike = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const idx = post.likes.indexOf(req.user._id);
        if (idx >= 0) {
            post.likes.splice(idx, 1);
        } else {
            post.likes.push(req.user._id);
        }
        await post.save();

        res.json({ likes: post.likes.length, liked: idx < 0 });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/posts/:id/comment - Add comment
 */
const addComment = async (req, res, next) => {
    try {
        const { text } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        post.comments.push({
            user: req.user._id,
            text: (text || '').trim().slice(0, 500)
        });
        await post.save();

        const lastComment = post.comments[post.comments.length - 1];
        await lastComment.populate('user', 'name profilePhoto profilePicture');

        res.status(201).json({ comment: lastComment });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/posts/:id/save - Toggle save
 */
const toggleSave = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const idx = post.saves.indexOf(req.user._id);
        if (idx >= 0) {
            post.saves.splice(idx, 1);
        } else {
            post.saves.push(req.user._id);
        }
        await post.save();

        res.json({ saved: idx < 0 });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getFeed,
    createPost,
    getPost,
    updatePost,
    deletePost,
    toggleLike,
    addComment,
    toggleSave
};
