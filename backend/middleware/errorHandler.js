/**
 * Centralized Error Handler Middleware
 * Catches all errors and sends structured response
 */
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error for debugging
    console.error('❌ Error:', err.message);

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        error.message = 'Resource not found';
        return res.status(404).json({ message: error.message });
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        error.message = `Duplicate value for ${field}. Please use another value.`;
        return res.status(400).json({ message: error.message });
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        error.message = messages.join(', ');
        return res.status(400).json({ message: error.message });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token.' });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token has expired.' });
    }

    // Multer file validation
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Maximum size is 2MB.' });
    }
    if (err.message && err.message.includes('Only jpg, png, and webp')) {
        return res.status(400).json({ message: err.message });
    }

    res.status(err.statusCode || 500).json({
        message: error.message || 'Internal Server Error'
    });
};

module.exports = errorHandler;
