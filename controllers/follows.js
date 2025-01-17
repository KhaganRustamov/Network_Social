const { prisma } = require("../prisma/prisma-client");

const Follows = {
  followUser: async (req, res) => {
    try {
      const { followingId } = req.body;
      const userId = req.user.userId;

      if (followingId === userId) {
        return res
          .status(400)
          .json({ message: "You can't subscribe to yourself" });
      }

      const existingSubscription = await prisma.follows.findFirst({
        where: {
          AND: [{ followerId: userId }, { followingId: followingId }],
        },
      });

      if (existingSubscription) {
        return res.status(403).json({ message: "Subscription already exists" });
      }

      await prisma.follows.create({
        data: {
          follower: {
            connect: {
              id: userId,
            },
          },
          following: {
            connect: {
              id: followingId,
            },
          },
        },
      });

      res.status(201).json({ message: "Subscription successfully created" });
    } catch (error) {
      console.error("Error in followUser:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  unfollowUser: async (req, res) => {
    try {
      const { followingId } = req.body;
      const userId = req.user.userId;

      if (followingId === userId) {
        return res
          .status(400)
          .json({ message: "You can't unsubscribe to yourself" });
      }

      const existingSubscription = await prisma.follows.findFirst({
        where: {
          AND: [{ followerId: userId }, { followingId: followingId }],
        },
      });

      if (!existingSubscription) {
        return res.status(403).json({ message: "Subscription is not found" });
      }

      await prisma.follows.delete({
        where: {
          id: existingSubscription.id,
        },
      });

      res.status(200).json({ message: "Subscription successfully deleted" });
    } catch (error) {
      console.error("Error in unfollowUser:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = Follows;
