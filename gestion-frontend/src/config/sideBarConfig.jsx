// config/sidebarConfig.js
import { ROLES, PERMISSIONS, ROLE_PERMISSIONS } from './permissions';
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
  BuildingOfficeIcon,
  UserGroupIcon,
  HomeIcon,
  PlusIcon,
  DocumentDuplicateIcon,
  AdjustmentsHorizontalIcon,
  ShieldCheckIcon,
  ClipboardDocumentCheckIcon,
  CheckBadgeIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

export const SIDEBAR_CONFIG = {
  categories: [
    {
      id: 'Accueil',
      label: 'Accueil',
      icon: <HomeIcon className="w-5 h-5" />,
      alwaysVisible: true,
      subItems: [
        {
          id: 'Page',
          label: 'Page',
          path: '/home',
          icon: <DocumentTextIcon className="w-4 h-4" />,
          alwaysVisible: true,
        },
      ]
    },
    {
      id: 'articles',
      label: 'Articles',
      icon: <CubeIcon className="w-5 h-5" />,
      roles: [ROLES.ADMIN, ROLES.RESP_MAGASIN, ROLES.MAGRECEPT, ROLES.MAGSORT],
      permission: PERMISSIONS.VIEW_DASHBOARD,
      subItems: [
        {
          id: 'liste-articles',
          label: 'Liste',
          path: '/articles',
          icon: <DocumentTextIcon className="w-4 h-4" />,
          roles: [ROLES.ADMIN, ROLES.RESP_MAGASIN, ROLES.MAGRECEPT, ROLES.MAGSORT],
          permission: PERMISSIONS.EDIT_CONTENT,
        }
      ]
    },
    {
      id: 'achats',
      label: 'Achats',
      icon: <ShoppingCartIcon className="w-5 h-5" />,
      roles: [ROLES.ADMIN],
      permission: PERMISSIONS.VIEW_ACHATS,
      subItems: [
        {
          id: 'saisie-achat',
          label: 'Nouvelle demande',
          path: '/achats/saisie',
          icon: <PlusIcon className="w-4 h-4" />,
          roles: [ROLES.ADMIN],
          permission: PERMISSIONS.CREATE_ACHAT,
        },
        {
          id: 'demandes-achats',
          label: 'Liste demandes',
          path: '/achats/demandes',
          icon: <ClipboardDocumentListIcon className="w-4 h-4" />,
          roles: [ROLES.ADMIN],
          permission: PERMISSIONS.VIEW_ACHATS,
        },
        {
          id: 'kpi-achats',
          label: 'Dashboard KPI',
          path: '/achats/kpi',
          icon: <ChartBarIcon className="w-4 h-4" />,
          roles: [ROLES.ADMIN],
          permission: PERMISSIONS.VIEW_ACHAT_KPI,
        },
        {
          id: 'fournisseurs',
          label: 'Fournisseurs',
          path: '/achats/fournisseurs',
          icon: <UserGroupIcon className="w-4 h-4" />,
          roles: [ROLES.ADMIN],
          permission: PERMISSIONS.VIEW_ACHATS,
        },
        // Routes cachées mais autorisées (pour la navigation interne)
        {
          id: 'fiche-achat',
          label: 'Fiche Achat',
          path: '/achats/fiche/:id',
          icon: <DocumentTextIcon className="w-4 h-4" />,
          roles: [ROLES.ADMIN],
          permission: PERMISSIONS.VIEW_ACHAT_DETAILS,
          hidden: true,
        },
        {
          id: 'demande-proforma',
          label: 'Demande Proforma',
          path: '/achats/commande/saisie/:id',
          icon: <DocumentPlusIcon className="w-4 h-4" />,
          roles: [ROLES.ADMIN],
          permission: PERMISSIONS.CREATE_PROFORMA_ACHAT,
          hidden: true,
        },
        {
          id: 'proforma-saisie',
          label: 'Saisie Proforma',
          path: '/achats/proforma/saisie/:achatId/:fournisseurId',
          icon: <DocumentPlusIcon className="w-4 h-4" />,
          roles: [ROLES.ADMIN],
          permission: PERMISSIONS.CREATE_BON_COMMANDE,
          hidden: true,
        },
        {
          id: 'livraison-saisie',
          label: 'Saisie Livraison',
          path: '/achats/livraison/saisie/:achatId',
          icon: <TruckIcon className="w-4 h-4" />,
          roles: [ROLES.ADMIN],
          permission: PERMISSIONS.MANAGE_LIVRAISON_ACHAT,
          hidden: true,
        },
        {
          id: 'reception-saisie',
          label: 'Réception',
          path: '/achats/livraison/reception/:achatId',
          icon: <DocumentCheckIcon className="w-4 h-4" />,
          roles: [ROLES.ADMIN],
          permission: PERMISSIONS.MANAGE_RECEPTION_ACHAT,
          hidden: true,
        }
      ]
    },
    {
      id: 'vente',
      label: 'Vente',
      icon: <ChartBarIcon className="w-5 h-5" />,
      roles: [ROLES.ADMIN, ROLES.RESP_VENTE, ROLES.EMP_VENTE],
      permission: PERMISSIONS.VIEW_SALES,
      subItems: [
        {
          id: 'clients',
          label: 'Clients',
          path: '/clients',
          icon: <UserGroupIcon className="w-4 h-4" />,
          roles: [ROLES.ADMIN, ROLES.RESP_VENTE, ROLES.EMP_VENTE],
          permission: PERMISSIONS.MANAGE_CUSTOMERS,
        },
        {
          id: 'tarification',
          label: 'Tarification',
          path: '/tarification',
          icon: <CurrencyDollarIcon className="w-4 h-4" />,
          roles: [ROLES.ADMIN, ROLES.RESP_VENTE, ROLES.EMP_VENTE],
          permission: PERMISSIONS.VIEW_TARIFICATION_HISTORY
        },
        {
          id: 'proforma-ventes',
          label: 'Pro-formas',
          path: '/proforma-ventes',
          icon: <DocumentTextIcon className="w-4 h-4" />,
          roles: [ROLES.ADMIN, ROLES.RESP_VENTE, ROLES.EMP_VENTE],
          permission: PERMISSIONS.CREATE_SALES
        },
        {
          id: 'commandes-ventes',
          label: 'Commandes',
          path: '/ventes',
          icon: <DocumentCheckIcon className="w-4 h-4" />,
          roles: [ROLES.ADMIN, ROLES.RESP_VENTE, ROLES.EMP_VENTE],
          permission: PERMISSIONS.VIEW_SALES
        },
        {
          id: 'insertion-vente',
          label: 'Insertion',
          path: '/ventes/nouveau',
          icon: <DocumentPlusIcon className="w-4 h-4" />,
          roles: [ROLES.ADMIN, ROLES.RESP_VENTE, ROLES.EMP_VENTE],
          permission: PERMISSIONS.CREATE_SALES
        }
      ]
    },
    {
      id: 'livraison',
      label: 'Livraison',
      icon: <TruckIcon className="w-5 h-5" />,
      permission: PERMISSIONS.VIEW_DELIVERIES,

      subItems: [
        {
          id: 'liste-livraisons',
          label: 'Liste',
          path: '/livraison/liste',
          icon: <ListBulletIcon className="w-4 h-4" />,
          permission: PERMISSIONS.VIEW_DELIVERY_LIST
        },
        {
          id: 'enregistrement-livraison',
          label: 'Enregistrement',
          path: '/livraison/enregistrement',
          icon: <DocumentCheckIcon className="w-4 h-4" />,
          permission: PERMISSIONS.REGISTER_DELIVERY
        }
      ]
    },
    {
      id: 'caisse',
      label: 'Caisse',
      icon: <CurrencyDollarIcon className="w-5 h-5" />,
      roles: [ROLES.ADMIN, ROLES.RESP_VENTE],
      permission: PERMISSIONS.VIEW_CAISSE,
      subItems: [
        {
          id: 'mouvement-caisse',
          label: 'Nouveau mouvement',
          path: '/caisse/mouvements/creer',
          icon: <PlusCircleIcon className="w-4 h-4" />,
          roles: [ROLES.ADMIN, ROLES.RESP_VENTE],
          permission: PERMISSIONS.CREATE_CAISSE_MOVEMENT,
        }
        ,
        {
          id: 'encaisser-vente',
          label: 'Encaisser vente',
          path: '/caisse/mouvements/encaisser',
          icon: <DocumentCheckIcon className="w-4 h-4" />,
          roles: [ROLES.ADMIN, ROLES.RESP_VENTE],
          permission: PERMISSIONS.ENCAISSEMENT_VENTE,
        }
      ]
    },
    {
      id: 'reporting',
      label: 'Reporting',
      icon: <ChartPieIcon className="w-5 h-5" />,
      permission: PERMISSIONS.VIEW_SALES,
      subItems: [
        {
          id: 'dashboard-kpi',
          label: 'Dashboard KPI',
          path: '/reporting/dashboard',
          icon: <ChartBarIcon className="w-4 h-4" />,
          permission: PERMISSIONS.VIEW_SALES
        },
        {
          id: 'export-ventes',
          label: 'Export Ventes',
          path: '/reporting/export',
          icon: <DocumentTextIcon className="w-4 h-4" />,
          permission: PERMISSIONS.VIEW_SALES
        }
      ]
    },
    {
      id: 'prediction',
      label: 'Prédiction IA',
      icon: <SparklesIcon className="w-5 h-5" />,
      roles: [ROLES.ADMIN, ROLES.RESP_MAGASIN, ROLES.RESP_VENTE],
      permission: PERMISSIONS.VIEW_DASHBOARD,
      subItems: [
        {
          id: 'prediction-dashboard',
          label: 'Dashboard Prédictions',
          path: '/prediction/dashboard',
          icon: <ChartBarIcon className="w-4 h-4" />,
          roles: [ROLES.ADMIN, ROLES.RESP_MAGASIN, ROLES.RESP_VENTE],
          permission: PERMISSIONS.VIEW_DASHBOARD,
        },
      ]
    },
    {
      id: 'inventaire',
      label: 'Inventaire',
      icon: <CubeIcon className="w-5 h-5" />,
      permission: PERMISSIONS.VIEW_INVENTORY,
      roles: [ROLES.MAGASINIER, ROLES.RESP_MAGASIN, ROLES.ADMIN, ROLES.MAGINV],
      subItems: [
        {
          id: 'initier-inventaire',
          label: 'Initier',
          path: '/inventaire/form/new',
          icon: <PlusCircleIcon className="w-4 h-4" />,
          permission: PERMISSIONS.INITIATE_INVENTORY,
          roles: [ROLES.MAGASINIER, ROLES.ADMIN, ROLES.MAGINV]
        },
        {
          id: 'mes-demandes-inventaire',
          label: 'Mes demandes',
          path: '/inventaire/mes-demandes',
          icon: <ListBulletIcon className="w-4 h-4" />,
          roles: [ROLES.MAGINV],
          permission: PERMISSIONS.VIEW_INVENTORY
        },
        {
          id: 'saisie-inventaire',
          label: 'Saisie inventaire',
          path: '/inventaire/perform/:id',
          icon: <DocumentCheckIcon className="w-4 h-4" />,
          roles: [ROLES.MAGINV],
          permission: PERMISSIONS.PERFORM_INVENTORY
        },
        {
          id: 'rapports-inventaire',
          label: 'Rapports',
          path: '/stock/inventaires',
          icon: <ChartPieIcon className="w-4 h-4" />,
          permission: PERMISSIONS.VIEW_INVENTORY_REPORTS,
          roles: [ROLES.MAGASINIER, ROLES.RESP_MAGASIN, ROLES.ADMIN],
        }
      ]
    },
    {
      id: 'configuration',
      label: 'Configuration',
      icon: <Cog6ToothIcon className="w-5 h-5" />,
      roles: [ROLES.ADMIN],
      subItems: [
        {
          id: 'parametres',
          label: 'Paramètres Système',
          path: '/configurations',
          icon: <Cog6ToothIcon className="w-4 h-4" />,
          roles: [ROLES.ADMIN]
        }
      ]
    },

    {
      id: 'stock',
      label: 'Stock',
      icon: <CubeIcon className="w-5 h-5" />,
      permission: PERMISSIONS.STOCK,
      roles: [ROLES.RESP_MAGASIN, ROLES.ADMIN, ROLES.MAGRECEPT, ROLES.MAGSORT, ROLES.MAGASINIER],
      subItems: [
        {
          id: 'dashboard-stock',
          label: 'Dashboard KPIs',
          path: '/stock/dashboard',
          roles: [ROLES.RESP_MAGASIN, ROLES.ADMIN],
          icon: <ChartBarIcon className="w-4 h-4" />,
          permission: PERMISSIONS.VIEW_INVENTORY
        },
        {
          id: 'ajustements-stock',
          label: 'Ajustements',
          path: '/stock/ajustements',
          roles: [ROLES.RESP_MAGASIN, ROLES.ADMIN],
          icon: <ChartPieIcon className="w-4 h-4" />,
          permission: PERMISSIONS.VIEW_INVENTORY
        },
        {
          id: 'entree',
          label: 'Entrer de stock',
          path: '/stock/1',
          roles: [ROLES.RESP_MAGASIN, ROLES.ADMIN, ROLES.MAGRECEPT],
          icon: <PlusCircleIcon className="w-4 h-4" />,
          permission: PERMISSIONS.ENTER_STOCK
        },
        {
          id: 'transfert',
          label: 'Transfert',
          path: '/stock/transfer',
          roles: [ROLES.RESP_MAGASIN, ROLES.ADMIN, ROLES.MAGRECEPT, ROLES.MAGSORT, ROLES.MAGASINIER],
          icon: <BuildingOfficeIcon className="w-4 h-4" />,
          permission: PERMISSIONS.TRANSFER_STOCK
        },
        {
          id: 'articles-remaining',
          label: 'Articles restants',
          path: '/stock/articles-remaining',
          roles: [ROLES.MAGSORT, ROLES.MAGRECEPT, ROLES.MAGASINIER, ROLES.RESP_MAGASIN, ROLES.ADMIN],
          icon: <ListBulletIcon className="w-4 h-4" />,
          permission: PERMISSIONS.VIEW_INVENTORY
        },
        {
          id: 'sortie',
          label: 'Sortie de stock',
          path: '/stock/2',
          roles: [ROLES.RESP_MAGASIN, ROLES.ADMIN, ROLES.MAGSORT],
          icon: <ChartPieIcon className="w-4 h-4" />,
          permission: PERMISSIONS.EXIT_STOCK
        }
      ]
    },
    {
      id: 'administration',
      label: 'Administration',
      icon: <ShieldCheckIcon className="w-5 h-5" />,
      roles: [ROLES.ADMIN, ROLES.ADMINSYS],
      subItems: [
        {
          id: 'audit-logs',
          label: 'Logs d\'audit',
          path: '/admin/audit-logs',
          icon: <ClipboardDocumentCheckIcon className="w-4 h-4" />,
          roles: [ROLES.ADMIN, ROLES.ADMINSYS],
        },
        {
          id: 'roles-attribution',
          label: 'Gestion de roles',
          path: '/admin/roles-attribution',
          icon: <UserGroupIcon className="w-4 h-4" />,
          roles: [ROLES.ADMIN, ROLES.ADMINSYS],
        },
        {
          id: 'roles-validation',
          label: 'Validation roles',
          path: '/admin/roles-validation',
          icon: <CheckBadgeIcon className="w-4 h-4" />,
          roles: [ROLES.ADMIN, ROLES.ADMINSYS],
        }
      ]
    },
  ]
};


export const canAccessRoute = (routePath, user) => {
  console.log("🔍 canAccessRoute called:", { routePath, user });

  if (!user || !user.role) {
    console.log("❌ No user or role");
    return false;
  }

  // Trouver la route dans la configuration
  const route = findRouteByPath(routePath);
  console.log("🗺️ Found route for path", routePath, ":", route);

  if (!route) {
    console.log("❌ Route not found");
    return false;
  }

  // Vérifier l'accès
  const hasAccess = hasPermissionToItem(route, user);
  console.log("✅ Access result:", hasAccess);

  return hasAccess;
};

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

  // Fonction de test pour diagnostiquer les problèmes
  const testRouteAccess = (routePath) => {
    console.log("🧪 Testing route access for:", routePath);
    console.log("👤 Current user:", user);

    if (!user) {
      console.log("❌ No user found");
      return { canAccess: false, reason: "No user" };
    }

    const route = findRouteByPath(routePath);
    console.log("🗺️ Found route:", route);

    if (!route) {
      console.log("❌ Route not found");
      return { canAccess: false, reason: "Route not found" };
    }

    const hasAccess = hasPermissionToItem(route, user);
    return {
      canAccess: hasAccess,
      route: route,
      user: user,
      reason: hasAccess ? "Access granted" : "Access denied"
    };
  };

  return {
    canAccess,
    getMyAccessibleRoutes,
    hasAccessToRoute: canAccess, // Alias pour plus de clarté
    testRouteAccess // Fonction de debug
  };
};

// ============ FONCTIONS HELPER INTERNES ============

const findRouteByPath = (path) => {
  for (const category of SIDEBAR_CONFIG.categories) {
    if (category.subItems) {
      // exact match first
      const exact = category.subItems.find(item => item.path === path);
      if (exact) return exact;

      // support simple param routes like /inventaire/form/:id
      for (const item of category.subItems) {
        if (typeof item.path === 'string' && item.path.includes(':')) {
          const pattern = '^' + item.path.split('/').map(seg => seg.startsWith(':') ? '[^/]+' : seg.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')).join('/') + '$';
          try {
            const re = new RegExp(pattern);
            if (re.test(path)) return item;
          } catch (e) {
            // ignore invalid regex
          }
        }
      }
      // Support routes that extend a base subItem path, e.g. '/tarification/historique/123'
      for (const item of category.subItems) {
        if (typeof item.path === 'string' && path === item.path) return item;
        if (typeof item.path === 'string' && path.startsWith(item.path + '/')) {
          return item;
        }
      }
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
  console.log("🔐 hasPermissionToItem:", {
    itemId: item.id,
    itemRoles: item.roles,
    itemPermission: item.permission,
    alwaysVisible: item.alwaysVisible,
    userRole: user.role
  });

  if (!user || !user.role) {
    console.log("❌ No user or role in hasPermissionToItem");
    return false;
  }

  // Si l'item a la propriété alwaysVisible, on l'autorise
  if (item.alwaysVisible) {
    console.log("✅ Always visible item");
    return true;
  }

  // Vérifier par rôle
  if (item.roles && item.roles.length > 0) {
    const hasRole = item.roles.includes(user.role);
    console.log("🎭 Role check:", { hasRole, requiredRoles: item.roles, userRole: user.role });
    if (hasRole) return true;
  }

  // Vérifier par permission
  if (item.permission) {
    const hasPermission = hasRolePermission(user.role, item.permission);
    console.log("🔑 Permission check:", { hasPermission, requiredPermission: item.permission });
    if (hasPermission) return true;
  }

  // Si ni rôle ni permission spécifiés, accessible à tous les utilisateurs connectés
  if (!item.roles && !item.permission) {
    console.log("✅ No restrictions, allowing access");
    return true;
  }

  console.log("❌ Access denied");
  return false;
};

// Cette fonction dépend de votre système de permissions
const hasRolePermission = (role, permission) => {
  console.log("🔍 hasRolePermission check:", { role, permission });

  const roleKey = role ? role.toString().toUpperCase() : null;
  console.log("🎭 Role key:", roleKey);

  const permissions = ROLE_PERMISSIONS[roleKey] || [];
  console.log("📋 Available permissions for role:", permissions);

  const hasPermission = permissions.includes(permission);
  console.log("✅ Permission result:", hasPermission);

  return hasPermission;
};