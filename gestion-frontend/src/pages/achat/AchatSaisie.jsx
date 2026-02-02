import React, { useState, useEffect } from 'react';
import { getAllArticlesNoPagination } from '../../api/articleApi';
import { sendAchat } from '../../api/achatApi';
import {
  PlusIcon,
  TrashIcon,
  CalendarIcon,
  ShoppingCartIcon,
  DocumentTextIcon,
  CheckIcon,
  ArrowUturnLeftIcon,
  CurrencyEuroIcon,
  ArchiveBoxIcon,
  MagnifyingGlassIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const AchatSaisie = () => {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [searchArticle, setSearchArticle] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Form data - seulement dateEffective et lignes
  const [formData, setFormData] = useState({
    dateEffective: new Date().toISOString().split('T')[0],
    lignes: []
  });

  // Current line being added
  const [currentLigne, setCurrentLigne] = useState({
    articleId: '',
    quantite: '',
    prixUnitaireEstime: ''
  });

  // Fetch articles on component mount
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        // getAllArticlesNoPagination returns { success, message, data }
        const response = await getAllArticlesNoPagination();

        console.log('Response complète:', response);

        // Extract data array from response
        const articlesArray = Array.isArray(response?.data) ? response.data : [];

        console.log('Articles chargés:', articlesArray.length, 'articles');
        setArticles(articlesArray);
        setFilteredArticles(articlesArray);
      } catch (error) {
        console.error('Error fetching articles:', error);
        setError('Erreur lors du chargement des articles');
        setArticles([]);
        setFilteredArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // Filter articles based on search
  useEffect(() => {
    if (!Array.isArray(articles)) {
      setFilteredArticles([]);
      return;
    }

    if (searchArticle.trim() === '') {
      setFilteredArticles(articles);
    } else {
      const filtered = articles.filter(article =>
        article.articleNom?.toLowerCase().includes(searchArticle.toLowerCase()) ||
        article.refe?.toLowerCase().includes(searchArticle.toLowerCase()) ||
        article.description?.toLowerCase().includes(searchArticle.toLowerCase())
      );
      setFilteredArticles(filtered);
    }
  }, [searchArticle, articles]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle line input changes
  const handleLigneChange = (e) => {
    const { name, value } = e.target;
    setCurrentLigne(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add a new line to the purchase
  const ajouterLigne = () => {
    if (currentLigne.articleId && currentLigne.quantite && currentLigne.prixUnitaireEstime) {
      const article = articles.find(a => a.id === parseInt(currentLigne.articleId));

      if (!article) return;

      const nouvelleLigne = {
        id: Date.now(),
        articleId: parseInt(currentLigne.articleId),
        article,
        quantite: parseFloat(currentLigne.quantite),
        prixUnitaireEstime: parseFloat(currentLigne.prixUnitaireEstime)
      };

      setFormData(prev => ({
        ...prev,
        lignes: [...prev.lignes, nouvelleLigne]
      }));

      // Reset current line
      setCurrentLigne({
        articleId: '',
        quantite: '',
        prixUnitaireEstime: ''
      });
      setSearchArticle('');
    }
  };

  // Remove a line
  const supprimerLigne = (index) => {
    setFormData(prev => ({
      ...prev,
      lignes: prev.lignes.filter((_, i) => i !== index)
    }));
  };

  // Calculate total estimated amount
  const calculerTotalEstime = () => {
    return formData.lignes.reduce((total, ligne) => {
      return total + (ligne.quantite * ligne.prixUnitaireEstime);
    }, 0).toFixed(2);
  };

  // Handle form submission - CORRIGÉ
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    // Validation
    if (formData.lignes.length === 0) {
      setError('Veuillez ajouter au moins un article');
      setSubmitting(false);
      return;
    }

    // Préparer les données à envoyer - Format CORRECT
    const achatData = {
      dateEffective: formData.dateEffective,
      lignes: formData.lignes.map(ligne => ({
        articleId: ligne.articleId,
        quantite: ligne.quantite,
        prixUnitaireEstime: ligne.prixUnitaireEstime
      }))
    };

    console.log('Données à envoyer:', JSON.stringify(achatData, null, 2));

    try {
      const response = await sendAchat(achatData);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur API:', errorText);
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      // Read response as text first to debug
      const responseText = await response.text();
      console.log('Response brute:', responseText);
      console.log('Response length:', responseText.length);

      // Try to parse the JSON
      let result;
      try {
        result = JSON.parse(responseText);
        console.log('Achat créé avec succès:', result);
      } catch (jsonError) {
        console.error('Erreur de parsing JSON:', jsonError);
        console.error('Position de l\'erreur:', jsonError.message);
        console.error('Extrait autour de la position 20449:', responseText.substring(20440, 20460));
        throw new Error('La réponse du serveur contient du JSON invalide');
      }

      setSuccess(true);

      // Reset form after 2 seconds
      setTimeout(() => {
        setFormData({
          dateEffective: new Date().toISOString().split('T')[0],
          lignes: []
        });
        setSuccess(false);
        // Option: rediriger vers la liste des achats
        // window.location.href = '/achats';
      }, 2000);

    } catch (error) {
      console.error('Error:', error);
      setError(`Erreur lors de la création de l'achat: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Get selected article details
  const getSelectedArticle = () => {
    if (!currentLigne.articleId) return null;
    return articles.find(a => a.id === parseInt(currentLigne.articleId));
  };

  const selectedArticle = getSelectedArticle();

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg">
              <ShoppingCartIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Nouvel Achat</h1>
              <p className="text-gray-600">Créez une nouvelle demande d'achat</p>
            </div>
          </div>
        </div>

        {/* Messages d'erreur/succès */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <ExclamationCircleIcon className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center">
              <CheckIcon className="w-5 h-5 text-emerald-600 mr-2" />
              <p className="text-emerald-700">Achat créé avec succès ! Redirection...</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Achat Info */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 h-full">
                <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-200 flex items-center">
                  <DocumentTextIcon className="w-5 h-5 mr-2 text-emerald-600" />
                  Informations Achat
                </h2>

                <div className="space-y-4">
                  {/* Date Effective */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      Date effective *
                    </label>
                    <input
                      type="date"
                      name="dateEffective"
                      value={formData.dateEffective}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Date prévue pour la réception ({formatDate(formData.dateEffective)})
                    </p>
                  </div>

                  {/* Summary Info */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Nombre d'articles :</span>
                        <span className="font-medium text-gray-900">{formData.lignes.length}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Quantité totale :</span>
                        <span className="font-medium text-gray-900">
                          {formData.lignes.reduce((total, ligne) => total + ligne.quantite, 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Total Estimé */}
                  <div className="pt-4 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <CurrencyEuroIcon className="w-4 h-4 mr-1" />
                      Total estimé
                    </label>
                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                      <div className="text-2xl font-bold text-emerald-600">
                        {calculerTotalEstime()} €
                      </div>
                      <p className="text-sm text-emerald-500 mt-1">
                        Estimation du coût total
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Lignes d'achat */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-200 flex items-center">
                  <ArchiveBoxIcon className="w-5 h-5 mr-2 text-emerald-600" />
                  Articles à commander
                </h2>

                {/* Add Line Form */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-4">Ajouter un article</h3>

                  {/* Article Search */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rechercher un article *
                    </label>
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Rechercher par nom, référence..."
                        value={searchArticle}
                        onChange={(e) => setSearchArticle(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Article Select */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sélectionner un article *
                    </label>
                    <select
                      name="articleId"
                      value={currentLigne.articleId}
                      onChange={handleLigneChange}

                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    >
                      <option value="">Sélectionner un article dans la liste...</option>
                      {Array.isArray(filteredArticles) && filteredArticles.map(article => (
                        <option key={article.id} value={article.id}>
                          {article.refe} - {article.articleNom}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Article Details Preview */}
                  {selectedArticle && (
                    <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-2">
                          <h4 className="font-medium text-gray-900">{selectedArticle.articleNom}</h4>
                          <p className="text-sm text-gray-600">{selectedArticle.refe}</p>
                          {selectedArticle.description && (
                            <p className="text-sm text-gray-500 mt-1">{selectedArticle.description}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div>
                            <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                              {selectedArticle.categorie?.categorieName}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">
                              Unité : {selectedArticle.unite?.abreviation}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quantity and Price */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantité *
                      </label>
                      <div className="relative">
                        {selectedArticle?.unite?.abreviation && (
                          <span className="absolute right-3 top-3 text-gray-500">
                            {selectedArticle.unite.abreviation}
                          </span>
                        )}
                        <input
                          type="number"
                          name="quantite"
                          value={currentLigne.quantite}
                          onChange={handleLigneChange}
                          step="0.01"
                          min="0.01"

                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prix unitaire estimé *
                      </label>
                      <div className="relative">
                        <CurrencyEuroIcon className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                        <input
                          type="number"
                          name="prixUnitaireEstime"
                          value={currentLigne.prixUnitaireEstime}
                          onChange={handleLigneChange}
                          step="0.01"
                          min="0.01"

                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Add Line Button */}
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={ajouterLigne}
                      disabled={!currentLigne.articleId || !currentLigne.quantite || !currentLigne.prixUnitaireEstime}
                      className={`w-full px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 ${currentLigne.articleId && currentLigne.quantite && currentLigne.prixUnitaireEstime
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:opacity-90 hover:shadow-lg'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        } transition-all`}
                    >
                      <PlusIcon className="w-5 h-5" />
                      <span>Ajouter l'article</span>
                    </button>
                  </div>
                </div>

                {/* Lignes Table */}
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
                            Prix estimé
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total estimé
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {formData.lignes.map((ligne, index) => (
                          <tr key={ligne.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div>
                                <div className="font-medium text-gray-900">{ligne.article.articleNom}</div>
                                <div className="text-sm text-gray-500">{ligne.article.refe}</div>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
                                    {ligne.article.categorie?.categorieName}
                                  </span>
                                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
                                    {ligne.article.unite?.abreviation}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-gray-900">{ligne.quantite}</div>
                              <div className="text-sm text-gray-500">{ligne.article.unite?.uniteName}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-gray-900">{ligne.prixUnitaireEstime.toFixed(2)} €</div>
                              <div className="text-sm text-gray-500">unitaire</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-semibold text-emerald-600">
                                {(ligne.quantite * ligne.prixUnitaireEstime).toFixed(2)} €
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                type="button"
                                onClick={() => supprimerLigne(index)}
                                className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors"
                                title="Supprimer"
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan="3" className="px-6 py-4 text-right font-medium text-gray-700">
                            Total estimé :
                          </td>
                          <td colSpan="2" className="px-6 py-4">
                            <div className="text-xl font-bold text-emerald-600">
                              {calculerTotalEstime()} €
                            </div>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <ArchiveBoxIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucun article ajouté. Commencez par ajouter des articles ci-dessus.</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Recherchez et sélectionnez un article, puis spécifiez la quantité et le prix estimé
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              disabled={submitting}
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                if (formData.lignes.length > 0) {
                  if (window.confirm('Voulez-vous vraiment annuler ? Les données saisies seront perdues.')) {
                    window.history.back();
                  }
                } else {
                  window.history.back();
                }
              }}
            >
              <ArrowUturnLeftIcon className="w-5 h-5" />
              <span>Annuler</span>
            </button>

            <button
              type="submit"
              disabled={formData.lignes.length === 0 || submitting}
              className={`px-8 py-3 rounded-lg font-semibold transition-all flex items-center space-x-2 ${formData.lignes.length > 0 && !submitting
                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:opacity-90 hover:shadow-lg'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Création en cours...</span>
                </>
              ) : (
                <>
                  <CheckIcon className="w-5 h-5" />
                  <span>Créer l'achat</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AchatSaisie;