const RoleModel = require('../models/RoleModel');
const logger = require('../utils/logger');

const roleController = {
  // GET /api/roles - List all roles with permission and user counts
  index: async (req, res, next) => {
    try {
      const roles = await RoleModel.getAll();
      return res.json({ success: true, data: roles });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/roles/permissions - List all available permissions grouped by category
  permissions: async (req, res, next) => {
    try {
      const permissionGroups = await RoleModel.getPermissions();
      return res.json({ success: true, data: permissionGroups });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/roles/:id - Show specific role details
  show: async (req, res, next) => {
    try {
      const { id } = req.params;
      const role = await RoleModel.getById(id);
      if (!role) {
        return res.status(404).json({ success: false, error: 'Role not found' });
      }
      return res.json({ success: true, data: role });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/roles - Create a new user role
  create: async (req, res, next) => {
    try {
      const { display_name, name, description, permissions } = req.body;
      if (!display_name || !display_name.trim()) {
        return res.status(422).json({ success: false, error: 'Role display name is required' });
      }

      const role = await RoleModel.create({
        display_name,
        name,
        description,
        permissions
      });

      logger.info('ROLES', `Created new user role: ${role.display_name} (${role.name})`);
      return res.status(201).json({ success: true, data: role });
    } catch (err) {
      next(err);
    }
  },

  // PUT /api/roles/:id - Update an existing role
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { display_name, description, permissions } = req.body;

      const role = await RoleModel.update(id, {
        display_name,
        description,
        permissions
      });

      logger.info('ROLES', `Updated user role #${id}: ${role.display_name}`);
      return res.json({ success: true, data: role });
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/roles/:id - Delete a custom role
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await RoleModel.delete(id);
      logger.info('ROLES', `Deleted user role #${id}`);
      return res.json(result);
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }
};

module.exports = roleController;

