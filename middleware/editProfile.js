const editProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    if (id !== userId) {
      return res
        .status(403)
        .json({ error: "No access to update or delete another profile" });
    }

    next();
  } catch (error) {
    console.error("Error in editProfile", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { editProfile };
