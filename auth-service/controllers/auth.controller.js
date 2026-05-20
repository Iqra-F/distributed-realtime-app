const authService = require("../services/auth.service");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await authService.register(email, password);
    const { password: _, ...safeUser } = user; // Exclude password from response
    res.json({ message: "User registered", user: safeUser });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await authService.login(email, password);

    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email,
    });

    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: "Login successful",
      });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.me = (req, res) => {
  try {
    const accessToken = req.cookies?.accessToken;

    if (!accessToken) {
      return res.status(401).json({ user: null });
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

    res.json({ user: decoded });
  } catch {
    res.status(401).json({ user: null });
  }
};
//refresh token endpoint
exports.refresh = (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({
        error: "No refresh token",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const accessToken = generateAccessToken({
      id: decoded.id,
      email: decoded.email,
    });

    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      })
      .json({
        message: "Token refreshed",
      });
  } catch {
    res.status(401).json({
      error: "Invalid refresh token",
    });
  }
};
//logout endpoint
exports.logout = (req, res) => {
  res
    .clearCookie("accessToken", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    })
    .clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    })
    .json({
      message: "Logged out",
    });
};
