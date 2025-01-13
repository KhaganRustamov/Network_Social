const jwt = require("jsonwebtoken");

const refreshToken = (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ error: "No refresh token provided" });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) {
        return res
          .status(403)
          .json({ error: "Invalid or expired refresh token" });
      }

      req.user = user;
      next();
    });
  } catch (error) {
    console.error("Error in refreshToken", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { refreshToken };
