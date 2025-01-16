const { prisma } = require("../prisma/prisma-client");

const editPost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) {
      return res.status(404).json({ error: "Post is not found" });
    }

    if (post.authorId !== req.user.userId) {
      return res
        .status(403)
        .json({ error: "No access to update or delete another post" });
    }

    next();
  } catch (error) {
    console.error("Error in editPost", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { editPost };
