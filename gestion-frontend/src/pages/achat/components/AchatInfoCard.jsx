import React from 'react';
import {
  UserIcon,
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
  CurrencyEuroIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';



export default function AchatInfoCard({ 
  achat, 
  processConfig, 
  totalAmount, 
  actionLoading,
  onAction,
  onCancel ,
  saveCommande
}) {
  const ButtonIcon = processConfig.buttonIcon;
 
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Informations Générales</h2>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${processConfig.labelColor}`}>
              {processConfig.label}
            </span>
            <span className="text-sm text-gray-600">ID: {achat.id}</span>
          </div>
        </div>
        
        {processConfig.buttonText && (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onAction(processConfig.buttonText, processConfig.id)}
              disabled={actionLoading}
              className={`px-4 py-2 bg-gradient-to-r ${processConfig.buttonColor} text-white rounded-lg hover:opacity-90 transition-all flex items-center space-x-2 ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {actionLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Chargement...</span>
                </>
              ) : (
                <>
                  {ButtonIcon && <ButtonIcon className="w-4 h-4" />}
                  <span>{processConfig.buttonText}</span>
                </>
              )}
            </button>
            
            {/* Bouton supplémentaire pour le processus 25 (DEMANDE PROFORMA) */}
            {processConfig.id === 25 && (
              <button
                onClick={() => saveCommande()}
                className="px-4 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-all flex items-center space-x-2"
              >
                <DocumentTextIcon className="w-4 h-4" />
                <span>Procéder à la commande</span>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Référence</h3>
            <p className="text-lg font-semibold text-gray-900">{achat.refe}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Demandeur</h3>
            <div className="flex items-center space-x-2">
              <UserIcon className="w-5 h-5 text-gray-400" />
              <span className="text-gray-900">{achat.demandeur}</span>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Date effective</h3>
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-gray-400" />
              <span className="text-gray-900">
                {new Date(achat.dateEffective).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Processus</h3>
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-gray-900">{achat.process?.processName}</p>
                <p className="text-sm text-gray-500">Étape {achat.process?.valeur}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Type de processus</h3>
            <div className="flex items-center space-x-2">
              <DocumentTextIcon className="w-5 h-5 text-gray-400" />
              <span className="text-gray-900">{achat.achatProcess?.abreviation}</span>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Montant total</h3>
            <div className="flex items-center space-x-2">
              <CurrencyEuroIcon className="w-6 h-6 text-emerald-600" />
              <span className="text-2xl font-bold text-emerald-600">
                {totalAmount} €
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {achat.achatLignes?.length || 0} article(s)
            </p>
          </div>
        </div>
      </div>
      
      {processConfig.showCancel && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-all flex items-center space-x-2"
          >
            <XCircleIcon className="w-4 h-4" />
            <span>Annuler cet achat</span>
          </button>
        </div>
      )}
    </div>
  );
}