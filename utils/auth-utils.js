const jwt = require("jsonwebtoken");
const redis = require("redis");
const crypto = require("crypto");

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

const redisClient = redis.createClient();

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

(async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("Redis connected");
  }
})();

const generateAccessToken = (payload) => {
  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
  console.log("Generating access token for:", payload);
  return accessToken;
};

const generateRefreshToken = async (payload) => {
  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  const hashedToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");
  console.log("Storing refresh token in Redis:", refreshToken);
  await redisClient.setEx(
    hashedToken,
    7 * 24 * 60 * 60,
    JSON.stringify(payload)
  );
  return refreshToken;
};

const verifyRefreshToken = async (refreshToken) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");
  const userData = await redisClient.get(hashedToken);
  console.log("Verifying refresh token:", refreshToken);
  return userData ? JSON.parse(userData) : null;
};

const deleteRefreshToken = async (refreshToken) => {
  await redisClient.del(refreshToken);
  console.log("Deleting refresh token:", refreshToken);
};

process.on("SIGINT", async () => {
  if (redisClient.isOpen) {
    await redisClient.quit();
  }
  process.exit(0);
});

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  deleteRefreshToken,
};
