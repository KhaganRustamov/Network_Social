const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const { prisma } = require("../prisma/prisma-client");
const Jdenticon = require("jdenticon");

const UserController = {
  register: async (req, res) => {
    const { email, password, name } = req.body;

    // Checking the fields
    if (!email || !password || !name) {
      return res.status(400).json({ error: "All fields are required" });
    }

    try {
      // Check if a user with such email or name exists
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      });
      const existingName = await prisma.user.findFirst({ where: { name } });

      if (existingEmail) {
        return res.status(400).json({ error: "Email already exists" });
      }
      if (existingName) {
        return res.status(400).json({ error: "Name already exists" });
      }

      // Hashing the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate an avatar for a new user
      const png = Jdenticon.toPng(name, 200);
      const avatarName = `${name}_${Date.now()}.png`;
      const avatarPath = path.join(__dirname, "/../uploads", avatarName);
      fs.writeFileSync(avatarPath, png);

      // Create a user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          avatarUrl: `/uploads/${avatarName}`,
        },
      });

      res.json(user);
    } catch (error) {
      console.error("Error in register:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  login: async (req, res) => {
    const { email, password } = req.body;

    // Checking the fields
    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    try {
      // Find the user
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (!existingUser) {
        return res.status(400).json({ error: "Wrong email or password" });
      }

      // Check the password
      const valid = await bcrypt.compare(password, existingUser.password);

      if (!valid) {
        return res.status(400).json({ error: "Wrong email or password" });
      }

      // Generate a JWT
      const token = jwt.sign(
        { userId: existingUser.id },
        process.env.SECRET_KEY
      );

      res.json({ token });
    } catch (error) {
      console.error("Error in login:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  getUserById: async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
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

      res.json({ ...user, isFollowing: Boolean(isFollowing) });
    } catch (error) {
      console.error("Error in get user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  updateUser: async (req, res) => {
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
    try {
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
      res.json(user);
    } catch (error) {
      console.error("Error in update", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  deleteUser: async (req, res) => {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });

    // Checking that the user deleted own profile
    if (post.authorId !== req.user.userId) {
      return res.status(403).json({ error: "Not access" });
    }

    try {
      // Delete user
      await prisma.post.delete({ where: { id } });
      res.json("User deleted successfully");
    } catch (error) {
      console.error("Error in delete post:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  currentUser: async (req, res) => {
    //Get current user
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
      console.error("Error in current", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = UserController;
