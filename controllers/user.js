const { prisma } = require("../prisma/prisma-client");
const redisClient = require("../utils/redis-client");
const cacheKeys = require("../utils/cacheKeys");

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
      await redisClient.set(cacheKeys.USERS_ALL, JSON.stringify(users), {
        EX: 3600,
      });

      res.json(users);
    } catch (error) {
      console.error("Error in get users:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  getUserById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const cachedUser = await redisClient.get(cacheKeys.USERS_ALL);

      // Check cached user
      if (cachedUser) {
        console.log("Returning cached user");
        return res.json(JSON.parse(cachedUser));
      }

      // Search user by id
      const user = await prisma.user.findUnique({
        where: { id },
        include: { followers: true, following: true },
      });

      if (!user) {
        return res.status(404).json({ error: "User is not found" });
      }
      // Check if the current user is subscribed to the user being searched for
      const isFollowing = await prisma.follows.findFirst({
        where: { AND: { followerId: userId, followingId: id } },
      });

      // Set cache
      await redisClient.set(cacheKeys.USERS_ALL, JSON.stringify(user), {
        EX: 3600,
      });

      res.json({ ...user, isFollowing: Boolean(isFollowing) });
    } catch (error) {
      console.error("Error in get user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { email, name, dateOfBirth, bio, location } = req.body;

      let filePath;

      if (req.file && req.file.path) {
        filePath = req.file.path;
      }

      // Checking that the user is updating their own information
      if (id !== req.user.userId) {
        return res.status(403).json({ error: "Not access" });
      }

      // Check if a user with such email or name exists
      if (email) {
        const existingEmail = await prisma.user.findUnique({
          where: { email },
        });

        if (existingEmail && existingEmail.id !== parseInt(id)) {
          return res.status(400).json({ error: "Email already exists" });
        }
      }
      if (name) {
        const existingName = await prisma.user.findFirst({
          where: { name },
        });

        if (existingName && existingName.id !== parseInt(id)) {
          return res.status(400).json({ error: "Name already exists" });
        }
      }

      // Update user
      const user = await prisma.user.update({
        where: { id },
        data: {
          email: email || undefined,
          name: name || undefined,
          avatarUrl: filePath ? `/${filePath}` : undefined,
          dateOfBirth: dateOfBirth || undefined,
          bio: bio || undefined,
          location: location || undefined,
        },
      });

      // Delete cache
      await redisClient.del(cacheKeys.USERS_ALL);

      res.json(user);
    } catch (error) {
      console.error("Error in update user", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({ where: { id } });

      if (!user) {
        return res.status(404).json({ error: "User is not found" });
      }

      // Checking that the user deleted own profile
      if (user.id !== req.user.userId) {
        return res.status(403).json({ error: "Not access" });
      }

      // Delete user and cache
      await prisma.user.delete({ where: { id } });
      await redisClient.del(cacheKeys.USERS_ALL);

      res.json(`User: ${id} deleted successfully`);
    } catch (error) {
      console.error("Error in delete user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  profile: async (req, res) => {
    //Get profile
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: {
          followers: {
            include: {
              follower: true,
            },
          },
          following: {
            include: {
              following: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json({ error: "User is not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Error in profile", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = User;
