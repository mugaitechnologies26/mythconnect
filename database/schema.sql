-- Myth Connect.ai CRM & Sales Platform
-- Production Normalized Database Schema (MySQL 8.0+ / MariaDB 10.5+)

SET FOREIGN_KEY_CHECKS = 0;

-- -------------------------------------------------------------
-- 1. ROLES & PERMISSIONS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS permissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    description TEXT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS role_has_permissions (
    role_id BIGINT UNSIGNED NOT NULL,
    permission_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_rhp_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE,
    CONSTRAINT fk_rhp_permission FOREIGN KEY (permission_id) REFERENCES permissions (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 2. TEAMS & USERS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS teams (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT NULL,
    leader_id BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id BIGINT UNSIGNED NOT NULL,
    team_id BIGINT UNSIGNED NULL,
    avatar_url VARCHAR(255) NULL,
    is_active TINYINT(1) DEFAULT 1,
    remember_token VARCHAR(100) NULL,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles (id),
    CONSTRAINT fk_users_team FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE SET NULL,
    INDEX idx_users_email (email),
    INDEX idx_users_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 3. LEAD SOURCES & STATUSES
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lead_sources (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE, -- meta, whatsapp, website, referral, manual, etc.
    color VARCHAR(20) DEFAULT '#1565E8',
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lead_statuses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE, -- new, contacted, qualified, quotation, negotiation, won, lost
    order_index INT NOT NULL DEFAULT 0,
    color VARCHAR(20) DEFAULT '#1565E8',
    is_won TINYINT(1) DEFAULT 0,
    is_lost TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 4. CUSTOMERS & CONTACTS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    company_name VARCHAR(150) NULL,
    email VARCHAR(150) NULL,
    phone VARCHAR(20) NOT NULL,
    alternate_phone VARCHAR(20) NULL,
    address TEXT NULL,
    city VARCHAR(100) NULL,
    state VARCHAR(100) NULL,
    pincode VARCHAR(20) NULL,
    country VARCHAR(100) DEFAULT 'India',
    gstin VARCHAR(50) NULL,
    total_orders INT DEFAULT 0,
    total_revenue DECIMAL(15,2) DEFAULT 0.00,
    outstanding_balance DECIMAL(15,2) DEFAULT 0.00,
    assigned_to BIGINT UNSIGNED NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_customers_assigned FOREIGN KEY (assigned_to) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT fk_customers_creator FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL,
    INDEX idx_customers_phone (phone),
    INDEX idx_customers_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS customer_contacts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(150) NOT NULL,
    designation VARCHAR(100) NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(150) NULL,
    is_primary TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_cc_customer FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 5. LEADS & META ADS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS meta_accounts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    business_id VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    access_token TEXT NOT NULL,
    is_connected TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS meta_pages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    meta_account_id BIGINT UNSIGNED NULL,
    page_id VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    access_token TEXT NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_mp_account FOREIGN KEY (meta_account_id) REFERENCES meta_accounts (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS meta_lead_forms (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    meta_page_id BIGINT UNSIGNED NULL,
    form_id VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    field_mappings JSON NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_mlf_page FOREIGN KEY (meta_page_id) REFERENCES meta_pages (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS leads (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    lead_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(150) NULL,
    company_name VARCHAR(150) NULL,
    lead_source_id BIGINT UNSIGNED NOT NULL,
    lead_status_id BIGINT UNSIGNED NOT NULL,
    assigned_to BIGINT UNSIGNED NULL,
    estimated_value DECIMAL(12,2) DEFAULT 0.00,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    city VARCHAR(100) NULL,
    state VARCHAR(100) NULL,
    meta_lead_id VARCHAR(100) NULL UNIQUE,
    meta_form_id VARCHAR(100) NULL,
    meta_page_id VARCHAR(100) NULL,
    meta_campaign_name VARCHAR(150) NULL,
    meta_ad_name VARCHAR(150) NULL,
    raw_payload JSON NULL,
    customer_id BIGINT UNSIGNED NULL,
    last_contacted_at TIMESTAMP NULL,
    next_followup_at TIMESTAMP NULL,
    converted_at TIMESTAMP NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_leads_source FOREIGN KEY (lead_source_id) REFERENCES lead_sources (id),
    CONSTRAINT fk_leads_status FOREIGN KEY (lead_status_id) REFERENCES lead_statuses (id),
    CONSTRAINT fk_leads_assigned FOREIGN KEY (assigned_to) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT fk_leads_customer FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE SET NULL,
    INDEX idx_leads_phone (phone),
    INDEX idx_leads_status (lead_status_id),
    INDEX idx_leads_assigned (assigned_to),
    INDEX idx_leads_next_followup (next_followup_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 6. LEAD ACTIVITIES, NOTES & FOLLOW-UPS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lead_activities (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    lead_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NULL,
    type VARCHAR(50) NOT NULL, -- lead_created, status_change, whatsapp_sent, call_made, quote_sent, etc.
    title VARCHAR(150) NOT NULL,
    description TEXT NULL,
    metadata JSON NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_la_lead FOREIGN KEY (lead_id) REFERENCES leads (id) ON DELETE CASCADE,
    CONSTRAINT fk_la_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lead_notes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    lead_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ln_lead FOREIGN KEY (lead_id) REFERENCES leads (id) ON DELETE CASCADE,
    CONSTRAINT fk_ln_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lead_followups (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    lead_id BIGINT UNSIGNED NOT NULL,
    assigned_to BIGINT UNSIGNED NOT NULL,
    scheduled_at DATETIME NOT NULL,
    type ENUM('call', 'whatsapp', 'meeting', 'email', 'other') DEFAULT 'call',
    status ENUM('pending', 'completed', 'rescheduled', 'cancelled') DEFAULT 'pending',
    notes TEXT NULL,
    outcome TEXT NULL,
    completed_at TIMESTAMP NULL,
    created_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_lf_lead FOREIGN KEY (lead_id) REFERENCES leads (id) ON DELETE CASCADE,
    CONSTRAINT fk_lf_assigned FOREIGN KEY (assigned_to) REFERENCES users (id),
    INDEX idx_followups_date_status (scheduled_at, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 7. WHATSAPP CRM & AUTOMATIONS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS whatsapp_templates (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) DEFAULT 'MARKETING',
    language VARCHAR(20) DEFAULT 'en',
    template_id VARCHAR(100) NULL, -- Meta approved template ID
    status ENUM('APPROVED', 'PENDING', 'REJECTED') DEFAULT 'APPROVED',
    header_type ENUM('NONE', 'TEXT', 'IMAGE', 'DOCUMENT') DEFAULT 'NONE',
    header_text VARCHAR(255) NULL,
    body_text TEXT NOT NULL,
    footer_text VARCHAR(255) NULL,
    variables JSON NULL, -- ['name', 'company', 'product']
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS whatsapp_automation_rules (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    trigger_event ENUM('new_meta_lead', 'lead_assigned', 'quotation_sent', 'followup_reminder', 'payment_reminder') NOT NULL,
    template_id BIGINT UNSIGNED NOT NULL,
    delay_minutes INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_war_template FOREIGN KEY (template_id) REFERENCES whatsapp_templates (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS whatsapp_conversations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    lead_id BIGINT UNSIGNED NULL,
    customer_id BIGINT UNSIGNED NULL,
    assigned_to BIGINT UNSIGNED NULL,
    last_message TEXT NULL,
    last_message_at TIMESTAMP NULL,
    unread_count INT DEFAULT 0,
    is_archived TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_wc_lead FOREIGN KEY (lead_id) REFERENCES leads (id) ON DELETE SET NULL,
    CONSTRAINT fk_wc_customer FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE SET NULL,
    CONSTRAINT fk_wc_user FOREIGN KEY (assigned_to) REFERENCES users (id) ON DELETE SET NULL,
    INDEX idx_wc_phone (phone),
    INDEX idx_wc_last_msg (last_message_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT UNSIGNED NOT NULL,
    wamid VARCHAR(150) NULL UNIQUE, -- WhatsApp message ID from Meta
    sender_type ENUM('customer', 'system', 'agent') NOT NULL,
    sender_id BIGINT UNSIGNED NULL,
    message_type ENUM('text', 'image', 'document', 'template', 'audio', 'video') DEFAULT 'text',
    content TEXT NOT NULL,
    media_url VARCHAR(255) NULL,
    status ENUM('sent', 'delivered', 'read', 'failed') DEFAULT 'sent',
    error_message TEXT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP NULL,
    read_at TIMESTAMP NULL,
    CONSTRAINT fk_wm_convo FOREIGN KEY (conversation_id) REFERENCES whatsapp_conversations (id) ON DELETE CASCADE,
    INDEX idx_wm_wamid (wamid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 8. PRODUCTS & SERVICES
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    item_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    type ENUM('product', 'service') DEFAULT 'service',
    description TEXT NULL,
    unit VARCHAR(20) DEFAULT 'unit',
    unit_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    tax_rate DECIMAL(5,2) DEFAULT 18.00, -- GST %
    hsn_sac VARCHAR(50) NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 9. QUOTATIONS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quotations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    quotation_number VARCHAR(50) NOT NULL UNIQUE,
    lead_id BIGINT UNSIGNED NULL,
    customer_id BIGINT UNSIGNED NOT NULL,
    quotation_date DATE NOT NULL,
    valid_until DATE NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(12,2) DEFAULT 0.00,
    tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    grand_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    status ENUM('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired') DEFAULT 'draft',
    notes TEXT NULL,
    terms_and_conditions TEXT NULL,
    pdf_url VARCHAR(255) NULL,
    created_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_quote_customer FOREIGN KEY (customer_id) REFERENCES customers (id),
    CONSTRAINT fk_quote_lead FOREIGN KEY (lead_id) REFERENCES leads (id) ON DELETE SET NULL,
    CONSTRAINT fk_quote_user FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL,
    INDEX idx_quotes_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS quotation_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    quotation_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NULL,
    description VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1.00,
    unit_price DECIMAL(12,2) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0.00,
    tax_rate DECIMAL(5,2) DEFAULT 18.00,
    total DECIMAL(12,2) NOT NULL,
    CONSTRAINT fk_qi_quote FOREIGN KEY (quotation_id) REFERENCES quotations (id) ON DELETE CASCADE,
    CONSTRAINT fk_qi_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 10. INVOICES & PAYMENTS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoices (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    quotation_id BIGINT UNSIGNED NULL,
    customer_id BIGINT UNSIGNED NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(12,2) DEFAULT 0.00,
    tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    grand_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    paid_amount DECIMAL(12,2) DEFAULT 0.00,
    balance_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    payment_status ENUM('draft', 'sent', 'partially_paid', 'paid', 'overdue', 'cancelled') DEFAULT 'draft',
    notes TEXT NULL,
    pdf_url VARCHAR(255) NULL,
    created_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_inv_customer FOREIGN KEY (customer_id) REFERENCES customers (id),
    CONSTRAINT fk_inv_quote FOREIGN KEY (quotation_id) REFERENCES quotations (id) ON DELETE SET NULL,
    CONSTRAINT fk_inv_user FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL,
    INDEX idx_invoices_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS invoice_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    invoice_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NULL,
    description VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1.00,
    unit_price DECIMAL(12,2) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0.00,
    tax_rate DECIMAL(5,2) DEFAULT 18.00,
    total DECIMAL(12,2) NOT NULL,
    CONSTRAINT fk_ii_invoice FOREIGN KEY (invoice_id) REFERENCES invoices (id) ON DELETE CASCADE,
    CONSTRAINT fk_ii_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    payment_number VARCHAR(50) NOT NULL UNIQUE,
    invoice_id BIGINT UNSIGNED NOT NULL,
    customer_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method ENUM('cash', 'upi', 'bank_transfer', 'card', 'other') NOT NULL,
    reference_number VARCHAR(100) NULL,
    notes TEXT NULL,
    recorded_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_pay_invoice FOREIGN KEY (invoice_id) REFERENCES invoices (id) ON DELETE CASCADE,
    CONSTRAINT fk_pay_customer FOREIGN KEY (customer_id) REFERENCES customers (id),
    CONSTRAINT fk_pay_user FOREIGN KEY (recorded_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 11. QR CODE GENERATION & TRACKING
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS qr_codes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    qr_code_id VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(150) NOT NULL,
    qr_type ENUM('website', 'whatsapp', 'phone', 'email', 'text', 'upi', 'lead_form', 'custom_url') NOT NULL,
    payload_data TEXT NOT NULL,
    target_url TEXT NULL,
    scan_count INT DEFAULT 0,
    download_count INT DEFAULT 0,
    foreground_color VARCHAR(20) DEFAULT '#0B1F3A',
    background_color VARCHAR(20) DEFAULT '#FFFFFF',
    logo_enabled TINYINT(1) DEFAULT 1,
    created_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_qr_user FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 12. NOTIFICATIONS & AUDIT LOGS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    type VARCHAR(100) NOT NULL, -- lead_created, lead_assigned, whatsapp_message, followup_due, etc.
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    action_url VARCHAR(255) NULL,
    is_read TINYINT(1) DEFAULT 0,
    metadata JSON NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_notif_user_read (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    event_type VARCHAR(100) NOT NULL, -- lead_created, quotation_sent, payment_recorded, etc.
    entity_type VARCHAR(100) NOT NULL, -- Lead, Quotation, Invoice, WhatsAppMessage
    entity_id BIGINT UNSIGNED NOT NULL,
    old_values JSON NULL,
    new_values JSON NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
    INDEX idx_audit_entity (entity_type, entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 13. SETTINGS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS settings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(100) NOT NULL UNIQUE,
    `value` TEXT NULL,
    `group` VARCHAR(50) DEFAULT 'general',
    is_secret TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 14. SMART DIGITAL PROFILE MODULE
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_profiles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    status ENUM('draft', 'published', 'unpublished') DEFAULT 'published',
    business_name VARCHAR(200) NOT NULL,
    person_name VARCHAR(150) NOT NULL,
    designation VARCHAR(150) NULL,
    business_category VARCHAR(150) NULL,
    short_description TEXT NULL,
    about TEXT NULL,
    profile_photo_url VARCHAR(255) NULL,
    business_logo_url VARCHAR(255) NULL,
    cover_banner_url VARCHAR(255) NULL,
    phone VARCHAR(30) NOT NULL,
    whatsapp VARCHAR(30) NOT NULL,
    email VARCHAR(150) NOT NULL,
    website VARCHAR(255) NULL,
    address TEXT NULL,
    city VARCHAR(100) NULL,
    state VARCHAR(100) NULL,
    country VARCHAR(100) DEFAULT 'India',
    pincode VARCHAR(20) NULL,
    google_maps_url TEXT NULL,
    google_review_url TEXT NULL,
    upi_id VARCHAR(100) NULL,
    upi_name VARCHAR(150) NULL,
    wifi_enabled TINYINT(1) DEFAULT 0,
    wifi_ssid VARCHAR(100) NULL,
    wifi_password VARCHAR(100) NULL,
    wifi_security VARCHAR(20) DEFAULT 'WPA2',
    play_store_url VARCHAR(255) NULL,
    app_store_url VARCHAR(255) NULL,
    theme ENUM('professional', 'minimal', 'corporate', 'modern', 'creative') DEFAULT 'professional',
    primary_color VARCHAR(20) DEFAULT '#1565E8',
    secondary_color VARCHAR(20) DEFAULT '#0B1F3A',
    smart_qr_id VARCHAR(50) NULL,
    views_count INT UNSIGNED DEFAULT 0,
    unique_visitors INT UNSIGNED DEFAULT 0,
    qr_scans_count INT UNSIGNED DEFAULT 0,
    enquiries_count INT UNSIGNED DEFAULT 0,
    seo_title VARCHAR(200) NULL,
    seo_description TEXT NULL,
    seo_og_image VARCHAR(255) NULL,
    seo_indexing TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_dp_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_dp_slug (slug),
    INDEX idx_dp_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS digital_profile_hours (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    profile_id BIGINT UNSIGNED NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    is_closed TINYINT(1) DEFAULT 0,
    open_time VARCHAR(10) DEFAULT '09:30',
    close_time VARCHAR(10) DEFAULT '19:00',
    CONSTRAINT fk_dph_profile FOREIGN KEY (profile_id) REFERENCES digital_profiles (id) ON DELETE CASCADE,
    INDEX idx_dph_day (profile_id, day_of_week)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS digital_profile_social_links (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    profile_id BIGINT UNSIGNED NOT NULL,
    platform VARCHAR(50) NOT NULL, -- instagram, facebook, youtube, linkedin, twitter, whatsapp, website, custom
    url VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NULL,
    display_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dpsl_profile FOREIGN KEY (profile_id) REFERENCES digital_profiles (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS digital_profile_services (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    profile_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    starting_price DECIMAL(12,2) NULL,
    icon_name VARCHAR(50) NULL,
    image_url VARCHAR(255) NULL,
    cta_text VARCHAR(50) DEFAULT 'Enquire Now',
    display_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dps_profile FOREIGN KEY (profile_id) REFERENCES digital_profiles (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS digital_profile_products (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    profile_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    display_order INT DEFAULT 0,
    is_featured TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dpp_profile FOREIGN KEY (profile_id) REFERENCES digital_profiles (id) ON DELETE CASCADE,
    CONSTRAINT fk_dpp_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    UNIQUE KEY uk_profile_product (profile_id, product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS digital_profile_catalogues (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    profile_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    file_url VARCHAR(255) NOT NULL,
    cover_image VARCHAR(255) NULL,
    file_size VARCHAR(50) NULL,
    display_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dpc_profile FOREIGN KEY (profile_id) REFERENCES digital_profiles (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS digital_profile_offers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    profile_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    image_url VARCHAR(255) NULL,
    original_price DECIMAL(12,2) NOT NULL,
    offer_price DECIMAL(12,2) NOT NULL,
    valid_until DATETIME NOT NULL,
    cta_text VARCHAR(50) DEFAULT 'Claim Offer',
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dpo_profile FOREIGN KEY (profile_id) REFERENCES digital_profiles (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS digital_profile_analytics (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    profile_id BIGINT UNSIGNED NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- view, qr_scan, whatsapp_click, call_click, vcard_click, etc.
    target_id VARCHAR(100) NULL,
    device VARCHAR(50) NULL,
    browser VARCHAR(50) NULL,
    os VARCHAR(50) NULL,
    ip_address VARCHAR(45) NULL,
    referrer TEXT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dpa_profile FOREIGN KEY (profile_id) REFERENCES digital_profiles (id) ON DELETE CASCADE,
    INDEX idx_dpa_event (profile_id, event_type, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

