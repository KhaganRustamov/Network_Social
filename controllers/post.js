const { prisma } = require("../prisma/prisma-client");

const Post = {
  createPost: async (req, res) => {
    try {
      const { content } = req.body;
      const authorId = req.user.userId;

      if (!content) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Create post
      const post = await prisma.post.create({
        data: {
          content,
          authorId,
        },
      });

      res.json(post);
    } catch (error) {
      console.error("Error in create post:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  getAllPosts: async (req, res) => {
    try {
      const userId = req.user.userId;

      // Get all posts
      const posts = await prisma.post.findMany({
        include: {
          likes: true,
          author: true,
          comments: {
            include: {
              likes: true,
              user: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Check liked posts
      const postWithLikeInfo = posts.map((post) => ({
        ...post,
        likedByUser: post.likes.some((like) => like.userId === userId),
      }));

      res.json(postWithLikeInfo);
    } catch (error) {
      console.error("Error in get posts:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  getPostById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      // Get post by id
      const post = await prisma.post.findUnique({
        where: { id },
        include: {
          likes: true,
          author: true,
          comments: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!post) {
        return res.status(404).json({ error: "Post is not found" });
      }
      // Check liked post
      const postWithLikeInfo = {
        ...post,
        likedByUser: post.likes.some((like) => like.userId === userId),
      };

      res.json(postWithLikeInfo);
    } catch (error) {
      console.error("Error in get post:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  deletePost: async (req, res) => {
    try {
      const { id } = req.params;

      const post = await prisma.post.findUnique({ where: { id } });

      if (!post) {
        return res.status(404).json({ error: "Post is not found" });
      }

      // Checking that the user deleted own post
      if (post.authorId !== req.user.userId) {
        return res.status(403).json({ error: "Not access" });
      }

      // Delete post
      await prisma.post.delete({ where: { id } });
      res.json("Post deleted successfully");
    } catch (error) {
      console.error("Error in delete post:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  updatePost: async (req, res) => {
    try {
      const { id } = req.params;
      const { content } = req.body;

      const post = await prisma.post.findUnique({ where: { id } });

      if (!post) {
        return res.status(404).json({ error: "Post is not found" });
      }

      // Checking that the user update own post
      if (post.authorId !== req.user.userId) {
        return res.status(403).json({ error: "Not access" });
      }

      // Update post
      const newPost = await prisma.post.update({
        where: { id },
        data: {
          content,
        },
      });
      res.json(newPost);
    } catch (error) {
      console.error("Error in update post:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = Post;
