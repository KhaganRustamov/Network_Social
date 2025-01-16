const { prisma } = require("../prisma/prisma-client");

const Comment = {
  createComment: async (req, res) => {
    try {
      const { postId, content } = req.body;
      const userId = req.user.userId;

      if (!postId || !content) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Check if the post exist
      const postExists = await prisma.post.findUnique({
        where: { id: postId },
      });
      if (!postExists) {
        return res.status(404).json({ error: "Post not found" });
      }

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
    try {
      const { id } = req.params;
      const { content } = req.body;

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
    try {
      const { id } = req.params;
      // Delete comment
      await prisma.comment.delete({ where: { id } });
      res.json({ message: `Comment with id: ${id} deleted successfully` });
    } catch (error) {
      console.error("Error in delete comment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = Comment;
