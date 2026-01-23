import { useAuth } from "../hooks/useAuth";
import { createContext } from "react";

export const AuthContext = createContext();

export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  EDITOR: 'EDITOR',
  GUEST: 'GUEST',
  RESP_MAGASIN: 'RESP_MAGASIN',   // nouveau rôle utilisé dans sideBarConfig
  MAGRECEPT: 'MAGRECEPT',
  MAGSORT: 'MAGSORT',
  MAGASINIER: 'MAGASINIER'       // nom alternatif si vous préférez
};

export const PERMISSIONS = {
  VIEW_DASHBOARD: 'view_dashboard',
  EDIT_CONTENT: 'edit_content',
  MANAGE_USERS: 'manage_users',
  ENTER_STOCK: 'enter_stock',
  EXIT_STOCK: 'exit_stock', 
  VIEW_INVENTORY: 'view_inventory',
};

// Configuration des rôles avec permissions
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.EDIT_CONTENT,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.ENTER_STOCK,
    PERMISSIONS.EXIT_STOCK
  ],
  [ROLES.EDITOR]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.EDIT_CONTENT
  ],
  [ROLES.USER]: [
    PERMISSIONS.VIEW_DASHBOARD
  ],
  [ROLES.RESP_MAGASIN]: [
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.ENTER_STOCK,
    PERMISSIONS.EXIT_STOCK
  ],
  [ROLES.MAGRECEPT]: [
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.ENTER_STOCK
  ],
  [ROLES.MAGSORT]: [
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.EXIT_STOCK
  ]
  ,
  [ROLES.MAGASINIER]: [
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.ENTER_STOCK
  ]
};

export const usePermissions = () => {
  const { user } = useAuth();
  
  const hasPermission = (permission) => {
    if (!user) return false;
    const roleKey = user.role ? user.role.toString().toUpperCase() : null;
    const rolePermissions = ROLE_PERMISSIONS[roleKey] || [];
    return rolePermissions.includes(permission);
  };
  
  const hasAnyPermission = (permissions) => {
    return permissions.some(hasPermission);
  };
  
  return { hasPermission, hasAnyPermission };
};

// helper used by other modules that may pass a role string
export const hasRolePermission = (role, permission) => {
  const roleKey = role ? role.toString().toUpperCase() : null;
  const permissions = ROLE_PERMISSIONS[roleKey] || [];
  return permissions.includes(permission);
};