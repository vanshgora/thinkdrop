const { createClient } = require('redis');

function createRedisClient() {
    const client = createClient();
    return client;
}

module.exports = createRedisClient;