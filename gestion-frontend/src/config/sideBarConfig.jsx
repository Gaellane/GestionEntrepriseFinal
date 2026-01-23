// config/sidebarConfig.js
import { ROLES,PERMISSIONS,ROLE_PERMISSIONS } from './permissions';
import { useAuth } from '../hooks/useAuth';
import {
  ShoppingCartIcon,
  ChartBarIcon,
  TruckIcon,
  CubeIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  DocumentPlusIcon,
  DocumentCheckIcon,
  ListBulletIcon,
  PlusCircleIcon,
  ChartPieIcon,
  UserGroupIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';

export const SIDEBAR_CONFIG = {
  categories: [
    {
      id: 'Accueil',
      label: 'Accueil',
      icon: <HomeIcon className="w-5 h-5" />,
      alwaysVisible: true,
      subItems:[
        {
          id: 'Page',
          label: 'Page',
          path: '/home',
          icon: <DocumentTextIcon className="w-4 h-4" />,
          alwaysVisible: true,
        }
      ]
    },
    {
      id: 'achats',
      label: 'Achats',
      icon: <ShoppingCartIcon className="w-5 h-5" />,
      roles: [ROLES.ADMIN],
      subItems: [
        {
          id: 'proforma-achats',
          label: 'Proforma',
          path: '/achats/proforma',
          icon: <DocumentTextIcon className="w-4 h-4" />,
          roles: [ROLES.ADMIN],
        },
        {
          id: 'demandes-achats',
          label: 'Demandes',
          path: '/achats/demandes',
          icon: <ClipboardDocumentListIcon className="w-4 h-4" />,
          roles: [ROLES.ADMIN],

        },
        {
          id: 'fournisseurs',
          label: 'Fournisseurs',
          path: '/achats/fournisseurs',
          icon: <UserGroupIcon className="w-4 h-4" />,
          roles: [ROLES.ADMIN],
        }
      ]
    },
    {
      id: 'vente',
      label: 'Vente',
      icon: <ChartBarIcon className="w-5 h-5" />,
      permission: 'view_sales',
      subItems: [
        {
          id: 'proforma-vente',
          label: 'Proforma',
          path: '/vente/proforma',
          icon: <DocumentTextIcon className="w-4 h-4" />,
          permission: 'view_sales_proforma'
        },
        {
          id: 'insertion-vente',
          label: 'Insertion',
          path: '/vente/insertion',
          icon: <DocumentPlusIcon className="w-4 h-4" />,
          permission: 'create_sales'
        },
        {
          id: 'clients',
          label: 'Clients',
          path: '/vente/clients',
          icon: <UserGroupIcon className="w-4 h-4" />,
          permission: 'manage_customers'
        }
      ]
    },
    {
      id: 'livraison',
      label: 'Livraison',
      icon: <TruckIcon className="w-5 h-5" />,
      permission: 'view_deliveries',
      subItems: [
        {
          id: 'liste-livraisons',
          label: 'Liste',
          path: '/livraison/liste',
          icon: <ListBulletIcon className="w-4 h-4" />,
          permission: 'view_delivery_list'
        },
        {
          id: 'enregistrement-livraison',
          label: 'Enregistrement',
          path: '/livraison/enregistrement',
          icon: <DocumentCheckIcon className="w-4 h-4" />,
          permission: 'register_delivery'
        }
      ]
    },
    {
      id: 'inventaire',
      label: 'Inventaire',
      icon: <CubeIcon className="w-5 h-5" />,
      permission: 'view_inventory',
      subItems: [
        {
          id: 'initier-inventaire',
          label: 'Initier',
          path: '/inventaire/initier',
          icon: <PlusCircleIcon className="w-4 h-4" />,
          permission: 'initiate_inventory'
        },
        {
          id: 'rapports-inventaire',
          label: 'Rapports',
          path: '/inventaire/rapports',
          icon: <ChartPieIcon className="w-4 h-4" />,
          permission: 'view_inventory_reports'
        }
      ]
    }, 

    {
      id: 'stock',
      label: 'Stock',
      icon: <CubeIcon className="w-5 h-5" />,
      permission: 'stock',
      roles : [ROLES.RESP_MAGASIN,ROLES.ADMIN,ROLES.MAGRECEPT,ROLES.MAGSORT],
      subItems: [
        {
          id: 'entree',
          label: 'Entrer de stock',
          path: '/stock/1',
          roles : [ROLES.RESP_MAGASIN,ROLES.ADMIN,ROLES.MAGRECEPT],
          icon: <PlusCircleIcon className="w-4 h-4" />,
          permission: 'enter_stock'
        },
        {
          id: 'sortie',
          label: 'Sortie de stock',
          path: '/stock/2',
          roles : [ROLES.RESP_MAGASIN,ROLES.ADMIN,ROLES.MAGSORT],
          icon: <ChartPieIcon className="w-4 h-4" />,
          permission: 'exit_stock'
        }
      ]
    }, 
  ]
};


export const canAccessRoute = (routePath, user) => {
  if (!user || !user.role) return false;
  
  // Trouver la route dans la configuration
  const route = findRouteByPath(routePath);
  if (!route) return false;
  
  // Vérifier l'accès
  return hasPermissionToItem(route, user);
};

/**
 * Récupère toutes les routes accessibles pour un rôle
 */
export const getAccessibleRoutes = (userRole) => {
  const accessibleRoutes = [];
  
  SIDEBAR_CONFIG.categories.forEach(category => {
    // Vérifier si la catégorie est accessible
    const canAccessCategory = canAccessCategoryBasedOnRole(category, userRole) || 
                              canAccessCategoryBasedOnPermission(category, userRole);
    
    if (canAccessCategory && category.subItems) {
      category.subItems.forEach(subItem => {
        const canAccessSubItem = canAccessItemBasedOnRole(subItem, userRole) || 
                                 canAccessItemBasedOnPermission(subItem, userRole);
        
        if (canAccessSubItem) {
          accessibleRoutes.push({
            path: subItem.path,
            label: subItem.label,
            category: category.label,
            requiredRoles: subItem.roles || [],
            requiredPermissions: subItem.permission ? [subItem.permission] : []
          });
        }
      });
    }
  });
  
  return accessibleRoutes;
};

/**
 * Hook personnalisé pour vérifier les accès aux routes
 */
export const useRouteAccess = () => {
  const { user } = useAuth();
  
  const canAccess = (routePath) => {
    return canAccessRoute(routePath, user);
  };
  
  const getMyAccessibleRoutes = () => {
    return user ? getAccessibleRoutes(user.role) : [];
  };
  
  return {
    canAccess,
    getMyAccessibleRoutes,
    hasAccessToRoute: canAccess // Alias pour plus de clarté
  };
};

// ============ FONCTIONS HELPER INTERNES ============

const findRouteByPath = (path) => {
  for (const category of SIDEBAR_CONFIG.categories) {
    if (category.subItems) {
      const route = category.subItems.find(item => item.path === path);
      if (route) return route;
    }
  }
  return null;
};

const canAccessCategoryBasedOnRole = (category, userRole) => {
  return category.roles && category.roles.includes(userRole);
};

const canAccessCategoryBasedOnPermission = (category, userRole) => {
  if (!category.permission) return false;
  // Vous aurez besoin d'une fonction qui vérifie si un rôle a une permission
  return hasRolePermission(userRole, category.permission);
};

const canAccessItemBasedOnRole = (item, userRole) => {
  return item.roles && item.roles.includes(userRole);
};

const canAccessItemBasedOnPermission = (item, userRole) => {
  if (!item.permission) return false;
  return hasRolePermission(userRole, item.permission);
};

const hasPermissionToItem = (item, user) => {
  console.log("Checking access for item:", item, "and user:", user);
  if (!user || !user.role) return false;
  
  // Vérifier par rôle
  if (item.roles && item.roles.includes(user.role)) {
    return true;
  }
  
  // Vérifier par permission
  if (item.permission) {
    return hasRolePermission(user.role, item.permission);
  }
  
  // Si ni rôle ni permission spécifiés, accessible à tous les utilisateurs connectés
  return true;
};

// Cette fonction dépend de votre système de permissions
const hasRolePermission = (role, permission) => {
  const roleKey = role ? role.toString().toUpperCase() : null;
  const permissions = ROLE_PERMISSIONS[roleKey] || [];
  return permissions.includes(permission);
};