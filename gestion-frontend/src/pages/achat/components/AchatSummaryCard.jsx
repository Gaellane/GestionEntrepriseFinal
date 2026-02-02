import React from 'react';

export default function AchatSummaryCard({ achat, processConfig, totalAmount }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Résumé</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Nombre d'articles</span>
          <span className="font-medium">{achat.achatLignes?.length || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Statut</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${processConfig.labelColor}`}>
            {processConfig.label}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Créé le</span>
          <span className="font-medium">
            {new Date(achat.dateEffective).toLocaleDateString('fr-FR')}
          </span>
        </div>
        <div className="pt-3 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-gray-800 font-semibold">Total</span>
            <span className="text-2xl font-bold text-emerald-600">
              {totalAmount} €
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
