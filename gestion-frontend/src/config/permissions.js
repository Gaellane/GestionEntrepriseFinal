import { useAuth } from "../hooks/useAuth";

export const ROLES = {
  ADMIN: 'ADMIN',
  ADMINSYS: 'ADMINSYS',
  USER: 'USER',
  EDITOR: 'EDITOR',
  GUEST: 'GUEST',
  RESP_VENTE: 'RESP_VENTE',
  EMP_VENTE: 'EMP_VENTE',
  RESP_MAGASIN: 'RESP_MAGASIN',   // nouveau rôle utilisé dans sideBarConfig
  MAGRECEPT: 'MAGRECEPT',
  MAGSORT: 'MAGSORT',
  MAGASINIER: 'MAGASINIER',     // nom alternatif si vous préférez
  MAGINV: 'MAGINV'               // rôle pour inventaire
};

export const PERMISSIONS = {
  VIEW_DASHBOARD: 'view_dashboard',
  EDIT_CONTENT: 'edit_content',
  MANAGE_USERS: 'manage_users',
  ENTER_STOCK: 'enter_stock',
  EXIT_STOCK: 'exit_stock',
  VIEW_INVENTORY: 'view_inventory',
  INITIATE_INVENTORY: 'initiate_inventory',
  PERFORM_INVENTORY: 'perform_inventory',
  VIEW_INVENTORY_REPORTS: 'view_inventory_reports'
  ,
  VIEW_TARIFICATION_HISTORY: 'view_tarification_history',
  TRANSFER_STOCK: 'transfer_stock'
  ,
  // Sales permissions
  VIEW_SALES: 'view_sales',
  CREATE_SALES: 'create_sales',
  MANAGE_CUSTOMERS: 'manage_customers',
  // Delivery permissions
  VIEW_DELIVERIES: 'view_deliveries',
  VIEW_DELIVERY_LIST: 'view_delivery_list',
  REGISTER_DELIVERY: 'register_delivery',
  // Stock permissions
  STOCK: 'stock',
  // Caisse permissions
  VIEW_CAISSE: 'view_caisse',
  CREATE_CAISSE_MOVEMENT: 'create_caisse_movement',
  ENCAISSEMENT_VENTE: 'encaissement_vente',
  // Achat permissions
  VIEW_ACHATS: 'view_achats',
  CREATE_ACHAT: 'create_achat',
  VIEW_ACHAT_DETAILS: 'view_achat_details',
  CREATE_PROFORMA_ACHAT: 'create_proforma_achat',
  CREATE_BON_COMMANDE: 'create_bon_commande',
  MANAGE_LIVRAISON_ACHAT: 'manage_livraison_achat',
  MANAGE_RECEPTION_ACHAT: 'manage_reception_achat',
  VIEW_ACHAT_KPI: 'view_achat_kpi'
};

// Configuration des rôles avec permissions
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    // Dashboard & System
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.EDIT_CONTENT,
    PERMISSIONS.MANAGE_USERS,
    // Stock & Inventory - all permissions
    PERMISSIONS.ENTER_STOCK,
    PERMISSIONS.EXIT_STOCK,
    PERMISSIONS.TRANSFER_STOCK,
    PERMISSIONS.STOCK,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.INITIATE_INVENTORY,
    PERMISSIONS.PERFORM_INVENTORY,
    PERMISSIONS.VIEW_INVENTORY_REPORTS,
    // Sales - all permissions
    PERMISSIONS.VIEW_SALES,
    PERMISSIONS.CREATE_SALES,
    PERMISSIONS.MANAGE_CUSTOMERS,
    PERMISSIONS.VIEW_TARIFICATION_HISTORY,
    // Delivery - all permissions
    PERMISSIONS.VIEW_DELIVERIES,
    PERMISSIONS.VIEW_DELIVERY_LIST,
    PERMISSIONS.REGISTER_DELIVERY,
    // Caisse - all permissions
    PERMISSIONS.VIEW_CAISSE,
    PERMISSIONS.CREATE_CAISSE_MOVEMENT,
    PERMISSIONS.ENCAISSEMENT_VENTE,
    // Achats - all permissions
    PERMISSIONS.VIEW_ACHATS,
    PERMISSIONS.CREATE_ACHAT,
    PERMISSIONS.VIEW_ACHAT_DETAILS,
    PERMISSIONS.CREATE_PROFORMA_ACHAT,
    PERMISSIONS.CREATE_BON_COMMANDE,
    PERMISSIONS.MANAGE_LIVRAISON_ACHAT,
    PERMISSIONS.MANAGE_RECEPTION_ACHAT,
    PERMISSIONS.VIEW_ACHAT_KPI
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
    PERMISSIONS.EXIT_STOCK,
    PERMISSIONS.TRANSFER_STOCK,
    PERMISSIONS.STOCK,
    PERMISSIONS.VIEW_INVENTORY_REPORTS,
    PERMISSIONS.INITIATE_INVENTORY
  ],
  [ROLES.RESP_VENTE]: [
    PERMISSIONS.VIEW_SALES,
    PERMISSIONS.CREATE_SALES,
    PERMISSIONS.MANAGE_CUSTOMERS,
    PERMISSIONS.VIEW_TARIFICATION_HISTORY
    ,
    PERMISSIONS.VIEW_DELIVERIES,
    PERMISSIONS.VIEW_DELIVERY_LIST,
    PERMISSIONS.REGISTER_DELIVERY,
    PERMISSIONS.VIEW_CAISSE,
    PERMISSIONS.CREATE_CAISSE_MOVEMENT,
    PERMISSIONS.ENCAISSEMENT_VENTE
  ],
  [ROLES.EMP_VENTE]: [
    PERMISSIONS.VIEW_SALES,
    PERMISSIONS.VIEW_DELIVERIES,
    PERMISSIONS.VIEW_DELIVERY_LIST
  ],
  [ROLES.MAGRECEPT]: [
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.ENTER_STOCK,
    PERMISSIONS.TRANSFER_STOCK,
    PERMISSIONS.STOCK
  ],
  [ROLES.MAGSORT]: [
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.EXIT_STOCK,
    PERMISSIONS.TRANSFER_STOCK,
    PERMISSIONS.STOCK
  ],
  [ROLES.MAGASINIER]: [
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.ENTER_STOCK,
    PERMISSIONS.TRANSFER_STOCK,
    PERMISSIONS.STOCK,
    PERMISSIONS.INITIATE_INVENTORY
  ],
  [ROLES.MAGINV]: [
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.INITIATE_INVENTORY,
    PERMISSIONS.PERFORM_INVENTORY,
    PERMISSIONS.VIEW_INVENTORY_REPORTS
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