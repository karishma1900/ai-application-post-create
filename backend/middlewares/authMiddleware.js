async function authMiddleware(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    console.error("Authorization failed: No token provided.");
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(payload.userId);
    if (!user) {
      console.error(`Error: User with ID ${payload.userId} not found.`);
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error(`Authorization failed: ${err.message}`);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}
