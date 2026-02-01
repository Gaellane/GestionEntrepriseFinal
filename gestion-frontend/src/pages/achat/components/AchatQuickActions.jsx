import React from 'react';
import {
  PrinterIcon,
  EnvelopeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

export default function AchatQuickActions({ 
  achat, 
  processConfig, 
  onPrint, 
  onEmail, 
  onEdit, 
  onCancel 
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions rapides</h3>
      <div className="space-y-3">
        <button
          onClick={onPrint}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
        >
          <PrinterIcon className="w-5 h-5 mr-3 text-gray-600" />
          <span>Imprimer le bon de commande</span>
        </button>
        
        <button
          onClick={onEmail}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
        >
          <EnvelopeIcon className="w-5 h-5 mr-3 text-gray-600" />
          <span>Envoyer par email</span>
        </button>
        
        <button
          onClick={onEdit}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
        >
          <PencilIcon className="w-5 h-5 mr-3 text-gray-600" />
          <span>Modifier l'achat</span>
        </button>
        
        {processConfig.showCancel && (
          <button
            onClick={onCancel}
            className="w-full px-4 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center"
          >
            <TrashIcon className="w-5 h-5 mr-3" />
            <span>Annuler l'achat</span>
          </button>
        )}
      </div>
    </div>
  );
}
