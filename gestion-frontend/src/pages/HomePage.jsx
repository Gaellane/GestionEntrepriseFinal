import React from 'react';
import { 
  BuildingOfficeIcon, 
  UserGroupIcon, 
  ChartBarIcon, 
  ShieldCheckIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  BellIcon,
  CalendarIcon,
  BookOpenIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

const HomePage = () => {
  // Données simulées pour l'utilisateur
  const userInfo = {
    name: "Marie Dupont",
    role: "Gestionnaire Achats",
    department: "Service Approvisionnement",
    lastLogin: "Aujourd'hui, 08:45",
  };

  // Statistiques rapides
  const quickStats = [
    { label: "Proformas en attente", value: "3", color: "bg-amber-100 text-amber-800" },
    { label: "Commandes ce mois", value: "12", color: "bg-blue-100 text-blue-800" },
    { label: "Fournisseurs actifs", value: "8", color: "bg-emerald-100 text-emerald-800" },
    { label: "Documents à valider", value: "5", color: "bg-purple-100 text-purple-800" },
  ];

  // Actions rapides
  const quickActions = [
    { title: "Créer une proforma", icon: DocumentTextIcon, color: "bg-emerald-500" },
    { title: "Voir les commandes", icon: ChartBarIcon, color: "bg-blue-500" },
    { title: "Gérer les fournisseurs", icon: UserGroupIcon, color: "bg-amber-500" },
    { title: "Consulter le calendrier", icon: CalendarDaysIcon, color: "bg-purple-500" },
  ];

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        {/* En-tête de bienvenue */}
        <div className="mb-8 bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <BuildingOfficeIcon className="w-10 h-10" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">Bienvenue sur ProPurchase</h1>
                  <p className="text-emerald-100 mt-1">Système de gestion des achats professionnels</p>
                </div>
              </div>
              
              <div className="mt-6 flex items-center space-x-6">
                <div className="flex items-center space-x-3 bg-white/10 p-4 rounded-xl">
                  <div className="p-2 bg-white rounded-lg">
                    <ShieldCheckIcon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-emerald-100">Connecté en tant que</p>
                    <p className="font-bold text-lg">{userInfo.name}</p>
                    <p className="text-sm">{userInfo.role}</p>
                  </div>
                </div>
                
                <div className="hidden md:block">
                  <p className="text-emerald-100">Dernière connexion : {userInfo.lastLogin}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 md:mt-0 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="text-lg font-semibold flex items-center gap-3"> 
                <CalendarIcon className="w-5 h-5" />
                <p>
                    {new Date().toLocaleDateString('fr-FR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section principale */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne de gauche : Présentation */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <BuildingOfficeIcon className="w-6 h-6 mr-3 text-emerald-600" />
                Notre Entreprise
              </h2>
              
              <div className="prose prose-emerald max-w-none">
                <p className="text-gray-600 mb-4 text-lg">
                  Bienvenue dans notre plateforme de gestion des achats, conçue pour optimiser 
                  et simplifier vos processus d'approvisionnement.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-emerald-50 p-5 rounded-xl">
                    <h3 className="font-bold text-emerald-800 mb-3 flex items-center">
                      <ChartBarIcon className="w-5 h-5 mr-2" />
                      Notre Mission
                    </h3>
                    <p className="text-gray-700">
                      Fournir des outils performants pour une gestion transparente et efficace 
                      des achats, de la demande à la facturation.
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 p-5 rounded-xl">
                    <h3 className="font-bold text-blue-800 mb-3 flex items-center">
                      <UserGroupIcon className="w-5 h-5 mr-2" />
                      Notre Vision
                    </h3>
                    <p className="text-gray-700">
                      Devenir le partenaire de référence pour la digitalisation des processus 
                      achats des entreprises de toutes tailles.
                    </p>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-bold text-gray-800 mb-4">Fonctionnalités principales</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                      <span>Saisie et suivi des proformas</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                      <span>Gestion des fournisseurs</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                      <span>Suivi des commandes en temps réel</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                      <span>Analyse des dépenses et reporting</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Statistiques */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Aperçu de votre activité</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickStats.map((stat, index) => (
                  <div key={index} className="text-center p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${stat.color.split(' ')[0]} mb-3`}>
                      <span className="text-xl font-bold">{stat.value}</span>
                    </div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Colonne de droite : Actions rapides */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <BellIcon className="w-6 h-6 mr-3 text-amber-600" />
                Actions rapides
              </h2>
              
              <div className="space-y-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${action.color} text-white`}>
                        <action.icon className="w-6 h-6" />
                      </div>
                      <span className="font-medium text-gray-700 group-hover:text-emerald-700">
                        {action.title}
                      </span>
                    </div>
                    <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-emerald-600" />
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
              <h2 className="text-xl font-bold mb-4">Besoin d'aide ?</h2>
              <p className="mb-6 text-blue-100">
                Consultez notre guide d'utilisation ou contactez le support technique pour 
                toute assistance.
              </p>
              <div className="space-y-3">
                <button className="w-full bg-white/20 hover:bg-white/30 p-3 rounded-lg transition-colors text-left flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpenIcon className="w-5 h-5"  />
                    <span> Guide d'utilisation</span>
                  </div>
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
                <button className="w-full bg-white/20 hover:bg-white/30 p-3 rounded-lg transition-colors text-left flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PencilIcon className="w-5 h-5"  />
                    <span> Support technique</span>
                  </div>
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-gray-800 mb-4">Votre département</h3>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <UserGroupIcon className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold">{userInfo.department}</p>
                  <p className="text-sm text-gray-600">Équipe : 5 membres actifs</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pied de page */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} ProPurchase - Plateforme de Gestion des Achats</p>
          <p className="mt-1">Version 2.1.0 • Dernière mise à jour : 15/01/2024</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;