New Chat
117 lines

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    // Set cookie with production-safe options
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      domain: isProduction ? '.onrender.com' : undefined,
      path: '/',
    });
    res.json({
      message: 'Logged in',
      email: user.email,
      credits: user.credits,
      profileImage: user.profileImage,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
function logout(req, res) {
  try {
    // Clear cookie with matching options
    res.clearCookie('token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      domain: isProduction ? '.onrender.com' : undefined,
      path: '/',
    });
    res.json({ message: 'Logged out' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
module.exports = { register, login, logout };
