// const { verifyRefreshToken } = require("../utils/auth-token");

// const refreshToken = async (req, res, next) => {
//   try {
//     const { refreshToken } = req.cookies;

//     if (!refreshToken) {
//       return res.status(401).json({ error: "No refresh token provided" });
//     }

//     const user = await verifyRefreshToken(refreshToken);

//     if (!user) {
//       return res
//         .status(403)
//         .json({ error: "Invalid or expired refresh token" });
//     }

//     req.user = user;
//     next();
//   } catch (error) {
//     console.error("Error in refreshToken", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// module.exports = { refreshToken };
