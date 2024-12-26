const CacheKeys = {
  POSTS_ALL: "posts:all",
  POST_BY_ID: (id) => `posts:${id}`,
  USERS_ALL: "users:all",
  USER_PROFILE: (userId) => `user:${userId}:profile`,
};

module.exports = CacheKeys;
