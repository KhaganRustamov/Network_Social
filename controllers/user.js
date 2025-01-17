const { prisma } = require("../prisma/prisma-client");
const cacheKeys = require("../utils/cacheKeys");

const User = {
  getAllUsers: async (req, res) => {
    try {
      // const cachedUsers = await redisClient.get(cacheKeys.USERS_ALL);

      // // Check cached users
      // if (cachedUsers) {
      //   console.log("Returning cached users");
      //   return res.json(JSON.parse(cachedUsers));
      // }

      // Get all users
      const users = await prisma.user.findMany({
        select: {
          name: true,
          avatarUrl: true,
          dateOfBirth: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      // Set cache
      // await redisClient.set(cacheKeys.USERS_ALL, JSON.stringify(users), {
      //   EX: 3600,
      // });

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

      // const cachedUser = await redisClient.get(cacheKeys.USER_BY_ID(id));

      // // Check cached user
      // if (cachedUser) {
      //   console.log("Returning cached user");
      //   return res.json(JSON.parse(cachedUser));
      // }

      // Search user by id
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
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

      // Check if the current user is subscribed to the user being searched for
      const isFollowing = await prisma.follows.findFirst({
        where: { AND: { followerId: userId, followingId: id } },
      });

      // Set cache
      // await redisClient.set(cacheKeys.USER_BY_ID(id), JSON.stringify(user), {
      //   EX: 3600,
      // });

      res.json({ ...user, isFollowing: Boolean(isFollowing) });
    } catch (error) {
      console.error("Error in getUserById:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = User;
