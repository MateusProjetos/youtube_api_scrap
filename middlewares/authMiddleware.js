// middlewares/authMiddleware.js
require('dotenv').config();

const authMiddleware = (req, res, next) => {
    const apiKey = req.header('X-API-Key');
    
    if (!apiKey) {
        return res.status(401).json({ error: 'API key ausente' });
    }

    if (apiKey !== process.env.API_KEY) {
        return res.status(403).json({ error: 'API key inválida' });
    }

    next();
};

module.exports = authMiddleware;
