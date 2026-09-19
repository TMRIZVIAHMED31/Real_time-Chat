const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Builds the per-request context object, decoding the JWT (if present)
// so resolvers can check `context.user` for auth.
async function buildContext({ req }) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) return { user: null };

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const dbUser = await User.findById(decoded.id);
    if (!dbUser) return { user: null };
    return {
      user: { id: dbUser._id.toString(), name: dbUser.name, role: dbUser.role },
    };
  } catch (err) {
    return { user: null }; // invalid/expired token -> treated as unauthenticated
  }
}

module.exports = buildContext;
