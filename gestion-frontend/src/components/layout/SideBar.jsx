import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCartIcon,
  ChartBarIcon,
  TruckIcon,
  CubeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  CogIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  DocumentPlusIcon,
  DocumentCheckIcon,
  ListBulletIcon,
  PlusCircleIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline';

const SideBar = () => {
  const [openCategories, setOpenCategories] = useState({
    achats: false,
    vente: false,
    livraison: false,
    inventaire: false
  });

  const toggleCategory = (category) => {
    setOpenCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const menuItems = {
    achats: {
      icon: <ShoppingCartIcon className="w-5 h-5" />,
      subItems: [
        { name: 'proforma', icon: <DocumentTextIcon className="w-4 h-4" /> },
        { name: 'demandes', icon: <ClipboardDocumentListIcon className="w-4 h-4" /> }
      ]
    },
    vente: {
      icon: <ChartBarIcon className="w-5 h-5" />,
      subItems: [
        { name: 'proforma', icon: <DocumentTextIcon className="w-4 h-4" /> },
        { name: 'insertion', icon: <DocumentPlusIcon className="w-4 h-4" /> }
      ]
    },
    livraison: {
      icon: <TruckIcon className="w-5 h-5" />,
      subItems: [
        { name: 'liste', icon: <ListBulletIcon className="w-4 h-4" /> },
        { name: 'enregistrement', icon: <DocumentCheckIcon className="w-4 h-4" /> }
      ]
    },
    inventaire: {
      icon: <CubeIcon className="w-5 h-5" />,
      subItems: [
        { name: 'initier', icon: <PlusCircleIcon className="w-4 h-4" /> },
        { name: 'rapports', icon: <ChartPieIcon className="w-4 h-4" /> }
      ]
    }
    ,
    stock: {
      icon: <ListBulletIcon className="w-5 h-5" />,
      subItems: [
        { name: 'Entrée', icon: <DocumentPlusIcon className="w-4 h-4" />, to: '/stock?type=ENTREE' },
        { name: 'Sortie', icon: <DocumentCheckIcon className="w-4 h-4" />, to: '/stock?type=SORTIE' }
      ]
    }
  };

  const renderSubItems = (category) => {
    return menuItems[category].subItems.map((item, index) => (
      <li key={index} className="pl-12 py-2 hover:bg-emerald-50 transition-colors duration-150">
        {item.to ? (
          <Link to={item.to} className="flex items-center text-gray-600 hover:text-emerald-700 text-sm group">
            <span className="mr-3 text-emerald-500 group-hover:text-emerald-600 transition-colors">{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </Link>
        ) : (
          <a href="#" className="flex items-center text-gray-600 hover:text-emerald-700 text-sm group">
            <span className="mr-3 text-emerald-500 group-hover:text-emerald-600 transition-colors">{item.icon}</span>
            <span className="font-medium">{item.name.charAt(0).toUpperCase() + item.name.slice(1)}</span>
          </a>
        )}
      </li>
    ));
  };

  return (
    <aside className="w-64 bg-gradient-to-b from-white to-gray-50 min-h-screen border-r border-gray-200 shadow-sm flex flex-col overflow-y-scroll">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
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
        {/* Lien Dashboard */}
        <div className="mb-6">
          <a 
            href="#" 
            className="flex items-center space-x-3 p-3 text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors group"
          >
            <HomeIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Dashboard</span>
          </a>
        </div>

        <ul className="space-y-1">
          {Object.keys(menuItems).map((category) => (
            <li key={category} className="mb-1">
              {/* Bouton catégorie */}
              <button
                onClick={() => toggleCategory(category)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 group ${
                  openCategories[category] 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg transition-colors ${
                    openCategories[category] 
                      ? 'bg-emerald-100 text-emerald-600' 
                      : 'bg-gray-100 text-gray-600 group-hover:text-emerald-600'
                  }`}>
                    {menuItems[category].icon}
                  </div>
                  <span className="font-medium">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </span>
                </div>
                {/* Flèche toggle */}
                {openCategories[category] ? (
                  <ChevronUpIcon className="w-4 h-4 transition-transform" />
                ) : (
                  <ChevronDownIcon className="w-4 h-4 transition-transform" />
                )}
              </button>

              {/* Sous-menu */}
              {openCategories[category] && (
                <ul className="mt-1 animate-fadeIn">
                  {renderSubItems(category)}
                </ul>
              )}
            </li>
          ))}
        </ul>

        {/* Lien Paramètres */}
        <div className="mt-8">
          <a 
            href="#" 
            className="flex items-center space-x-3 p-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors group"
          >
            <CogIcon className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span className="font-medium">Paramètres</span>
          </a>
        </div>
      </nav>

      {/* Section utilisateur */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer group">
          <div className="w-10 h-10 bg-gradient-to-r from-gray-700 to-gray-900 rounded-full flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-800">John Doe</p>
            <p className="text-xs text-gray-500">Administrateur</p>
          </div>
          <ArrowRightOnRectangleIcon className="w-5 h-5 text-gray-500 group-hover:text-red-500 transition-colors" />
        </div>
      </div>

      {/* Footer sidebar */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-xs text-gray-500">v2.4.1 • © 2024</p>
        </div>
      </div>

      <style jsx>{`
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