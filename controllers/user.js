const { prisma } = require("../prisma/prisma-client");
const cacheKeys = require("../utils/cacheKeys");
const redisClient = require("../utils/redis-client");

const User = {
  getAllUsers: async (req, res) => {
    try {
      const cachedUsers = await redisClient.get(cacheKeys.USERS_ALL);

      // Check cached users
      if (cachedUsers) {
        console.log("Returning cached users");
        return res.json(JSON.parse(cachedUsers));
      }

      // Get all users
      const users = await prisma.user.findMany({
        include: {
          password: false,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      // Set cache
      await redisClient.set(cacheKeys.USERS_ALL, JSON.stringify(users), {
        EX: 3600,
      });

      res.json(users);
    } catch (error) {
      console.error("Error in getAllUsers:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  getUserById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      // Search user by id
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          password: false,
          followers: {
            select: {
              follower: {
                include: {
                  password: false,
                },
              },
            },
          },
          following: {
            select: {
              following: {
                include: {
                  password: false,
                },
              },
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json({ error: "User is not found or deleted" });
      }

      // Check if the current user is subscribed to another user
      const isFollowing = await prisma.follows.findFirst({
        where: { AND: { followerId: userId, followingId: id } },
      });

      res.json({ ...user, isFollowing: Boolean(isFollowing) });
    } catch (error) {
      console.error("Error in getUserById:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = User;
