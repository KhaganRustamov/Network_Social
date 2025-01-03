const { prisma } = require("../prisma/prisma-client");

const checkUserExists = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      return res.status(403).json({
        error: "The deleted user doesn't have access to protected resources",
      });
    }

    next();
  } catch (error) {
    console.error("Error in checkUserExists", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { checkUserExists };
