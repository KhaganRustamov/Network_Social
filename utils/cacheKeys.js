const CacheKeys = {
  POSTS_ALL: "posts:all",
  POST_BY_ID: (id) => `posts:${id}`,
  USERS_ALL: "users:all",
  USER_BY_ID: (userId) => `users:${userId}`,
  PROFILE: (userId) => `profile:${userId}`,
  POSTS_QUEUE: "posts:queue",
};

module.exports = CacheKeys;
