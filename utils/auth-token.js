const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const redisClient = require("./redis-client");

// Init secret keys
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// Generate access token
const generateAccessToken = (payload) => {
  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: "1m",
  });
  console.log("Generating access token for:", payload);
  return accessToken;
};

// Generate refresh token
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

// Verify refresh token
const verifyRefreshToken = async (refreshToken) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");
  const userData = await redisClient.get(hashedToken);
  console.log("Verifying refresh token:", refreshToken);
  return userData ? JSON.parse(userData) : null;
};

// Delete access token
const deleteAccessToken = async (accessToken) => {
  await redisClient.del(accessToken);
  console.log("Deleting access token:", accessToken);
};

// Delete refresh token
const deleteRefreshToken = async (refreshToken) => {
  await redisClient.del(refreshToken);
  console.log("Deleting refresh token:", refreshToken);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  deleteRefreshToken,
  deleteAccessToken,
};
