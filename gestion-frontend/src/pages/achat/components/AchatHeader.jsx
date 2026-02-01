import React from 'react';
import { 
  ArrowLeftIcon, 
  PrinterIcon, 
  ShareIcon, 
  DocumentDuplicateIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';

export default function AchatHeader({ achat, onBack, onPrint, onShare, onDuplicate }) {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg">
              <ShoppingCartIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Détail de l'Achat</h1>
              <p className="text-gray-600">Référence: {achat.refe}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={onPrint}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <PrinterIcon className="w-4 h-4 mr-2" />
            <span>Imprimer</span>
          </button>
          
          <button
            onClick={onShare}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <ShareIcon className="w-4 h-4 mr-2" />
            <span>Partager</span>
          </button>
          
          <button
            onClick={onDuplicate}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
            <span>Dupliquer</span>
          </button>
        </div>
      </div>
    </div>
  );
}
