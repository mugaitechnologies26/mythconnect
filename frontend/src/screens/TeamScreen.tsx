import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  ActivityIndicator,
  Image 
} from 'react-native';
import { 
  ShieldCheck, 
  UserCheck, 
  Mail, 
  Phone, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  Users, 
  Shield, 
  Building2, 
  Lock,
  Sparkles,
  UserPlus
} from 'lucide-react';
import { BrandColors } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { User } from '../types';

export const TeamScreen: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
  const { 
    users, 
    roles, 
    currentUser, 
    addUser, 
    updateUser, 
    deleteUser, 
    showSnackbar 
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal State for Add / Edit Team Member
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [teamName, setTeamName] = useState('Enterprise Sales Team');
  const [customTeamName, setCustomTeamName] = useState('');
  const [password, setPassword] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Delete Confirmation Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pre-defined departments
  const departmentOptions = [
    'Enterprise Sales Team',
    'Retail & SMB Team',
    'Customer Success',
    'Operations & Logistics',
    'Finance & Accounts',
    'Other (Custom)'
  ];

  // Helper for role color
  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'super_admin':
        return { bg: '#F3E8FF', text: '#7C3AED', border: '#DDD6FE' };
      case 'admin':
        return { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' };
      case 'sales_manager':
        return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' };
      case 'sales_executive':
        return { bg: '#EEF2FF', text: '#4F46E5', border: '#C7D2FE' };
      case 'accounts':
        return { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' };
      default:
        return { bg: '#F0FDFA', text: '#0D9488', border: '#99F6E4' };
    }
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q)) ||
        (u.team_name && u.team_name.toLowerCase().includes(q)) ||
        (u.role_display && u.role_display.toLowerCase().includes(q));

      const matchesRole = 
        selectedRoleFilter === 'all' || 
        u.role === selectedRoleFilter ||
        String(u.role_id) === selectedRoleFilter;

      const matchesStatus = 
        selectedStatusFilter === 'all' ||
        (selectedStatusFilter === 'active' && u.is_active) ||
        (selectedStatusFilter === 'inactive' && !u.is_active);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, selectedRoleFilter, selectedStatusFilter]);

  // Open modal for new member
  const handleOpenAddModal = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPhone('');
    // Default to first non-super_admin role or first available
    const defaultRole = roles.find(r => r.name === 'sales_executive') || roles[0];
    setSelectedRoleId(defaultRole ? defaultRole.id : 4);
    setTeamName('Enterprise Sales Team');
    setCustomTeamName('');
    setPassword('Secret123!');
    setIsActive(true);
    setIsModalOpen(true);
  };

  // Open modal for editing existing member
  const handleOpenEditModal = (u: User) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setPhone(u.phone || '');
    
    // Find role_id
    let rId = u.role_id;
    if (!rId) {
      const matchRole = roles.find(r => r.name === u.role || r.display_name === u.role_display);
      rId = matchRole ? matchRole.id : 4;
    }
    setSelectedRoleId(rId);

    const isKnownDept = departmentOptions.includes(u.team_name || '');
    if (isKnownDept) {
      setTeamName(u.team_name || 'Enterprise Sales Team');
      setCustomTeamName('');
    } else if (u.team_name) {
      setTeamName('Other (Custom)');
      setCustomTeamName(u.team_name);
    } else {
      setTeamName('Enterprise Sales Team');
      setCustomTeamName('');
    }

    setPassword('');
    setIsActive(Boolean(u.is_active));
    setIsModalOpen(true);
  };

  // Save handler (Add or Update)
  const handleSaveMember = async () => {
    if (!name.trim()) {
      showSnackbar('Please enter the team member name', 'error');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      showSnackbar('Please enter a valid email address', 'error');
      return;
    }

    const assignedRoleObj = roles.find(r => r.id === selectedRoleId) || roles[0];
    const finalRoleSlug = assignedRoleObj ? assignedRoleObj.name : 'sales_executive';
    const finalRoleDisplay = assignedRoleObj ? assignedRoleObj.display_name : 'Sales Executive';
    const finalTeam = teamName === 'Other (Custom)' ? (customTeamName.trim() || 'General') : teamName;

    setIsSaving(true);
    try {
      if (editingUser) {
        // Update existing member
        await updateUser(editingUser.id, {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          role: finalRoleSlug,
          role_display: finalRoleDisplay,
          role_id: assignedRoleObj ? assignedRoleObj.id : undefined,
          team_name: finalTeam,
          is_active: isActive,
          ...(password ? { password } : {})
        });
        showSnackbar(`Team member ${name.trim()} updated with role "${finalRoleDisplay}"!`, 'success');
      } else {
        // Add new team member
        await addUser({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || '+919800000000',
          role: finalRoleSlug,
          role_display: finalRoleDisplay,
          role_id: assignedRoleObj ? assignedRoleObj.id : 4,
          team_name: finalTeam,
          is_active: isActive,
          password: password || 'Secret123!'
        });
        showSnackbar(`Team member ${name.trim()} added with role "${finalRoleDisplay}"!`, 'success');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showSnackbar(err.message || 'Failed to save team member', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Confirm delete handler
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await deleteUser(userToDelete.id);
      showSnackbar(`Team member ${userToDelete.name} removed.`, 'info');
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (err: any) {
      showSnackbar(err.message || 'Failed to remove team member', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const selectedRoleDetails = roles.find(r => r.id === selectedRoleId);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, isMobile && styles.headerMobile]}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={styles.pageTitle}>Team & Access Control</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{users.length} Members</Text>
            </View>
          </View>
          <Text style={styles.pageSubtitle}>
            Add team members, assign corporate roles, and configure departmental permissions
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.addBtn}
          onPress={handleOpenAddModal}
          activeOpacity={0.85}
        >
          <UserPlus size={16} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add Team Member</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollInner}>
        {/* KPI Summary Cards */}
        <View style={[styles.statsRow, isMobile && styles.statsRowMobile]}>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#EFF6FF' }]}>
              <Users size={20} color="#2563EB" />
            </View>
            <View>
              <Text style={styles.statLabel}>Total Members</Text>
              <Text style={styles.statValue}>{users.length}</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#ECFDF5' }]}>
              <UserCheck size={20} color="#059669" />
            </View>
            <View>
              <Text style={styles.statLabel}>Active Members</Text>
              <Text style={styles.statValue}>{users.filter(u => u.is_active).length}</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#F3E8FF' }]}>
              <ShieldCheck size={20} color="#7C3AED" />
            </View>
            <View>
              <Text style={styles.statLabel}>System & Custom Roles</Text>
              <Text style={styles.statValue}>{roles.length}</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Building2 size={20} color="#D97706" />
            </View>
            <View>
              <Text style={styles.statLabel}>Departments</Text>
              <Text style={styles.statValue}>
                {new Set(users.map(u => u.team_name).filter(Boolean)).size || 2}
              </Text>
            </View>
          </View>
        </View>

        {/* Filter & Search Bar */}
        <View style={[styles.filterBar, isMobile && styles.filterBarMobile]}>
          <View style={styles.searchBox}>
            <Search size={16} color={BrandColors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, email, phone, or role..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={BrandColors.textMuted}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={15} color={BrandColors.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.filterPills}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              <TouchableOpacity
                style={[styles.filterPill, selectedRoleFilter === 'all' && styles.filterPillActive]}
                onPress={() => setSelectedRoleFilter('all')}
              >
                <Text style={[styles.filterPillText, selectedRoleFilter === 'all' && styles.filterPillTextActive]}>
                  All Roles ({users.length})
                </Text>
              </TouchableOpacity>

              {roles.map(r => (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.filterPill, selectedRoleFilter === r.name && styles.filterPillActive]}
                  onPress={() => setSelectedRoleFilter(selectedRoleFilter === r.name ? 'all' : r.name)}
                >
                  <Text style={[styles.filterPillText, selectedRoleFilter === r.name && styles.filterPillTextActive]}>
                    {r.display_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Members Table */}
        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 2.2 }]}>TEAM MEMBER</Text>
            <Text style={[styles.th, { flex: 1.8 }]}>DEPARTMENT / TEAM</Text>
            <Text style={[styles.th, { flex: 1.8 }]}>ASSIGNED ROLE</Text>
            <Text style={[styles.th, { flex: 1.2, textAlign: 'center' }]}>STATUS</Text>
            <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>ACTIONS</Text>
          </View>

          {filteredUsers.length === 0 ? (
            <View style={styles.emptyState}>
              <Users size={40} color={BrandColors.border} />
              <Text style={styles.emptyTitle}>No team members found</Text>
              <Text style={styles.emptySubtitle}>Try adjusting your search criteria or add a new team member.</Text>
            </View>
          ) : (
            filteredUsers.map((u, i) => {
              const roleTheme = getRoleColor(u.role);
              const initials = u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

              return (
                <View key={u.id || i} style={styles.tableRow}>
                  {/* Name & Contact */}
                  <View style={[styles.td, { flex: 2.2, flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
                    <View style={styles.avatarContainer}>
                      {u.avatar_url ? (
                        <Image source={{ uri: u.avatar_url }} style={styles.avatarImage} />
                      ) : (
                        <View style={[styles.avatarFallback, { backgroundColor: roleTheme.bg }]}>
                          <Text style={[styles.avatarInitials, { color: roleTheme.text }]}>{initials}</Text>
                        </View>
                      )}
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.nameText}>{u.name}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <Mail size={12} color={BrandColors.textMuted} />
                        <Text style={styles.emailText} numberOfLines={1}>{u.email}</Text>
                      </View>
                      {u.phone ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                          <Phone size={11} color={BrandColors.textMuted} />
                          <Text style={styles.phoneText}>{u.phone}</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>

                  {/* Department / Team */}
                  <View style={[styles.td, { flex: 1.8 }]}>
                    <View style={styles.departmentBadge}>
                      <Building2 size={12} color={BrandColors.textSecondary} />
                      <Text style={styles.departmentText}>{u.team_name || 'General Operations'}</Text>
                    </View>
                  </View>

                  {/* Assigned Role */}
                  <View style={[styles.td, { flex: 1.8 }]}>
                    <View style={[styles.roleBadge, { backgroundColor: roleTheme.bg, borderColor: roleTheme.border }]}>
                      <Shield size={12} color={roleTheme.text} />
                      <Text style={[styles.roleBadgeText, { color: roleTheme.text }]}>
                        {u.role_display || u.role}
                      </Text>
                    </View>
                  </View>

                  {/* Status */}
                  <View style={[styles.td, { flex: 1.2, alignItems: 'center' }]}>
                    <View style={[styles.statusPill, u.is_active ? styles.statusPillActive : styles.statusPillInactive]}>
                      <View style={[styles.statusDot, { backgroundColor: u.is_active ? BrandColors.green : '#94A3B8' }]} />
                      <Text style={[styles.statusPillText, { color: u.is_active ? BrandColors.green : '#64748B' }]}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </Text>
                    </View>
                  </View>

                  {/* Actions */}
                  <View style={[styles.td, { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }]}>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleOpenEditModal(u)}
                      title="Edit Member & Role"
                    >
                      <Edit2 size={15} color={BrandColors.blue} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionBtnDanger]}
                      onPress={() => {
                        setUserToDelete(u);
                        setIsDeleteModalOpen(true);
                      }}
                      title="Remove Member"
                    >
                      <Trash2 size={15} color={BrandColors.red} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* ========================================================================= */}
      {/* ADD / EDIT TEAM MEMBER MODAL */}
      {/* ========================================================================= */}
      <Modal
        visible={isModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => !isSaving && setIsModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, isMobile && styles.modalCardMobile]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={styles.modalIconBox}>
                  {editingUser ? <Edit2 size={20} color={BrandColors.blue} /> : <UserPlus size={20} color={BrandColors.blue} />}
                </View>
                <View>
                  <Text style={styles.modalTitle}>
                    {editingUser ? `Edit ${editingUser.name}` : 'Add New Team Member'}
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    Assign user credentials, corporate role, and departmental team
                  </Text>
                </View>
              </View>

              <TouchableOpacity 
                onPress={() => setIsModalOpen(false)}
                disabled={isSaving}
                style={styles.closeBtn}
              >
                <X size={18} color={BrandColors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Modal Form */}
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Full Name */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  FULL NAME <Text style={{ color: BrandColors.red }}>*</Text>
                </Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Ramesh Chandra"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor={BrandColors.textMuted}
                />
              </View>

              {/* Email Address */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  WORK EMAIL ADDRESS <Text style={{ color: BrandColors.red }}>*</Text>
                </Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. ramesh.c@mythconnect.ai"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={BrandColors.textMuted}
                />
              </View>

              {/* Phone Number */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>PHONE / WHATSAPP NUMBER</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. +919876543210"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholderTextColor={BrandColors.textMuted}
                />
              </View>

              {/* ASSIGN USER ROLE (PRIMARY FEATURE) */}
              <View style={styles.formGroup}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={styles.formLabel}>
                    ASSIGN USER ROLE <Text style={{ color: BrandColors.red }}>*</Text>
                  </Text>
                  <Text style={styles.helperText}>Determines dashboard menus & permissions</Text>
                </View>

                <View style={styles.roleGrid}>
                  {roles.map(r => {
                    const isSelected = selectedRoleId === r.id;
                    const rTheme = getRoleColor(r.name);

                    return (
                      <TouchableOpacity
                        key={r.id}
                        style={[
                          styles.roleOptionCard,
                          isSelected && styles.roleOptionCardSelected,
                          isSelected && { borderColor: rTheme.text }
                        ]}
                        onPress={() => setSelectedRoleId(r.id)}
                        activeOpacity={0.8}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <View style={[styles.roleDot, { backgroundColor: rTheme.text }]} />
                            <Text style={[styles.roleOptionTitle, isSelected && { color: rTheme.text, fontWeight: '700' }]}>
                              {r.display_name}
                            </Text>
                          </View>
                          {isSelected ? (
                            <View style={[styles.checkCircle, { backgroundColor: rTheme.text }]}>
                              <Check size={12} color="#FFFFFF" />
                            </View>
                          ) : null}
                        </View>

                        {r.description ? (
                          <Text style={styles.roleOptionDesc} numberOfLines={2}>
                            {r.description}
                          </Text>
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {selectedRoleDetails ? (
                  <View style={styles.roleDetailBanner}>
                    <ShieldCheck size={16} color={BrandColors.blue} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.roleDetailBannerText}>
                        Role <Text style={{ fontWeight: '700' }}>{selectedRoleDetails.display_name}</Text> grants access to{' '}
                        {(selectedRoleDetails.permissions || []).filter(p => p.startsWith('menu.')).length || 'standard'} sidebar menus.
                      </Text>
                    </View>
                  </View>
                ) : null}
              </View>

              {/* Department / Team */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>DEPARTMENT / TEAM</Text>
                <View style={styles.deptWrap}>
                  {departmentOptions.map(dept => (
                    <TouchableOpacity
                      key={dept}
                      style={[styles.deptPill, teamName === dept && styles.deptPillSelected]}
                      onPress={() => setTeamName(dept)}
                    >
                      <Text style={[styles.deptPillText, teamName === dept && styles.deptPillTextSelected]}>
                        {dept}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {teamName === 'Other (Custom)' ? (
                  <TextInput
                    style={[styles.formInput, { marginTop: 8 }]}
                    placeholder="Enter custom department or team name..."
                    value={customTeamName}
                    onChangeText={setCustomTeamName}
                    placeholderTextColor={BrandColors.textMuted}
                  />
                ) : null}
              </View>

              {/* Password */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  {editingUser ? 'RESET PASSWORD (LEAVE BLANK TO KEEP EXISTING)' : 'INITIAL LOGIN PASSWORD'}
                </Text>
                <TextInput
                  style={styles.formInput}
                  placeholder={editingUser ? 'Enter new password or leave blank' : 'Secret123!'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholderTextColor={BrandColors.textMuted}
                />
              </View>

              {/* Status Toggle */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>ACCOUNT STATUS</Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity
                    style={[styles.statusToggleBtn, isActive && styles.statusToggleBtnActive]}
                    onPress={() => setIsActive(true)}
                  >
                    <Check size={14} color={isActive ? BrandColors.green : BrandColors.textMuted} />
                    <Text style={[styles.statusToggleText, isActive && { color: BrandColors.green, fontWeight: '700' }]}>
                      Active (Can login & access CRM)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.statusToggleBtn, !isActive && styles.statusToggleBtnInactive]}
                    onPress={() => setIsActive(false)}
                  >
                    <X size={14} color={!isActive ? BrandColors.red : BrandColors.textMuted} />
                    <Text style={[styles.statusToggleText, !isActive && { color: BrandColors.red, fontWeight: '700' }]}>
                      Inactive (Suspended)
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
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
                onPress={handleSaveMember}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Check size={16} color="#FFFFFF" />
                    <Text style={styles.saveBtnText}>
                      {editingUser ? 'Save Changes' : 'Add Team Member'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      <Modal
        visible={isDeleteModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => !isDeleting && setIsDeleteModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxWidth: 440 }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={[styles.modalIconBox, { backgroundColor: '#FEE2E2' }]}>
                  <Trash2 size={20} color={BrandColors.red} />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Remove Team Member</Text>
                  <Text style={styles.modalSubtitle}>This action cannot be undone</Text>
                </View>
              </View>
            </View>

            <View style={{ padding: 20 }}>
              <Text style={{ fontSize: 13.5, color: BrandColors.textPrimary, lineHeight: 20 }}>
                Are you sure you want to remove <Text style={{ fontWeight: '700' }}>{userToDelete?.name}</Text> ({userToDelete?.email})?
              </Text>
              <Text style={{ fontSize: 12, color: BrandColors.textSecondary, marginTop: 8 }}>
                Their assigned leads and activity history will be retained, but their login and role permissions will be revoked.
              </Text>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: BrandColors.red }]}
                onPress={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Confirm Remove</Text>
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
    gap: 12,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: BrandColors.darkNavy,
    fontFamily: "'Outfit', 'Inter', sans-serif",
  },
  pageSubtitle: {
    fontSize: 13,
    color: BrandColors.textSecondary,
    marginTop: 3,
  },
  countBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: BrandColors.blue,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.blue,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
    shadowColor: BrandColors.blue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  scrollArea: {
    flex: 1,
  },
  scrollInner: {
    padding: 24,
    paddingBottom: 80,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  statsRowMobile: {
    flexDirection: 'column',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: BrandColors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  statIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11.5,
    color: BrandColors.textSecondary,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 19,
    fontWeight: '800',
    color: BrandColors.darkNavy,
    marginTop: 2,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 16,
  },
  filterBarMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: BrandColors.textPrimary,
    outlineWidth: 0 as any,
  },
  filterPills: {
    flexDirection: 'row',
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  filterPillActive: {
    backgroundColor: BrandColors.blue,
    borderColor: BrandColors.blue,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: BrandColors.textSecondary,
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BrandColors.border,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.border,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  th: {
    fontSize: 11,
    fontWeight: '700',
    color: BrandColors.textMuted,
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.borderLight,
  },
  td: {
    justifyContent: 'center',
  },
  avatarContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  avatarFallback: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 13,
    fontWeight: '700',
  },
  nameText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: BrandColors.darkNavy,
  },
  emailText: {
    fontSize: 12,
    color: BrandColors.textSecondary,
  },
  phoneText: {
    fontSize: 11,
    color: BrandColors.textMuted,
  },
  departmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  departmentText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: BrandColors.textSecondary,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  roleBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusPillActive: {
    backgroundColor: '#ECFDF5',
  },
  statusPillInactive: {
    backgroundColor: '#F1F5F9',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnDanger: {
    backgroundColor: '#FEE2E2',
  },
  emptyState: {
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: BrandColors.darkNavy,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: BrandColors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 620,
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  modalCardMobile: {
    maxHeight: '95%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.border,
    backgroundColor: '#FAFCFE',
  },
  modalIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: BrandColors.darkNavy,
  },
  modalSubtitle: {
    fontSize: 12,
    color: BrandColors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 18,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: BrandColors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  helperText: {
    fontSize: 11,
    color: BrandColors.blue,
  },
  formInput: {
    height: 42,
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 13.5,
    color: BrandColors.textPrimary,
    backgroundColor: '#FFFFFF',
    outlineWidth: 0 as any,
  },
  roleGrid: {
    gap: 8,
  },
  roleOptionCard: {
    borderWidth: 1.5,
    borderColor: BrandColors.border,
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  roleOptionCardSelected: {
    backgroundColor: '#F8FAFC',
  },
  roleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  roleOptionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: BrandColors.darkNavy,
  },
  roleOptionDesc: {
    fontSize: 11.5,
    color: BrandColors.textSecondary,
    marginTop: 4,
    lineHeight: 16,
    paddingLeft: 16,
  },
  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleDetailBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  roleDetailBannerText: {
    fontSize: 12,
    color: BrandColors.blue,
    lineHeight: 16,
  },
  deptWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  deptPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  deptPillSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: BrandColors.blue,
  },
  deptPillText: {
    fontSize: 12,
    color: BrandColors.textSecondary,
    fontWeight: '600',
  },
  deptPillTextSelected: {
    color: BrandColors.blue,
    fontWeight: '700',
  },
  statusToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BrandColors.border,
    backgroundColor: '#F8FAFC',
  },
  statusToggleBtnActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  statusToggleBtnInactive: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  statusToggleText: {
    fontSize: 12,
    color: BrandColors.textSecondary,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: BrandColors.border,
    backgroundColor: '#FAFCFE',
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: BrandColors.textSecondary,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: BrandColors.blue,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 8,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
