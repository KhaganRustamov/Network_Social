const checkSession = (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized: No session found" });
    }
    req.user = { userId: req.session.userId };
    next();
  } catch (error) {
    console.error("Error in checkSession", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { checkSession };
