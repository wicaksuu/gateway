const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const roleMiddleware = () => {
  return async (req, res, next) => {
    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }

      next();
    } catch (error) {
      res.status(401).json({ message: "Unauthorized" });
    }
  };
};

module.exports = roleMiddleware;
