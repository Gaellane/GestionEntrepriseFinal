import { useAuth } from "../hooks/useAuth";
import { createContext } from "react";

export const AuthContext = createContext();

export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  EDITOR: 'EDITOR',
  GUEST: 'GUEST'
};

export const PERMISSIONS = {
  VIEW_DASHBOARD: 'view_dashboard',
  EDIT_CONTENT: 'edit_content',
  MANAGE_USERS: 'manage_users',
  // ... autres permissions
};

// Configuration des rôles avec permissions
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.EDIT_CONTENT,
    PERMISSIONS.MANAGE_USERS
  ],
  [ROLES.EDITOR]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.EDIT_CONTENT
  ],
  [ROLES.USER]: [
    PERMISSIONS.VIEW_DASHBOARD
  ]
};

export const usePermissions = () => {
  const { user } = useAuth();
  
  const hasPermission = (permission) => {
    if (!user) return false;
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    return rolePermissions.includes(permission);
  };
  
  const hasAnyPermission = (permissions) => {
    return permissions.some(hasPermission);
  };
  
  return { hasPermission, hasAnyPermission };
};