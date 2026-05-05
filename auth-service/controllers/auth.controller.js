const authService = require("../services/auth.service");
const { generateToken } = require("../utils/jwt");

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

    const token = generateToken({ id: user.id, email: user.email });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
