const jwt = require("jsonwebtoken");
const usersBL = require("../models/usersBL");

module.exports = async (req, res, next) => {
  try {
    const token = getAccessTokenFromAuthorizedHeader(req, res);
    if (token == null) {
      throw new Error("403 Forbidden");
    }

    const decodedData = await jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    if (
      !await usersBL.getUserById(decodedData.userId) ||
      decodedData.active === false
    ) {
      throw new Error("401 Unauthorized");
    }

    next();
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

const getAccessTokenFromAuthorizedHeader = (req, res) => {
  if (!req.header("Authorization")) {
    throw new Error("Access Denied!");
  }

  const authHeader = req.headers["authorization"];
  return authHeader && authHeader.split(" ")[1];
};
