const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // Let's check if there is a token
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Check the token
  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }

    req.user = user;

    next();
  });
};

module.exports = { authenticateToken };
