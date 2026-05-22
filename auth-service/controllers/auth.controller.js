const authService = require("../services/auth.service");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");
const jwt = require("jsonwebtoken");
const { hashToken } = require("../utils/hashToken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
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

    // store refresh token in DB
    await prisma.refreshToken.create({
      data: {
        tokenHash: hashToken(refreshToken),
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
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
exports.refresh = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({ error: "No refresh token" });
    }
    const hashedToken = hashToken(token);
    // check DB
    const storedToken = await prisma.refreshToken.findUnique({
      where: {
         tokenHash: hashedToken,
         },
    });
    // check if token is expired or revoked, Add cleanup for expired sessions
    if (storedToken?.expiresAt < new Date()) {
  return res.status(401).json({
    error: "Session expired",
  });
}
if (!storedToken) {
  return res.status(401).json({
    error: "Invalid session",
  });
}

// TOKEN REUSE DETECTED
if (storedToken.revoked) {
  await prisma.refreshToken.updateMany({
    where: {
      userId: storedToken.userId,
    },
    data: {
      revoked: true,
    },
  });

  return res.status(401).json({
    error: "Session reuse detected. All sessions revoked.",
  });
}

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    // ROTATE: revoke old token
    await prisma.refreshToken.update({
      where: {
  tokenHash: hashedToken,
},
      data: { revoked: true },
    });

    // create new tokens
    const newAccessToken = generateAccessToken({
      id: decoded.id,
      email: decoded.email,
    });

    const newRefreshToken = generateRefreshToken({
      id: decoded.id,
      email: decoded.email,
    });

    await prisma.refreshToken.create({
      data: {
        tokenHash: hashToken(newRefreshToken),
        userId: decoded.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res
      .cookie("accessToken", newAccessToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        maxAge: 15 * 60 * 1000,
      })
      .cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ message: "Token refreshed" });

  } catch {
    res.status(401).json({ error: "Invalid refresh token" });
  }
};
//logout endpoint
exports.logout = async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (token) {
    const hashedToken = hashToken(token);

    await prisma.refreshToken.updateMany({
      where: {
        tokenHash: hashedToken,
      },
      data: { revoked: true },
    });
  }

  res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json({ message: "Logged out" });
};