const authService = require("../services/auth.service");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");
const { verifyAccessToken } = require("../utils/auth");
const { hashToken } = require("../utils/hashToken");
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

const prisma = new PrismaClient();

/* ---------------- REGISTER ---------------- */
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await authService.register(email, password);
    const { password: _, ...safeUser } = user;

    res.json({
      message: "User registered",
      user: safeUser,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* ---------------- LOGIN ---------------- */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await authService.login(email, password);

    const familyId = crypto.randomUUID(); // 🔐 SESSION GROUP ID

    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email,
      familyId,
    });

    await prisma.refreshToken.create({
      data: {
        tokenHash: hashToken(refreshToken),
        userId: user.id,
        familyId,
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
      .json({ message: "Login successful" });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* ---------------- ME ---------------- */
exports.me = (req, res) => {
  const token = req.cookies?.accessToken;

  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return res.status(401).json({ user: null });
  }

  res.json({ user: decoded });
};

/* ---------------- REFRESH (ROTATION + REUSE DETECTION) ---------------- */
exports.refresh = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({ error: "No refresh token" });
    }

    const hashedToken = hashToken(token);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash: hashedToken },
    });

    if (!storedToken) {
      return res.status(401).json({ error: "Invalid session" });
    }

    if (storedToken.expiresAt < new Date()) {
      return res.status(401).json({ error: "Session expired" });
    }

    // 🔐 REUSE DETECTION
    if (storedToken.revoked) {
      await prisma.refreshToken.updateMany({
        where: { userId: storedToken.userId },
        data: { revoked: true },
      });

      return res.status(401).json({
        error: "Session reuse detected. All sessions revoked.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    // ROTATE OLD TOKEN
    await prisma.refreshToken.update({
      where: { tokenHash: hashedToken },
      data: { revoked: true },
    });

    const newAccessToken = generateAccessToken({
      id: decoded.id,
      email: decoded.email,
    });

    const newRefreshToken = generateRefreshToken({
      id: decoded.id,
      email: decoded.email,
      familyId: storedToken.familyId,
    });

    await prisma.refreshToken.create({
      data: {
        tokenHash: hashToken(newRefreshToken),
        userId: decoded.id,
        familyId: storedToken.familyId,
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

/* ---------------- LOGOUT ---------------- */
exports.logout = async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (token) {
    const hashedToken = hashToken(token);

    await prisma.refreshToken.updateMany({
      where: { tokenHash: hashedToken },
      data: { revoked: true },
    });
  }

  res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json({ message: "Logged out" });
};