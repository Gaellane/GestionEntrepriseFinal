import React from 'react';
import {
  DocumentTextIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function AchatHistoryTimeline({ achat }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Historique des étapes</h3>
      <div className="space-y-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <DocumentTextIcon className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">Création de l'achat</p>
            <p className="text-sm text-gray-500">
              {new Date(achat.dateEffective).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">Validation magasinier</p>
            <p className="text-sm text-gray-500">
              {achat.process?.valeur >= 11 ? 'Validé' : 'En attente'}
            </p>
          </div>
        </div>
        
        {achat.process?.valeur >= 21 && (
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <CheckCircleIcon className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Validation financier</p>
              <p className="text-sm text-gray-500">Validé</p>
            </div>
          </div>
        )}
        
        {achat.process?.valeur >= 31 && (
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <CheckCircleIcon className="w-4 h-4 text-orange-600" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Commande passée</p>
              <p className="text-sm text-gray-500">En cours</p>
            </div>
          </div>
        )}
        
        {achat.process?.valeur >= 41 && (
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center">
                <CheckCircleIcon className="w-4 h-4 text-cyan-600" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Réception</p>
              <p className="text-sm text-gray-500">Réceptionné</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
