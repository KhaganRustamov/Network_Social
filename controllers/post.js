const { prisma } = require("../prisma/prisma-client");
const cacheKeys = require("../utils/cacheKeys");

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

      // await redisClient.del(cacheKeys.POSTS_ALL);
      res.json(post);
    } catch (error) {
      console.error("Error in create post:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  getAllPosts: async (req, res) => {
    try {
      const userId = req.user.userId;
      // const cachedPosts = await redisClient.get(cacheKeys.POSTS_ALL);

      // // Check cached posts
      // if (cachedPosts) {
      //   console.log("Returning cached posts");
      //   return res.json(JSON.parse(cachedPosts));
      // }

      // Get all posts
      const posts = await prisma.post.findMany({
        include: {
          likes: {
            include: {
              postId: false,
            },
          },
          comments: {
            include: {
              postId: false,
              user: {
                include: {
                  id: false,
                  password: false,
                  email: false,
                },
              },
              likes: {
                include: {
                  commentId: false,
                },
              },
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

      // Set cache
      // await redisClient.set(
      //   cacheKeys.POSTS_ALL,
      //   JSON.stringify(postWithLikeInfo),
      //   {
      //     EX: 3600,
      //   }
      // );

      res.json(postWithLikeInfo);
    } catch (error) {
      console.error("Error in getAllPosts:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  getPostById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      // const cachedPost = await redisClient.get(cacheKeys.POST_BY_ID(id));

      // Check cached post
      // if (cachedPost) {
      //   console.log("Returning cached post");
      //   return res.json(JSON.parse(cachedPost));
      // }

      // Get post by id
      const post = await prisma.post.findUnique({
        where: { id },
        include: {
          likes: {
            include: {
              postId: false,
            },
          },
          author: {
            include: {
              id: false,
              email: false,
              password: false,
            },
          },
          comments: {
            include: {
              postId: false,
              user: {
                include: {
                  id: false,
                  password: false,
                  email: false,
                },
              },
              likes: {
                include: {
                  commentId: false,
                },
              },
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

      // Set cache
      // await redisClient.set(
      //   cacheKeys.POST_BY_ID(id),
      //   JSON.stringify(postWithLikeInfo),
      //   {
      //     EX: 3600,
      //   }
      // );

      res.json(postWithLikeInfo);
    } catch (error) {
      console.error("Error in getPostById:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  deletePost: async (req, res) => {
    try {
      const { id } = req.params;

      // Delete post and cache
      await prisma.post.delete({ where: { id } });
      // await redisClient.del(cacheKeys.POSTS_ALL);

      res.json({ message: `Post with id: ${id} deleted successfully` });
    } catch (error) {
      console.error("Error in deletePost:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  updatePost: async (req, res) => {
    try {
      const { id } = req.params;
      const { content } = req.body;

      // Update post
      const newPost = await prisma.post.update({
        where: { id },
        data: {
          content,
        },
      });

      // Delete cache and update post
      // await redisClient.del(cacheKeys.POSTS_ALL);

      res.json(newPost);
    } catch (error) {
      console.error("Error in updatePost:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = Post;
