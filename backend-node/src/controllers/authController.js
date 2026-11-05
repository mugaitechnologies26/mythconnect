const UserModel = require('../models/UserModel');
const RoleModel = require('../models/RoleModel');
const db = require('../config/db');

const authController = {
  login: async (req, res, next) => {
    try {
      const { email, role, password } = req.body;
      let user = null;

      // 1. If role is specified and no email, authenticate directly by role
      if (role && !email) {
        user = await UserModel.getByRole(role);
      }

      // 2. If email is specified, lookup by email
      if (!user && email) {
        user = await UserModel.getByEmail(email);
      }

      // 3. If role is specified but no direct user found (e.g. newly created custom role)
      if (!user && role) {
        const roleRecord = await RoleModel.getByName(role);
        if (roleRecord) {
          user = {
            id: 1000 + roleRecord.id,
            name: `${roleRecord.display_name} User`,
            email: `${roleRecord.name}@mythconnect.ai`,
            phone: '+919876543210',
            role: roleRecord.name,
            role_display: roleRecord.display_name,
            team_name: 'Operations Team',
            avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            is_active: 1
          };
        }
      }

      // 4. Fallback if still not found
      if (!user) {
        user = await UserModel.getById(1);
      }

      if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid credentials or role' });
      }

      // 5. If specific role was requested alongside email, set session to that role
      if (role && user.role !== role) {
        const targetRole = await RoleModel.getByName(role);
        if (targetRole) {
          user.role = targetRole.name;
          user.role_display = targetRole.display_name;
        }
      }

      // 6. Fetch permissions for the user's role
      let permissions = [];
      try {
        const roleRecord = await RoleModel.getByName(user.role);
        if (roleRecord && Array.isArray(roleRecord.permissions)) {
          permissions = roleRecord.permissions;
        }
      } catch (err) {}

      // Update last_login_at in background for real users
      if (user.id && user.id < 1000) {
        db.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]).catch(() => {});
      }

      // Return user profile and session token with permissions
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
          is_active: Boolean(user.is_active),
          permissions
        }
      });
    } catch (err) {
      next(err);
    }
  },

  currentUser: async (req, res, next) => {
    try {
      const user = await UserModel.getById(1);
      let permissions = [];
      if (user) {
        try {
          const roleRecord = await RoleModel.getByName(user.role);
          if (roleRecord && Array.isArray(roleRecord.permissions)) {
            permissions = roleRecord.permissions;
          }
        } catch (err) {}
      }
      return res.json({ 
        success: true, 
        user: user ? { ...user, permissions } : null 
      });
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
      let matched = await UserModel.getByRole(role);
      if (!matched) {
        const roleRecord = await RoleModel.getByName(role);
        if (roleRecord) {
          matched = {
            id: 1000 + roleRecord.id,
            name: `${roleRecord.display_name} User`,
            email: `${roleRecord.name}@mythconnect.ai`,
            phone: '+919876543210',
            role: roleRecord.name,
            role_display: roleRecord.display_name,
            team_name: 'Operations Team',
            avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            is_active: 1
          };
        }
      }
      if (!matched) {
        const allUsers = await UserModel.getAll();
        matched = allUsers[0];
      }

      let permissions = [];
      try {
        const roleRecord = await RoleModel.getByName(matched.role);
        if (roleRecord && Array.isArray(roleRecord.permissions)) {
          permissions = roleRecord.permissions;
        }
      } catch (err) {}

      return res.json({ 
        success: true, 
        user: {
          ...matched,
          permissions
        }
      });
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
