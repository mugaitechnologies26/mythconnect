const UserModel = require('../models/UserModel');

const authController = {
  login: async (req, res, next) => {
    try {
      const { email = 'admin@mythconnect.ai' } = req.body;
      const user = await UserModel.getByEmail(email) || await UserModel.getById(1);

      if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      // Return user profile and session token
      return res.json({
        success: true,
        token: `myth_token_${user.id}_${Date.now()}`,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          role_display: user.role_display,
          team_name: user.team_name,
          avatar_url: user.avatar_url,
          is_active: Boolean(user.is_active)
        }
      });
    } catch (err) {
      next(err);
    }
  },

  currentUser: async (req, res, next) => {
    try {
      const user = await UserModel.getById(1);
      return res.json({ success: true, user });
    } catch (err) {
      next(err);
    }
  },

  logout: (req, res) => {
    return res.json({ success: true, message: 'Logged out successfully' });
  },

  switchRole: async (req, res, next) => {
    try {
      const { role } = req.body;
      const allUsers = await UserModel.getAll();
      const matched = allUsers.find(u => u.role === role) || allUsers[0];
      return res.json({ success: true, user: matched });
    } catch (err) {
      next(err);
    }
  },

  allUsers: async (req, res, next) => {
    try {
      const users = await UserModel.getAll();
      return res.json({ success: true, users });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = authController;
