export const AUTH_ROLES = ['admin', 'customer'] as const;

export type AuthRole = (typeof AUTH_ROLES)[number];

export const STAFF_ROLES = ['super_admin', 'admin', 'manager', 'staff', 'viewer'] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export const PERMISSION_GROUPS = [
  'Users & Access',
  'Shops & Locations',
  'Inventory & Catalog',
  'Orders & Sales',
  'Reports & Analytics',
  'System & Settings',
] as const;
export type PermissionGroup = (typeof PERMISSION_GROUPS)[number];

export type Permission =
  | 'users:view'
  | 'users:invite'
  | 'users:manage_roles'
  | 'users:delete'
  | 'shops:view'
  | 'shops:create'
  | 'shops:edit'
  | 'shops:delete'
  | 'inventory:view'
  | 'inventory:manage'
  | 'orders:view'
  | 'orders:create'
  | 'orders:manage'
  | 'reports:view'
  | 'reports:export'
  | 'settings:manage';

export interface PermissionDefinition {
  id: Permission;
  label: string;
  group: PermissionGroup;
  description: string;
}

export const PERMISSIONS: PermissionDefinition[] = [
  {
    id: 'users:view',
    label: 'View Staff & Users',
    group: 'Users & Access',
    description: 'View staff directory and profiles',
  },
  {
    id: 'users:invite',
    label: 'Invite Staff',
    group: 'Users & Access',
    description: 'Send email invitations to new team members',
  },
  {
    id: 'users:manage_roles',
    label: 'Manage Roles',
    group: 'Users & Access',
    description: 'Change roles and assign permissions',
  },
  {
    id: 'users:delete',
    label: 'Deactivate / Delete',
    group: 'Users & Access',
    description: 'Deactivate or remove staff accounts',
  },

  {
    id: 'shops:view',
    label: 'View Shops',
    group: 'Shops & Locations',
    description: 'Browse registered shops and locations',
  },
  {
    id: 'shops:create',
    label: 'Create Shops',
    group: 'Shops & Locations',
    description: 'Add new business branches or shops',
  },
  {
    id: 'shops:edit',
    label: 'Edit Shops',
    group: 'Shops & Locations',
    description: 'Modify shop details, hours, and branding',
  },
  {
    id: 'shops:delete',
    label: 'Archive Shops',
    group: 'Shops & Locations',
    description: 'Archive or remove shop locations',
  },

  {
    id: 'inventory:view',
    label: 'View Inventory',
    group: 'Inventory & Catalog',
    description: 'Check product catalogue and stock counts',
  },
  {
    id: 'inventory:manage',
    label: 'Manage Inventory',
    group: 'Inventory & Catalog',
    description: 'Add products, update pricing, adjust stock',
  },

  {
    id: 'orders:view',
    label: 'View Orders',
    group: 'Orders & Sales',
    description: 'Browse customer orders and transactions',
  },
  {
    id: 'orders:create',
    label: 'Process Checkout',
    group: 'Orders & Sales',
    description: 'Create orders and process POS sales',
  },
  {
    id: 'orders:manage',
    label: 'Manage Orders',
    group: 'Orders & Sales',
    description: 'Fulfill, cancel, or process refunds',
  },

  {
    id: 'reports:view',
    label: 'View Analytics',
    group: 'Reports & Analytics',
    description: 'Access revenue and operational dashboards',
  },
  {
    id: 'reports:export',
    label: 'Export Data',
    group: 'Reports & Analytics',
    description: 'Download CSV and Excel audit reports',
  },

  {
    id: 'settings:manage',
    label: 'System Settings',
    group: 'System & Settings',
    description: 'Configure integrations, mail, and business rules',
  },
];

export interface StaffRoleDefinition {
  id: StaffRole;
  name: string;
  title: string;
  description: string;
  color: string;
  permissions: Permission[];
}

export const STAFF_ROLE_DEFINITIONS: Record<StaffRole, StaffRoleDefinition> = {
  super_admin: {
    id: 'super_admin',
    name: 'Super Admin',
    title: 'Super Administrator',
    description: 'Full unconstrained system authority, user access, and role assignment.',
    color: 'purple',
    permissions: PERMISSIONS.map((p) => p.id),
  },
  admin: {
    id: 'admin',
    name: 'Administrator',
    title: 'Operations Admin',
    description: 'Manages shop branches, inventory catalog, customer orders, and staff invitations.',
    color: 'brand',
    permissions: [
      'users:view',
      'users:invite',
      'shops:view',
      'shops:create',
      'shops:edit',
      'inventory:view',
      'inventory:manage',
      'orders:view',
      'orders:create',
      'orders:manage',
      'reports:view',
      'reports:export',
      'settings:manage',
    ],
  },
  manager: {
    id: 'manager',
    name: 'Shop Manager',
    title: 'Store Operations Manager',
    description: 'Oversees day-to-day store operations, inventory replenishment, and customer service.',
    color: 'blue',
    permissions: [
      'shops:view',
      'inventory:view',
      'inventory:manage',
      'orders:view',
      'orders:create',
      'orders:manage',
      'reports:view',
    ],
  },
  staff: {
    id: 'staff',
    name: 'Staff / Cashier',
    title: 'Store Associate',
    description: 'Executes store register sales, inventory item lookup, and direct customer service.',
    color: 'emerald',
    permissions: ['inventory:view', 'orders:view', 'orders:create'],
  },
  viewer: {
    id: 'viewer',
    name: 'Auditor / Viewer',
    title: 'Compliance Auditor',
    description: 'Read-only access for financial auditing, data monitoring, and report inspection.',
    color: 'zinc',
    permissions: ['shops:view', 'inventory:view', 'orders:view', 'reports:view', 'reports:export'],
  },
};

export const PASSWORD_LIMITS = {
  min: 8,
  /** Stops very long passwords being used to tie up the server while hashing. */
  max: 128,
} as const;

export const EMAIL_MAX_LENGTH = 254;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: AuthRole;
  staffRole?: StaffRole;
  isActive?: boolean;
}

export interface UserProfile extends AuthUser {
  createdAt: string;
  lastLoginAt?: string;
}

export interface UpdateProfileInput {
  name: string;
  /** Leave out or send empty to remove it. */
  phone?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface ChangeEmailInput {
  email: string;
  currentPassword: string;
}

export interface AuthSession {
  accessToken: string;
  /** Seconds until the access token expires. */
  expiresIn: number;
  user: AuthUser;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  name: string;
  phone?: string;
}

export const ADMIN_INVITE_STATUSES = ['pending', 'accepted', 'expired'] as const;

export type AdminInviteStatus = (typeof ADMIN_INVITE_STATUSES)[number];

export interface AdminInvite {
  id: string;
  email: string;
  invitedBy: string;
  invitedByName?: string;
  staffRole?: StaffRole;
  status: AdminInviteStatus;
  expiresAt: string;
  acceptedAt?: string;
  createdAt: string;
}

export const STAFF_STATUSES = ['active', 'deactivated'] as const;

export type StaffStatus = (typeof STAFF_STATUSES)[number];

export interface StaffListQuery {
  page?: number;
  limit?: number;
  /** Matches the name, the email or the role's name. */
  search?: string;
  staffRole?: StaffRole;
  status?: StaffStatus;
}

export interface AdminInviteListQuery {
  page?: number;
  limit?: number;
  /** Matches the invited email. */
  search?: string;
  status?: AdminInviteStatus;
}

export interface CreateAdminInviteInput {
  email: string;
  staffRole?: StaffRole;
}

export interface UpdateStaffRoleInput {
  staffRole: StaffRole;
}

export interface UpdateStaffStatusInput {
  isActive: boolean;
}

export interface AcceptAdminInviteInput {
  token: string;
  name: string;
  password: string;
  phone?: string;
}

export interface ValidateAdminInviteResponse {
  email: string;
  valid: boolean;
  staffRole?: StaffRole;
}
