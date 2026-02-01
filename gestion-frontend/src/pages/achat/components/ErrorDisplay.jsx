import React from 'react';
import { ExclamationTriangleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function ErrorDisplay({ error, onBack }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Erreur</h3>
        <p className="text-red-600 mb-4">{error || 'Achat non trouvé'}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center mx-auto"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Retour à la liste
        </button>
      </div>
    </div>
  );
}
