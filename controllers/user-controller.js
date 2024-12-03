const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const { prisma } = require("../prisma/prisma-client");
const Jdenticon = require("jdenticon");

const UserController = {
  register: async (req, res) => {
    const { email, password, name } = req.body;

    // Проверяем поля на существование
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Все поля обязательны" });
    }

    try {
      // Проверяем, существует ли пользователь с таким emai
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: "Пользователь уже существует" });
      }

      // Хешируем пароль
      const hashedPassword = await bcrypt.hash(password, 10);

      // Генерируем аватар для нового пользователя
      const png = Jdenticon.toPng(name, 200);
      const avatarName = `${name}_${Date.now()}.png`;
      const avatarPath = path.join(__dirname, "/../uploads", avatarName);
      fs.writeFileSync(avatarPath, png);

      // Создаем пользователя
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
    res.send("OK");
  },
  getUserById: async (req, res) => {
    res.send("OK");
  },
  updateUser: async (req, res) => {
    res.send("OK");
  },
  currentUser: async (req, res) => {
    res.send("OK");
  },
};

module.exports = UserController;
