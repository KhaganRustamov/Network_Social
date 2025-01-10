const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const redisClient = require("./redis-client");

// Init secret keys
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// Hash token
const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

// Generate short-lived time access token
const generateAccessToken = async (payload, expiresIn) => {
  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn,
  });
  const hashedToken = hashToken(accessToken);
  await redisClient.setEx(
    hashedToken,
    parseInt(expiresIn) * 60,
    JSON.stringify(payload)
  );
  console.log(`Generating access token with expiresIn: ${expiresIn}`);
  return accessToken;
};

// Generate refresh token
const generateRefreshToken = async (payload) => {
  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  const hashedToken = hashToken(refreshToken);
  await redisClient.setEx(
    hashedToken,
    7 * 24 * 60 * 60,
    JSON.stringify(payload)
  );
  console.log("Storing refresh token in Redis");
  return refreshToken;
};

// Verify refresh token
const verifyRefreshToken = async (refreshToken) => {
  const hashedToken = hashToken(refreshToken);
  const userData = await redisClient.get(hashedToken);
  return JSON.parse(userData);
};

// Delete refresh token
const deleteRefreshToken = async (refreshToken) => {
  const hashedToken = hashToken(refreshToken);
  await redisClient.del(hashedToken);
  console.log("Deleting refresh token");
};

module.exports = {
  verifyRefreshToken,
  deleteRefreshToken,
  generateAccessToken,
  generateRefreshToken,
};
