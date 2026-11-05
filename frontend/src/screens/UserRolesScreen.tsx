import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator } from 'react-native';
import { 
  Shield, Plus, Search, Edit2, Trash2, Check, X, Users, 
  Lock, CheckSquare, Square, AlertCircle, Info, Sparkles 
} from 'lucide-react';
import { BrandColors } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { RoleRecord, PermissionCategoryGroup } from '../types';

export const UserRolesScreen: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
  const { 
    roles, 
    permissionGroups, 
    users, 
    createRole, 
    updateRole, 
    deleteRole, 
    showSnackbar 
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'system' | 'custom'>('all');

  // Modal State for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleRecord | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [roleCode, setRoleCode] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Delete Confirmation State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<RoleRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtered Roles
  const filteredRoles = useMemo(() => {
    return roles.filter(role => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q || 
        role.display_name.toLowerCase().includes(q) ||
        role.name.toLowerCase().includes(q) ||
        (role.description && role.description.toLowerCase().includes(q));

      const matchesFilter = 
        filterType === 'all' ||
        (filterType === 'system' && role.is_system) ||
        (filterType === 'custom' && !role.is_system);

      return matchesSearch && matchesFilter;
    });
  }, [roles, searchQuery, filterType]);

  // Aggregate Metrics
  const totalRoles = roles.length;
  const systemRolesCount = roles.filter(r => r.is_system).length;
  const customRolesCount = roles.filter(r => !r.is_system).length;
  const totalAssignedUsers = users.length;
  const allAvailablePermissions = useMemo(() => {
    const list: string[] = [];
    permissionGroups.forEach(g => {
      g.permissions.forEach(p => list.push(p.name));
    });
    return list;
  }, [permissionGroups]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingRole(null);
    setDisplayName('');
    setRoleCode('');
    setDescription('');
    // Default: basic view permissions
    setSelectedPermissions(['leads.view', 'whatsapp.view', 'pipeline.view', 'profile.view']);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (role: RoleRecord) => {
    setEditingRole(role);
    setDisplayName(role.display_name);
    setRoleCode(role.name);
    setDescription(role.description || '');
    setSelectedPermissions(role.permissions || []);
    setIsModalOpen(true);
  };

  // Toggle single permission
  const togglePermission = (name: string) => {
    setSelectedPermissions(prev => 
      prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]
    );
  };

  // Toggle all permissions in a category
  const toggleCategoryPermissions = (perms: string[]) => {
    const allSelected = perms.every(p => selectedPermissions.includes(p));
    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(p => !perms.includes(p)));
    } else {
      setSelectedPermissions(prev => Array.from(new Set([...prev, ...perms])));
    }
  };

  // Select All Globally
  const handleSelectAll = () => {
    setSelectedPermissions([...allAvailablePermissions]);
  };

  // Clear All Globally
  const handleClearAll = () => {
    setSelectedPermissions([]);
  };

  // Save Role (Create or Update)
  const handleSave = async () => {
    if (!displayName.trim()) {
      showSnackbar('Please enter a role display name', 'error');
      return;
    }

    setIsSaving(true);
    try {
      if (editingRole) {
        await updateRole(editingRole.id, {
          display_name: displayName.trim(),
          description: description.trim(),
          permissions: selectedPermissions,
        });
        showSnackbar(`Role "${displayName}" updated successfully!`, 'success');
      } else {
        const created = await createRole({
          display_name: displayName.trim(),
          name: roleCode.trim() || undefined,
          description: description.trim(),
          permissions: selectedPermissions,
        });
        showSnackbar(`Role "${created.display_name}" created successfully!`, 'success');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showSnackbar(err.message || 'Failed to save role', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Open Delete Modal
  const handleConfirmDelete = (role: RoleRecord) => {
    if (role.is_system) {
      showSnackbar('System roles cannot be deleted', 'error');
      return;
    }
    if ((role.user_count || 0) > 0) {
      showSnackbar(`Cannot delete role: ${role.user_count} user(s) currently assigned. Please reassign them first.`, 'error');
      return;
    }
    setRoleToDelete(role);
    setIsDeleteModalOpen(true);
  };

  // Execute Delete
  const handleDelete = async () => {
    if (!roleToDelete) return;
    setIsDeleting(true);
    try {
      await deleteRole(roleToDelete.id);
      showSnackbar(`Role "${roleToDelete.display_name}" deleted`, 'success');
      setIsDeleteModalOpen(false);
      setRoleToDelete(null);
    } catch (err: any) {
      showSnackbar(err.message || 'Failed to delete role', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={[styles.header, isMobile && styles.headerMobile]}>
        <View style={styles.headerLeft}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.pageTitle}>User Roles & Permissions</Text>
            <View style={styles.badgeRbac}>
              <Text style={styles.badgeRbacText}>RBAC Active</Text>
            </View>
          </View>
          <Text style={styles.pageSubtitle}>
            Configure role boundaries, departmental privileges, and modular access control across Myth Connect.ai
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.createBtn}
          onPress={handleOpenCreate}
          activeOpacity={0.8}
        >
          <Plus size={16} color="#FFFFFF" />
          <Text style={styles.createBtnText}>Create Role</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollInner}>
        {/* KPI Metrics Summary Row */}
        <View style={[styles.kpiRow, isMobile && styles.kpiRowMobile]}>
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBox, { backgroundColor: '#EEF2FF' }]}>
              <Shield size={20} color={BrandColors.blue} />
            </View>
            <View>
              <Text style={styles.kpiValue}>{totalRoles}</Text>
              <Text style={styles.kpiLabel}>Total User Roles</Text>
            </View>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBox, { backgroundColor: '#F0FDF4' }]}>
              <Users size={20} color={BrandColors.green} />
            </View>
            <View>
              <Text style={styles.kpiValue}>{totalAssignedUsers}</Text>
              <Text style={styles.kpiLabel}>Assigned Team Members</Text>
            </View>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Lock size={20} color={BrandColors.orange} />
            </View>
            <View>
              <Text style={styles.kpiValue}>{systemRolesCount}</Text>
              <Text style={styles.kpiLabel}>System Protected</Text>
            </View>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBox, { backgroundColor: '#F3E8FF' }]}>
              <Sparkles size={20} color="#9333EA" />
            </View>
            <View>
              <Text style={styles.kpiValue}>{customRolesCount}</Text>
              <Text style={styles.kpiLabel}>Custom Created Roles</Text>
            </View>
          </View>
        </View>

        {/* Filter and Search Bar */}
        <View style={[styles.filterBar, isMobile && styles.filterBarMobile]}>
          <View style={styles.searchBox}>
            <Search size={16} color={BrandColors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by role title, identifier, or permissions..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={BrandColors.textMuted}
            />
          </View>

          <View style={styles.filterPills}>
            <TouchableOpacity 
              style={[styles.pill, filterType === 'all' && styles.pillActive]}
              onPress={() => setFilterType('all')}
            >
              <Text style={[styles.pillText, filterType === 'all' && styles.pillTextActive]}>
                All Roles ({totalRoles})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.pill, filterType === 'system' && styles.pillActive]}
              onPress={() => setFilterType('system')}
            >
              <Text style={[styles.pillText, filterType === 'system' && styles.pillTextActive]}>
                System ({systemRolesCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.pill, filterType === 'custom' && styles.pillActive]}
              onPress={() => setFilterType('custom')}
            >
              <Text style={[styles.pillText, filterType === 'custom' && styles.pillTextActive]}>
                Custom ({customRolesCount})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Roles Grid Cards */}
        <View style={styles.rolesGrid}>
          {filteredRoles.map(role => {
            const permCount = role.permissions ? role.permissions.length : 0;
            const userCount = role.user_count || 0;

            return (
              <View key={role.id} style={styles.roleCard}>
                {/* Role Card Header */}
                <View style={styles.roleCardHeader}>
                  <View style={styles.roleCardTitleRow}>
                    <View style={styles.roleIconBox}>
                      <Shield size={18} color={BrandColors.blue} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.roleDisplayName}>{role.display_name}</Text>
                      <Text style={styles.roleCodeText}>code: {role.name}</Text>
                    </View>
                  </View>

                  {role.is_system ? (
                    <View style={styles.systemBadge}>
                      <Lock size={12} color="#475569" />
                      <Text style={styles.systemBadgeText}>System Default</Text>
                    </View>
                  ) : (
                    <View style={styles.customBadge}>
                      <Text style={styles.customBadgeText}>Custom Role</Text>
                    </View>
                  )}
                </View>

                {/* Role Description */}
                <Text style={styles.roleDescText} numberOfLines={2}>
                  {role.description || 'No description provided for this user role.'}
                </Text>

                {/* Role Meta Information */}
                <View style={styles.roleMetaRow}>
                  <View style={styles.roleMetaItem}>
                    <Users size={14} color={BrandColors.textSecondary} />
                    <Text style={styles.roleMetaText}>
                      <Text style={{ fontWeight: '700', color: BrandColors.darkNavy }}>{userCount}</Text> {userCount === 1 ? 'user' : 'users'} assigned
                    </Text>
                  </View>

                  <View style={styles.roleMetaItem}>
                    <Shield size={14} color={BrandColors.blue} />
                    <Text style={styles.roleMetaText}>
                      <Text style={{ fontWeight: '700', color: BrandColors.blue }}>{permCount}</Text> {permCount === 1 ? 'permission' : 'permissions'}
                    </Text>
                  </View>
                </View>

                {/* Permissions Sample Chips */}
                <View style={styles.chipsContainer}>
                  {role.permissions && role.permissions.slice(0, 4).map(p => (
                    <View key={p} style={styles.permChip}>
                      <Text style={styles.permChipText}>{p}</Text>
                    </View>
                  ))}
                  {permCount > 4 && (
                    <View style={[styles.permChip, { backgroundColor: '#F1F5F9' }]}>
                      <Text style={[styles.permChipText, { color: BrandColors.textSecondary, fontWeight: '700' }]}>
                        +{permCount - 4} more
                      </Text>
                    </View>
                  )}
                </View>

                {/* Card Action Buttons */}
                <View style={styles.cardActions}>
                  <TouchableOpacity 
                    style={styles.editBtn}
                    onPress={() => handleOpenEdit(role)}
                    activeOpacity={0.8}
                  >
                    <Edit2 size={14} color={BrandColors.blue} />
                    <Text style={styles.editBtnText}>Edit Permissions</Text>
                  </TouchableOpacity>

                  {!role.is_system && (
                    <TouchableOpacity 
                      style={[
                        styles.deleteBtn, 
                        userCount > 0 && styles.deleteBtnDisabled
                      ]}
                      onPress={() => handleConfirmDelete(role)}
                      activeOpacity={0.8}
                      disabled={userCount > 0}
                    >
                      <Trash2 size={14} color={userCount > 0 ? '#94A3B8' : BrandColors.red} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {filteredRoles.length === 0 && (
          <View style={styles.emptyState}>
            <Shield size={40} color={BrandColors.textMuted} />
            <Text style={styles.emptyStateTitle}>No User Roles Found</Text>
            <Text style={styles.emptyStateSubtitle}>
              Try adjusting your search query or create a new custom role.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Create / Edit Role Modal Dialog */}
      <Modal visible={isModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalDialog, isMobile && styles.modalDialogMobile]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {editingRole ? `Edit Role: ${editingRole.display_name}` : 'Create New User Role'}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {editingRole 
                    ? 'Modify role title, description, and granted granular permissions'
                    : 'Define role metadata and assign functional module access'
                  }
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <X size={20} color={BrandColors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Modal Scrollable Body */}
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={true}>
              <View style={styles.formRow}>
                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>Role Display Name *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. Senior Sales Executive"
                    value={displayName}
                    onChangeText={setDisplayName}
                    placeholderTextColor={BrandColors.textMuted}
                  />
                </View>

                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>Identifier Code (Slug)</Text>
                  <TextInput
                    style={[styles.formInput, editingRole?.is_system && styles.formInputDisabled]}
                    placeholder="e.g. senior_sales_exec"
                    value={roleCode}
                    onChangeText={setRoleCode}
                    editable={!editingRole?.is_system}
                    placeholderTextColor={BrandColors.textMuted}
                  />
                </View>
              </View>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>Role Description</Text>
                <TextInput
                  style={[styles.formInput, { height: 60, textAlignVertical: 'top' }]}
                  placeholder="Outline responsibilities and authorization scope..."
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={2}
                  placeholderTextColor={BrandColors.textMuted}
                />
              </View>

              {/* Permissions Matrix Header */}
              <View style={styles.permHeaderRow}>
                <View>
                  <Text style={styles.permSectionTitle}>MODULE PERMISSIONS MATRIX</Text>
                  <Text style={styles.permSectionSubtitle}>
                    {selectedPermissions.length} of {allAvailablePermissions.length} permissions granted
                  </Text>
                </View>

                <View style={styles.permQuickActions}>
                  <TouchableOpacity style={styles.permQuickBtn} onPress={handleSelectAll}>
                    <Text style={styles.permQuickBtnText}>Select All</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.permQuickBtn} onPress={handleClearAll}>
                    <Text style={styles.permQuickBtnText}>Clear All</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Permission Groups */}
              {permissionGroups.map(group => {
                const groupPermNames = group.permissions.map(p => p.name);
                const isAllSelected = groupPermNames.every(p => selectedPermissions.includes(p));
                const selectedInGroup = groupPermNames.filter(p => selectedPermissions.includes(p)).length;

                return (
                  <View key={group.category} style={styles.permGroupCard}>
                    <View style={styles.permGroupHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={styles.permGroupTitle}>{group.category}</Text>
                        <View style={styles.permGroupBadge}>
                          <Text style={styles.permGroupBadgeText}>
                            {selectedInGroup}/{groupPermNames.length}
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity 
                        style={styles.groupToggleBtn}
                        onPress={() => toggleCategoryPermissions(groupPermNames)}
                      >
                        <Text style={styles.groupToggleText}>
                          {isAllSelected ? 'Deselect Category' : 'Select All'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.permList}>
                      {group.permissions.map(perm => {
                        const isChecked = selectedPermissions.includes(perm.name);

                        return (
                          <TouchableOpacity
                            key={perm.id}
                            style={[styles.permItem, isChecked && styles.permItemChecked]}
                            onPress={() => togglePermission(perm.name)}
                            activeOpacity={0.7}
                          >
                            <View style={[styles.checkbox, isChecked && styles.checkboxActive]}>
                              {isChecked && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                            </View>

                            <View style={{ flex: 1 }}>
                              <Text style={[styles.permName, isChecked && styles.permNameActive]}>
                                {perm.name}
                              </Text>
                              <Text style={styles.permDesc}>{perm.description}</Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={() => setIsModalOpen(false)}
                disabled={isSaving}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.saveBtn, isSaving && { opacity: 0.7 }]} 
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>
                    {editingRole ? 'Update Role' : 'Create Role'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal visible={isDeleteModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.deleteDialog}>
            <View style={styles.deleteIconBox}>
              <AlertCircle size={28} color={BrandColors.red} />
            </View>

            <Text style={styles.deleteTitle}>Delete User Role?</Text>
            <Text style={styles.deleteDesc}>
              Are you sure you want to delete role <Text style={{ fontWeight: '700', color: BrandColors.darkNavy }}>"{roleToDelete?.display_name}"</Text>? 
              This action permanently removes this role and its permission assignments.
            </Text>

            <View style={styles.deleteActions}>
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.confirmDeleteBtn, isDeleting && { opacity: 0.7 }]} 
                onPress={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmDeleteText}>Delete Role</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.bg,
  },
  header: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: BrandColors.darkNavy,
  },
  badgeRbac: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeRbacText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },
  pageSubtitle: {
    fontSize: 13,
    color: BrandColors.textSecondary,
    marginTop: 4,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: BrandColors.blue,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  scrollArea: {
    flex: 1,
  },
  scrollInner: {
    padding: 24,
    gap: 20,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 16,
  },
  kpiRowMobile: {
    flexDirection: 'column',
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: BrandColors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  kpiIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '800',
    color: BrandColors.darkNavy,
  },
  kpiLabel: {
    fontSize: 12,
    color: BrandColors.textSecondary,
    marginTop: 2,
  },
  filterBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: BrandColors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  filterBarMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: BrandColors.bg,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: BrandColors.darkNavy,
    padding: 0,
  },
  filterPills: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: BrandColors.bg,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  pillActive: {
    backgroundColor: BrandColors.blueLight,
    borderColor: BrandColors.blue,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: BrandColors.textSecondary,
  },
  pillTextActive: {
    color: BrandColors.blue,
    fontWeight: '700',
  },
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  roleCard: {
    width: 'calc(33.333% - 11px)' as any,
    minWidth: 320,
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BrandColors.border,
    padding: 20,
    justifyContent: 'space-between',
  },
  roleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  roleCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  roleIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: BrandColors.blueLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleDisplayName: {
    fontSize: 16,
    fontWeight: '700',
    color: BrandColors.darkNavy,
  },
  roleCodeText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: BrandColors.textMuted,
    marginTop: 2,
  },
  systemBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  systemBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  customBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  customBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: BrandColors.blue,
  },
  roleDescText: {
    fontSize: 13,
    color: BrandColors.textSecondary,
    lineHeight: 18,
    marginTop: 12,
  },
  roleMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: BrandColors.border,
    marginVertical: 14,
  },
  roleMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roleMetaText: {
    fontSize: 12,
    color: BrandColors.textSecondary,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  permChip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  permChipText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#334155',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: BrandColors.blueLight,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: BrandColors.blue,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtnDisabled: {
    backgroundColor: '#F1F5F9',
    opacity: 0.5,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: BrandColors.darkNavy,
    marginTop: 12,
  },
  emptyStateSubtitle: {
    fontSize: 13,
    color: BrandColors.textSecondary,
    marginTop: 4,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalDialog: {
    width: '100%',
    maxWidth: 760,
    maxHeight: '90vh' as any,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  modalDialogMobile: {
    maxWidth: '100%',
    maxHeight: '95vh' as any,
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: BrandColors.darkNavy,
  },
  modalSubtitle: {
    fontSize: 12,
    color: BrandColors.textSecondary,
    marginTop: 2,
  },
  modalBody: {
    padding: 20,
    maxHeight: '65vh' as any,
  },
  formRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  formCol: {
    flex: 1,
  },
  formField: {
    marginBottom: 18,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: BrandColors.darkNavy,
    marginBottom: 6,
  },
  formInput: {
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: BrandColors.darkNavy,
    backgroundColor: '#FFFFFF',
  },
  formInputDisabled: {
    backgroundColor: '#F1F5F9',
    color: '#64748B',
  },
  permHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.border,
  },
  permSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: BrandColors.darkNavy,
    letterSpacing: 0.5,
  },
  permSectionSubtitle: {
    fontSize: 11,
    color: BrandColors.blue,
    fontWeight: '600',
    marginTop: 2,
  },
  permQuickActions: {
    flexDirection: 'row',
    gap: 8,
  },
  permQuickBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  permQuickBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: BrandColors.darkNavy,
  },
  permGroupCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    overflow: 'hidden',
  },
  permGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#F1F5F9',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  permGroupTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: BrandColors.darkNavy,
  },
  permGroupBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  permGroupBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  groupToggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  groupToggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: BrandColors.blue,
  },
  permList: {
    padding: 10,
    gap: 8,
  },
  permItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  permItemChecked: {
    backgroundColor: '#F0F7FF',
    borderColor: '#BFDBFE',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    backgroundColor: '#FFFFFF',
  },
  checkboxActive: {
    backgroundColor: BrandColors.blue,
    borderColor: BrandColors.blue,
  },
  permName: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#334155',
  },
  permNameActive: {
    color: BrandColors.blue,
  },
  permDesc: {
    fontSize: 11,
    color: BrandColors.textSecondary,
    marginTop: 2,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: BrandColors.border,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    backgroundColor: '#FFFFFF',
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: BrandColors.darkNavy,
  },
  saveBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: BrandColors.blue,
    minWidth: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Delete Dialog Styles
  deleteDialog: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  deleteIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: BrandColors.darkNavy,
    marginBottom: 8,
  },
  deleteDesc: {
    fontSize: 13,
    color: BrandColors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  deleteActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
  },
  confirmDeleteBtn: {
    backgroundColor: BrandColors.red,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmDeleteText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
