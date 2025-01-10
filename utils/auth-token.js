const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const redisClient = require("./redis-client");

// Init secret keys
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// Generate short-lived time access token
const generateShortAccessToken = async (payload) => {
  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: "1m",
  });
  const hashedToken = crypto
    .createHash("sha256")
    .update(accessToken)
    .digest("hex");
  await redisClient.setEx(hashedToken, 1 * 60, JSON.stringify(payload));
  console.log("Generating short-lived access token:", accessToken);
  return accessToken;
};

// Generate long-lived time access token
const generateLongAccessToken = async (payload) => {
  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  const hashedToken = crypto
    .createHash("sha256")
    .update(accessToken)
    .digest("hex");
  await redisClient.setEx(
    hashedToken,
    7 * 24 * 60 * 60,
    JSON.stringify(payload)
  );
  console.log("Generating long-lived access token:", accessToken);
  return accessToken;
};

// Generate long time refresh token
const generateRefreshToken = async (payload) => {
  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  const hashedToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");
  await redisClient.setEx(
    hashedToken,
    7 * 24 * 60 * 60,
    JSON.stringify(payload)
  );
  console.log("Storing refresh token in Redis:", refreshToken);
  return refreshToken;
};

// Verify refresh token
const verifyRefreshToken = async (refreshToken) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");
  const userData = await redisClient.get(hashedToken);
  return JSON.parse(userData);
};

// Delete refresh token
const deleteRefreshToken = async (refreshToken) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");
  await redisClient.del(hashedToken);
  console.log("Deleting refresh token:", refreshToken);
};

module.exports = {
  verifyRefreshToken,
  deleteRefreshToken,
  generateLongAccessToken,
  generateShortAccessToken,
  generateRefreshToken,
};
