import React from 'react';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

export default function AchatArticlesTable({ achat, totalAmount }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Articles commandés</h2>
        <p className="text-sm text-gray-600 mt-1">
          {achat.achatLignes?.length || 0} article(s) au total
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Article
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Référence
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantité
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prix unitaire
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prix estimé
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {achat.achatLignes && achat.achatLignes.length > 0 ? (
              achat.achatLignes.map((ligne, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {ligne.articleNom || 'Article non spécifié'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ligne.articleRefe || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">{ligne.quantite}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">{ligne.prixUnitaire?.toFixed(2)} €</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {ligne.prixUnitaireEstime ? (
                      <div className="text-gray-900">
                        {ligne.prixUnitaireEstime?.toFixed(2)} €
                        {ligne.prixUnitaireEstime !== ligne.prixUnitaire && (
                          <span className={`ml-2 text-xs ${ligne.prixUnitaireEstime > ligne.prixUnitaire ? 'text-red-600' : 'text-green-600'}`}>
                            ({ligne.prixUnitaireEstime > ligne.prixUnitaire ? '+' : ''}{((ligne.prixUnitaireEstime - ligne.prixUnitaire) / ligne.prixUnitaire * 100).toFixed(1)}%)
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-400 text-sm">N/A</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-emerald-600">
                      {(ligne.quantite * ligne.prixUnitaire)?.toFixed(2)} €
                    </div>
                    {ligne.prixUnitaireEstime && ligne.prixUnitaireEstime !== ligne.prixUnitaire && (
                      <div className="text-xs text-gray-500">
                        Estimé: {(ligne.quantite * ligne.prixUnitaireEstime)?.toFixed(2)} €
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  <ShoppingCartIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Aucun article dans cet achat</p>
                </td>
              </tr>
            )}
            
            {achat.achatLignes && achat.achatLignes.length > 0 && (
              <tr className="bg-gray-50">
                <td colSpan="5" className="px-6 py-4 text-right font-medium text-gray-700">
                  Total général :
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-xl text-emerald-600">
                    {totalAmount} €
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
