import React from 'react';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';

export default function KpiCard({ title, value, subtitle, color = 'blue', icon: Icon, format = 'number' }) {
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
    },
    orange: {
      bg: 'from-orange-600 to-orange-700',
      light: 'bg-orange-50',
      text: 'text-orange-600'
    },
    red: {
      bg: 'from-red-600 to-red-700',
      light: 'bg-red-50',
      text: 'text-red-600'
    },
    emerald: {
      bg: 'from-emerald-600 to-emerald-700',
      light: 'bg-emerald-50',
      text: 'text-emerald-600'
    }
  };

  const formatValue = (val) => {
    if (val === null || val === undefined) return 'N/A';
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'MGA',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(val).replace('MGA', 'Ar');
      
      case 'percent':
        return `${val.toFixed(2)}%`;
      
      case 'number':
        return new Intl.NumberFormat('fr-FR').format(val);
      
      default:
        return val;
    }
  };

  const currentColor = colors[color] || colors.blue;
  const DisplayIcon = Icon || CurrencyDollarIcon;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className={`bg-gradient-to-r ${currentColor.bg} px-6 py-4`}>
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold text-lg">{title}</h3>
          <DisplayIcon className="w-8 h-8 text-white opacity-80" />
        </div>
      </div>
      <div className="px-6 py-6">
        <div className={`text-4xl font-bold ${currentColor.text} mb-2`}>
          {formatValue(value)}
        </div>
        {subtitle && (
          <p className="text-gray-500 text-sm">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
