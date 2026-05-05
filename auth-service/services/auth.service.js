const bcrypt = require("bcryptjs");

const users = []; // temp (later DB)

exports.register = async (email, password) => {
  const hashed = await bcrypt.hash(password, 10);

  const user = { id: Date.now(), email, password: hashed };
  users.push(user);

  return user;
};

exports.login = async (email, password) => {
  const user = users.find((u) => u.email === email);
  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid password");

  return user;
};