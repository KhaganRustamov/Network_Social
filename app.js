require("dotenv").config(); // Для переменных окружения
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const fs = require("fs");
const createError = require("http-errors");

const app = express();

// Логирование запросов
app.use(logger("dev"));

// Парсинг запросов
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Работа с cookie
app.use(cookieParser());

// Статические файлы
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use("/uploads", express.static(uploadsDir));

// Подключение маршрутов
const apiRoutes = require("./routes");
app.use("/api", apiRoutes);

// Обработка 404 ошибок
app.use((req, res, next) => {
  next(createError(404, "Resource not found"));
});

// Централизованная обработка ошибок
app.use((err, req, res, next) => {
  const isDev = req.app.get("env") === "development";
  res.status(err.status || 500).json({
    message: err.message,
    ...(isDev && { stack: err.stack }), // Показываем стек только в режиме разработки
  });
});

// Экспорт приложения
module.exports = app;
