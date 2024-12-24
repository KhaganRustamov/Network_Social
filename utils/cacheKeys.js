const CacheKeys = {
  POSTS_ALL: "posts:all",
  POST_BY_ID: (id) => `posts:${id}`,
  USER_PROFILE: (userId) => `user:${userId}:profile`,
};

module.exports = CacheKeys;
