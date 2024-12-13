const { prisma } = require("../prisma/prisma-client");

const LikeController = {
  toggleLikePost: async (req, res) => {
    const { postId } = req.body;

    const userId = req.user.userId;

    try {
      if (!postId) {
        return res.status(400).json({ error: "postId is required" });
      }

      // Check if the post exists
      const existingPost = await prisma.post.findUnique({
        where: { id: postId },
      });
      if (!existingPost) {
        return res.status(404).json({ error: "Post not found" });
      }

      // Check if the like exists
      const existingLike = await prisma.likePost.findFirst({
        where: { userId, postId },
      });
      if (existingLike) {
        await prisma.likePost.delete({ where: { id: existingLike.id } });
        return res.json({ message: "Like removed" });
      }

      // Like post
      const like = await prisma.likePost.create({
        data: {
          userId,
          postId,
        },
      });

      res.json(like);
    } catch (error) {
      console.error("Error in like post:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  toggleLikeComment: async (req, res) => {
    const { commentId } = req.body;

    const userId = req.user.userId;

    try {
      // Check if the comment exists
      const existingComment = await prisma.comment.findUnique({
        where: { id: commentId },
      });
      if (!existingComment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      // Check if the like exists
      const existingLike = await prisma.likeComment.findFirst({
        where: { userId, commentId },
      });
      if (existingLike) {
        await prisma.likeComment.delete({ where: { id: existingLike.id } });
        return res.json({ message: "Like removed" });
      }

      // Like comment
      const like = await prisma.likeComment.create({
        data: {
          userId,
          commentId,
        },
      });

      res.json(like);
    } catch (error) {
      console.error("Error in like comment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = LikeController;
