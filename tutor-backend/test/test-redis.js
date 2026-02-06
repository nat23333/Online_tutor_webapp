// scripts/test-redis.js
// Safe async wrapper (works with Node commonjs)
(async () => {
    try {
        if (!process.env.REDIS_URL) {
            console.error('ERROR: REDIS_URL is not set in environment.');
            process.exit(1);
        }

        const Redis = require('ioredis');
        const redis = new Redis(process.env.REDIS_URL);

        // optional: show which URL we are using (safe to redact in logs)
        console.log('Connecting to Redis...');

        await redis.set('ping', 'pong');
        const val = await redis.get('ping');
        console.log('Redis test value:', val); // expected: "pong"

        await redis.quit();
        process.exit(0);
    } catch (err) {
        console.error('Redis test failed:', err.message || err);
        process.exit(2);
    }
})();
