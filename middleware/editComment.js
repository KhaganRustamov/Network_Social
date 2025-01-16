const { prisma } = require("../prisma/prisma-client");

const editComment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const comment = await prisma.comment.findUnique({ where: { id } });

    if (!comment) {
      return res.status(404).json({ error: "Comment is not found" });
    }

    if (comment.userId !== req.user.userId) {
      return res
        .status(403)
        .json({ error: "No access to update or delete another comment" });
    }

    next();
  } catch (error) {
    console.error("Error in editComment", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { editComment };
