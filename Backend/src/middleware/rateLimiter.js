const stores = new Map();

const getClientIp = (req) => {
    return req.ip || req.socket.remoteAddress || 'unknown';
};

export const rateLimiter = ({
    windowMs = 15 * 60 * 1000,
    maxRequests = 100,
    message = 'Too many requests. Please try again later.',
    keyPrefix = 'global'
} = {}) => {
    const store = new Map();
    stores.set(keyPrefix, store);

    return (req, res, next) => {
        const now = Date.now();
        const key = `${keyPrefix}:${getClientIp(req)}`;
        const record = store.get(key);

        if (!record || record.resetAt <= now) {
            const resetAt = now + windowMs;
            store.set(key, {
                count: 1,
                resetAt
            });

            res.setHeader('RateLimit-Limit', maxRequests);
            res.setHeader('RateLimit-Remaining', maxRequests - 1);
            res.setHeader('RateLimit-Reset', Math.ceil(resetAt / 1000));
            return next();
        }

        const remaining = Math.max(maxRequests - record.count, 0);

        res.setHeader('RateLimit-Limit', maxRequests);
        res.setHeader('RateLimit-Remaining', remaining);
        res.setHeader('RateLimit-Reset', Math.ceil(record.resetAt / 1000));

        if (record.count >= maxRequests) {
            res.setHeader('Retry-After', Math.ceil((record.resetAt - now) / 1000));
            return res.status(429).json({ message });
        }

        record.count += 1;
        return next();
    };
};

setInterval(() => {
    const now = Date.now();

    for (const store of stores.values()) {
        for (const [key, record] of store.entries()) {
            if (record.resetAt <= now) {
                store.delete(key);
            }
        }
    }
}, 60 * 1000).unref();
