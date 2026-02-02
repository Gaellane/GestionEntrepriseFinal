import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDownIcon, ChevronUpIcon, CubeIcon, UserIcon, ArrowRightEndOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { SIDEBAR_CONFIG } from '../../config/sideBarConfig';
import { usePermissions } from '../../config/permissions';


const SideBar = () => {
  const {hasPermission} = usePermissions();
  const { user, logout } = useAuth();
  const [openCategories, setOpenCategories] = useState({});
  const normalizedRole = user?.role ? user.role.toString().toUpperCase() : null;

  const toggleCategory = (categoryId) => {
    setOpenCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Fonction pour vérifier si un élément doit être visible
  const isVisible = (item) => {
    // Si pas connecté, ne montrer que les éléments publics
    if (!user) return false;
    
    // Toujours visible explicitement
    if (item.alwaysVisible) return true;

    // Vérifier par rôle si défini
    if (item.roles && user.role) {
      return item.roles.includes(user.role) || item.roles.includes(normalizedRole);
    }

    // Vérifier par permission si défini (usePermissions.hasPermission prend la permission)
    if (item.permission) {
      return hasPermission(item.permission);
    }

    // Si ni rôle ni permission spécifiés, considérer visible pour tout utilisateur connecté
    if (!item.roles && !item.permission) return true;

    return false;
  };

  // Fonction pour obtenir les éléments de menu filtrés
  const getFilteredMenuItems = () => {
    if (!user) return { categories: [], admin: null, secondary: [] };
    console.log("User:",user);
    console.log("nb categ",SIDEBAR_CONFIG.categories.length);
    const filteredCategories = SIDEBAR_CONFIG.categories
      .filter(category => {
        console.log(`Is visible:${category.label}`,isVisible(category));
        if (!isVisible(category)) {
          return false;
        }
        
        // Filtrer les sous-items visibles
        const visibleSubItems = category.subItems?.filter(isVisible) || [];
        
        // Retourner la catégorie seulement si elle a des sous-items visibles
        return visibleSubItems.length > 0;
      })
      .map(category => ({
        ...category,
        subItems: category.subItems?.filter(isVisible) || []
      }));    

    return {
      categories: filteredCategories,
    };
  };

  const { categories } = getFilteredMenuItems();

  return (
    <aside className="w-64 bg-linear-to-b from-white to-gray-50 min-h-screen border-r border-gray-200 shadow-sm flex flex-col overflow-y-scroll">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-linear-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
            <CubeIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">StockFlow</h1>
            <p className="text-xs text-gray-500">Gestionnaire Pro</p>
          </div>
        </div>
      </div>

      {/* Menu principal */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {/* Catégories principales */}
        <ul className="space-y-1">
          {categories.map((category) => (
            <li key={category.id} className="mb-1">
              <button
                onClick={() => toggleCategory(category.id)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 group ${
                  openCategories[category.id]
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg transition-colors ${
                    openCategories[category.id]
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-gray-100 text-gray-600 group-hover:text-emerald-600'
                  }`}>
                    {category.icon}
                  </div>
                  <span className="font-medium">{category.label}</span>
                </div>
                {openCategories[category.id] ? (
                  <ChevronUpIcon className="w-4 h-4 transition-transform" />
                ) : (
                  <ChevronDownIcon className="w-4 h-4 transition-transform" />
                )}
              </button>

              {/* Sous-menu */}
              {openCategories[category.id] && category.subItems.length > 0 && (
                <ul className="mt-1 animate-fadeIn">
                  {category.subItems.map((subItem) => (
                    <li key={subItem.id} className="pl-12 py-2 hover:bg-emerald-50 transition-colors duration-150">
                      <NavLink
                        to={subItem.path}
                        className={({ isActive }) =>
                          `flex items-center text-sm group ${
                            isActive
                              ? 'text-emerald-700 font-medium'
                              : 'text-gray-600 hover:text-emerald-700'
                          }`
                        }
                      >
                        <span className="mr-3 transition-colors text-emerald-500 group-hover:text-emerald-600">
                          {subItem.icon}
                        </span>
                        <span>{subItem.label}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Section utilisateur */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer group">
          <div className="w-10 h-10 bg-gradient-to-r from-gray-700 to-gray-900 rounded-full flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-800">{user?.name || 'Utilisateur'}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role || 'Invitè'}</p>
          </div>
          <button
            onClick={logout}
            className="p-2 hover:bg-red-50 rounded-md transition-colors"
            title="Déconnexion"
          >
            <ArrowRightEndOnRectangleIcon className="w-5 h-5 text-gray-500 hover:text-red-500 transition-colors" />
          </button>
        </div>
      </div>

      {/* Footer sidebar */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-xs text-gray-500">v2.4.1 • © 2024</p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </aside>
  );
};

export default SideBar;