import { useState } from 'react';
import {
  DocumentTextIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
  PaperClipIcon,
  XMarkIcon,
  DocumentArrowUpIcon,
  ShoppingCartIcon,
  UserIcon,
  CalendarIcon,
  CurrencyEuroIcon,
  DocumentPlusIcon,
  CalculatorIcon,
  ArchiveBoxIcon,
  ArrowUturnLeftIcon
} from '@heroicons/react/24/outline';

import SideBar from '../../components/layout/SideBar';

const ProformaAchatSaisie = () => {
  const [formData, setFormData] = useState({
    achat_id: '',
    fournisseur_id: '',
    date_entree: new Date().toISOString().split('T')[0],
    montant_total: '',
    refe: '',
    lignes: []
  });

  const [ligneCourante, setLigneCourante] = useState({
    article_id: '',
    quantite: '',
    prix_unitaire: ''
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLigneChange = (e) => {
    const { name, value } = e.target;
    setLigneCourante(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const ajouterLigne = () => {
    if (ligneCourante.article_id && ligneCourante.quantite && ligneCourante.prix_unitaire) {
      const nouvelleLigne = {
        ...ligneCourante,
        id: Date.now()
      };
      
      setFormData(prev => ({
        ...prev,
        lignes: [...prev.lignes, nouvelleLigne]
      }));

      const montantLigne = parseFloat(ligneCourante.quantite) * parseFloat(ligneCourante.prix_unitaire);
      setFormData(prev => ({
        ...prev,
        montant_total: (parseFloat(prev.montant_total || 0) + montantLigne).toFixed(2)
      }));

      setLigneCourante({
        article_id: '',
        quantite: '',
        prix_unitaire: ''
      });
    }
  };

  const supprimerLigne = (index) => {
    const lignesCopie = [...formData.lignes];
    const ligneSupprimee = lignesCopie.splice(index, 1)[0];
    
    const montantASoustraire = parseFloat(ligneSupprimee.quantite) * parseFloat(ligneSupprimee.prix_unitaire);
    
    setFormData(prev => ({
      ...prev,
      lignes: lignesCopie,
      montant_total: (parseFloat(prev.montant_total || 0) - montantASoustraire).toFixed(2)
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const nouvellesPieces = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: (file.size / 1024).toFixed(2) + ' KB',
      file: file
    }));
    
    setUploadedFiles(prev => [...prev, ...nouvellesPieces]);
  };

  const removeFile = (id) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Données à soumettre:', formData);
    console.log('Fichiers joints:', uploadedFiles);
  };

  return (
    <div className="flex">
      <SideBar />
      <div className="min-h-screen max-h-full bg-gradient-to-br from-gray-50 to-gray-100 p-6 overflow-y-scroll flex-1">
        <div className="max-w-6xl mx-auto">
          {/* En-tête */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg">
                <DocumentTextIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Saisie Proforma Achat</h1>
                <p className="text-gray-600">Créez une nouvelle proforma pour vos achats</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section principale */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Colonne 1 : Informations générales */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg p-6 h-full">
                  <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-200 flex items-center">
                    <DocumentTextIcon className="w-5 h-5 mr-2 text-emerald-600" />
                    Informations générales
                  </h2>
                  
                  <div className="space-y-4">
                    {/* Référence */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <DocumentTextIcon className="w-4 h-4 mr-1" />
                        Référence *
                      </label>
                      <input
                        type="text"
                        name="refe"
                        value={formData.refe}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                        placeholder="REF-2024-001"
                      />
                    </div>

                    {/* Achat ID */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <ShoppingCartIcon className="w-4 h-4 mr-1" />
                        N° Achat *
                      </label>
                      <input
                        type="number"
                        name="achat_id"
                        value={formData.achat_id}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                        placeholder="12345"
                      />
                    </div>

                    {/* Fournisseur ID */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <UserIcon className="w-4 h-4 mr-1" />
                        Fournisseur *
                      </label>
                      <select
                        name="fournisseur_id"
                        value={formData.fournisseur_id}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                      >
                        <option value="">Sélectionner un fournisseur</option>
                        <option value="1">Fournisseur A</option>
                        <option value="2">Fournisseur B</option>
                        <option value="3">Fournisseur C</option>
                      </select>
                    </div>

                    {/* Date d'entrée */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        Date d'entrée *
                      </label>
                      <input
                        type="date"
                        name="date_entree"
                        value={formData.date_entree}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                      />
                    </div>

                    {/* Montant total */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <CurrencyEuroIcon className="w-4 h-4 mr-1" />
                        Montant total
                      </label>
                      <div className="relative">
                        <CurrencyEuroIcon className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                        <input
                          type="text"
                          value={formData.montant_total}
                          readOnly
                          className="w-full px-10 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-semibold outline-none"
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1 flex items-center">
                        <CalculatorIcon className="w-4 h-4 mr-1" />
                        Calculé automatiquement
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Colonne 2 : Ajout de lignes */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-200 flex items-center">
                    <ArchiveBoxIcon className="w-5 h-5 mr-2 text-emerald-600" />
                    Articles à commander
                  </h2>

                  {/* Formulaire d'ajout de ligne */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Article *
                      </label>
                      <select
                        name="article_id"
                        value={ligneCourante.article_id}
                        onChange={handleLigneChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      >
                        <option value="">Sélectionner</option>
                        <option value="1">Article A</option>
                        <option value="2">Article B</option>
                        <option value="3">Article C</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantité *
                      </label>
                      <input
                        type="number"
                        name="quantite"
                        value={ligneCourante.quantite}
                        onChange={handleLigneChange}
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prix unitaire *
                      </label>
                      <div className="relative">
                        <CurrencyEuroIcon className="absolute left-3 top-2 w-5 h-5 text-gray-500" />
                        <input
                          type="number"
                          name="prix_unitaire"
                          value={ligneCourante.prix_unitaire}
                          onChange={handleLigneChange}
                          step="0.01"
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-3 flex justify-end">
                      <button
                        type="button"
                        onClick={ajouterLigne}
                        className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all flex items-center space-x-2"
                      >
                        <PlusIcon className="w-5 h-5" />
                        <span>Ajouter la ligne</span>
                      </button>
                    </div>
                  </div>

                  {/* Tableau des lignes */}
                  {formData.lignes.length > 0 ? (
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Article
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Quantité
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Prix unitaire
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {formData.lignes.map((ligne, index) => (
                            <tr key={ligne.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-900">Article #{ligne.article_id}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-900">{ligne.quantite}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-900">{parseFloat(ligne.prix_unitaire).toFixed(2)} €</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="font-semibold text-emerald-600">
                                  {(parseFloat(ligne.quantite) * parseFloat(ligne.prix_unitaire)).toFixed(2)} €
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => supprimerLigne(index)}
                                  className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors"
                                >
                                  <TrashIcon className="w-5 h-5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                      <DocumentPlusIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Aucun article ajouté. Commencez par ajouter des articles ci-dessus.</p>
                    </div>
                  )}

                  {/* Section téléversement de fichiers */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <PaperClipIcon className="w-5 h-5 mr-2 text-emerald-600" />
                      Pièces jointes
                    </h3>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        id="file-upload"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <DocumentArrowUpIcon className="w-12 h-12 text-gray-400 mb-4" />
                        <span className="text-gray-600 font-medium">
                          Cliquez pour téléverser des fichiers
                        </span>
                        <span className="text-sm text-gray-500 mt-1">
                          PDF, JPG, PNG jusqu'à 10MB
                        </span>
                      </label>
                    </div>

                    {/* Liste des fichiers */}
                    {uploadedFiles.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {uploadedFiles.map(file => (
                          <div key={file.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <DocumentTextIcon className="w-5 h-5 text-emerald-600" />
                              <div>
                                <p className="font-medium text-gray-700">{file.name}</p>
                                <p className="text-sm text-gray-500">{file.size}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(file.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <XMarkIcon className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all flex items-center space-x-2"
              >
                <ArrowUturnLeftIcon className="w-5 h-5" />
                <span>Annuler</span>
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg font-semibold hover:opacity-90 hover:shadow-lg transition-all flex items-center space-x-2"
              >
                <CheckIcon className="w-5 h-5" />
                <span>Enregistrer la proforma</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProformaAchatSaisie;