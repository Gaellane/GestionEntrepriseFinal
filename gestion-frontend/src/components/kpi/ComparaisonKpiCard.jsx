import React from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

export default function ComparaisonKpiCard({ 
  title, 
  estimation, 
  reel, 
  ecart, 
  pourcentage,
  color = 'blue'
}) {
  const colors = {
    blue: {
      bg: 'from-blue-600 to-blue-700',
      light: 'bg-blue-50',
      text: 'text-blue-600'
    },
    green: {
      bg: 'from-green-600 to-green-700',
      light: 'bg-green-50',
      text: 'text-green-600'
    },
    purple: {
      bg: 'from-purple-600 to-purple-700',
      light: 'bg-purple-50',
      text: 'text-purple-600'
    }
  };

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return 'N/A';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MGA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val).replace('MGA', 'Ar');
  };

  const currentColor = colors[color] || colors.blue;
  const isPositive = ecart >= 0;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className={`bg-gradient-to-r ${currentColor.bg} px-6 py-4`}>
        <h3 className="text-white font-semibold text-lg">{title}</h3>
      </div>
      <div className="px-6 py-6">
        {/* Estimation */}
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-1">Prix Estimation</p>
          <p className="text-2xl font-bold text-gray-700">{formatCurrency(estimation)}</p>
        </div>

        {/* Réel */}
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-1">Prix Réel (Bon de Commande)</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(reel)}</p>
        </div>

        {/* Écart */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Écart</p>
              <p className={`text-xl font-bold ${isPositive ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(Math.abs(ecart))}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {isPositive ? (
                <ArrowTrendingUpIcon className="w-8 h-8 text-red-600" />
              ) : (
                <ArrowTrendingDownIcon className="w-8 h-8 text-green-600" />
              )}
              <span className={`text-2xl font-bold ${isPositive ? 'text-red-600' : 'text-green-600'}`}>
                {isPositive ? '+' : ''}{pourcentage?.toFixed(2)}%
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {isPositive ? 'Dépassement du budget' : 'Économie réalisée'}
          </p>
        </div>
      </div>
    </div>
  );
}
