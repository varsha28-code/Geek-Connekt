const redis = require('redis');

class MockRedisClient {
    constructor() {
        this.store = {};
    }
    config(cmd, key, val, callback) {
        if (callback) callback(null, "OK");
    }
    get(key, callback) {
        const val = this.store[key];
        if (callback) {
            callback(null, val !== undefined ? val : null);
        }
    }
    set(key, val, callback) {
        this.store[key] = val;
        if (callback) {
            callback(null, "OK");
        }
    }
    on(event, callback) {
        if (event === 'connect') {
            setTimeout(callback, 0);
        }
    }
}

class RedisDelegate {
    constructor() {
        this.underlying = new MockRedisClient();
        this.isMock = true;
    }

    setUnderlying(client, isMock = false) {
        this.underlying = client;
        this.isMock = isMock;
    }

    config(...args) {
        return this.underlying.config(...args);
    }

    get(...args) {
        return this.underlying.get(...args);
    }

    set(...args) {
        return this.underlying.set(...args);
    }

    on(event, callback) {
        return this.underlying.on(event, callback);
    }
}

const delegate = new RedisDelegate();
module.exports.client = delegate;

module.exports.connect = () => {
    try {
        console.log("Attempting to connect to Redis at", process.env.redisUrl || "localhost");
        const realClient = redis.createClient({
            host: process.env.redisUrl || "localhost",
            port: 6379,
            connect_timeout: 2000
        });

        let connected = false;
        
        realClient.on("connect", function() {
            console.log("REDIS connected successfully");
            connected = true;
            delegate.setUnderlying(realClient, false);
        });

        realClient.on("error", function(err) {
            console.log("Redis connection error: " + err);
            if (!connected) {
                console.log("Using memory-based Mock Redis Client due to connection failure.");
                delegate.setUnderlying(new MockRedisClient(), true);
            }
        });
    } catch (e) {
        console.log("Failed to initialize Redis client:", e);
        console.log("Using memory-based Mock Redis Client.");
        delegate.setUnderlying(new MockRedisClient(), true);
    }
};