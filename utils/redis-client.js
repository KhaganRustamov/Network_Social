const redis = require("redis");

const redisClient = redis.createClient();

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

(async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log("Redis connected");
    }
  } catch (err) {
    console.error("Error connecting to Redis:", err);
  }
})();

process.on("SIGINT", async () => {
  if (redisClient.isOpen) {
    await redisClient.quit();
  }
  process.exit(0);
});

module.exports = redisClient;
