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
  },

  createUser: async (req, res, next) => {
    try {
      const { name, email, phone, role, role_id, team_name, team_id, password } = req.body;
      if (!name || !email) {
        return res.status(422).json({ success: false, error: 'Name and email are required' });
      }

      const existing = await UserModel.getByEmail(email);
      if (existing) {
        return res.status(409).json({ success: false, error: 'A team member with this email already exists' });
      }

      const user = await UserModel.create(req.body);
      return res.status(201).json({ success: true, user });
    } catch (err) {
      next(err);
    }
  },

  updateUser: async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = await UserModel.update(id, req.body);
      if (!user) {
        return res.status(404).json({ success: false, error: 'Team member not found' });
      }
      return res.json({ success: true, user });
    } catch (err) {
      next(err);
    }
  },

  deleteUser: async (req, res, next) => {
    try {
      const { id } = req.params;
      await UserModel.delete(id);
      return res.json({ success: true, message: 'Team member removed successfully' });
    } catch (err) {
      next(err);
    }
  },

  allTeams: async (req, res, next) => {
    try {
      const teams = await UserModel.getTeams();
      return res.json({ success: true, teams });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = authController;
