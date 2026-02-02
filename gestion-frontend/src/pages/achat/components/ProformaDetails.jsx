import React from 'react';
import { 
  DocumentTextIcon, 
  CalendarIcon, 
  CurrencyDollarIcon,
  CubeIcon,
  TagIcon,
  HashtagIcon
} from '@heroicons/react/24/outline';

export default function ProformaDetails({ proforma }) {
  if (!proforma) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <DocumentTextIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500">Aucune donnée de proforma disponible</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* En-tête */}
      <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Proforma - {proforma.refe}
              </h2>
              <p className="text-sm text-gray-600">
                Fournisseur : {proforma.fournisseur?.fournisseurNom}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-700">
              {proforma.montantTotal?.toLocaleString('fr-FR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })} €
            </div>
            <p className="text-sm text-gray-500">Montant total</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Informations principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Informations fournisseur */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <CubeIcon className="w-5 h-5 mr-2 text-gray-600" />
              Fournisseur
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-500">Nom</p>
                <p className="font-medium text-gray-900">{proforma.fournisseur?.fournisseurNom}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Contact</p>
                <p className="text-gray-900">{proforma.fournisseur?.contact || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Adresse</p>
                <p className="text-gray-900">{proforma.fournisseur?.adresse || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Coordonnées bancaires</p>
                <p className="text-gray-900 font-mono text-sm">
                  {proforma.fournisseur?.coordonneeBancaire || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Informations dates */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2 text-gray-600" />
              Dates
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Date d'entrée</p>
                <p className="font-medium text-gray-900">
                  {proforma.dateEntree ? new Date(proforma.dateEntree).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </p>
                <p className="text-sm text-gray-500">
                  {proforma.dateEntree ? new Date(proforma.dateEntree).toLocaleTimeString('fr-FR') : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Informations financières */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <CurrencyDollarIcon className="w-5 h-5 mr-2 text-gray-600" />
              Informations financières
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Référence</p>
                <p className="font-medium text-gray-900">{proforma.refe}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Montant total</p>
                <p className="text-2xl font-bold text-blue-700">
                  {proforma.montantTotal?.toLocaleString('fr-FR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })} €
                </p>
              </div>
              {proforma.lienFichier && (
                <div className="pt-3 border-t border-gray-200">
                  <a
                    href={proforma.lienFichier}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <DocumentTextIcon className="w-4 h-4 mr-2" />
                    Voir le fichier
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lignes de la proforma */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
            <HashtagIcon className="w-5 h-5 mr-2 text-gray-600" />
            Articles ({proforma.lignes?.length || 0})
          </h3>
          
          {proforma.lignes && proforma.lignes.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Référence
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Article
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Catégorie
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantité
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix unitaire
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {proforma.lignes.map((ligne, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {ligne.article?.refe}
                        </div>
                        <div className="text-xs text-gray-500">
                          {ligne.article?.unite?.abreviation || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {ligne.article?.articleNom}
                          </div>
                          <div className="text-xs text-gray-500">
                            {ligne.article?.description}
                          </div>
                          {ligne.article?.valorisation && (
                            <span className="inline-flex items-center px-2 py-1 mt-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              {ligne.article.valorisation}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <TagIcon className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {ligne.article?.categorie?.categorieName || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {ligne.quantite?.toLocaleString('fr-FR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {ligne.prixUnitaire?.toLocaleString('fr-FR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })} €
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-blue-700">
                          {ligne.montantTotal?.toLocaleString('fr-FR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })} €
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="5" className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                      Total général :
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-bold text-blue-700">
                      {proforma.montantTotal?.toLocaleString('fr-FR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })} €
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
              <p>Aucun article dans cette proforma</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}