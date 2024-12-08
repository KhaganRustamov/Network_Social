const { prisma } = require("../prisma/prisma-client");

const CommentController = {
  createComment: async (req, res) => {
    const { postId, content } = req.body;
    const userId = req.user.userId;

    if (!postId || !content) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if the post exist
    const postExists = await prisma.post.findUnique({ where: { id: postId } });
    if (!postExists) {
      return res.status(404).json({ error: "Post not found" });
    }

    try {
      // Create comment
      const comment = await prisma.comment.create({
        data: {
          userId,
          postId,
          content,
        },
        include: { user: true },
      });

      res.json(comment);
    } catch (error) {
      console.error("Error in create comment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  updateComment: async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    const comment = await prisma.comment.findUnique({ where: { id } });

    if (!comment) {
      return res.status(404).json({ error: "Comment is not found" });
    }

    // Checking that the user update own comment
    if (comment.userId !== req.user.userId) {
      return res.status(403).json({ error: "Not access" });
    }

    try {
      // Update comment
      const newComment = await prisma.comment.update({
        where: { id },
        data: {
          content,
        },
      });
      res.json(newComment);
    } catch (error) {
      console.error("Error in update comment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  deleteComment: async (req, res) => {
    const { id } = req.params;
    const comment = await prisma.comment.findUnique({ where: { id } });

    if (!comment) {
      return res.status(404).json({ error: "Comment is not found" });
    }

    // Checking that the user deleted own comment
    if (comment.userId !== req.user.userId) {
      return res.status(403).json({ error: "Not access" });
    }

    try {
      // Delete comment
      await prisma.comment.delete({ where: { id } });
      res.json("Comment deleted successfully");
    } catch (error) {
      console.error("Error in delete comment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = CommentController;
