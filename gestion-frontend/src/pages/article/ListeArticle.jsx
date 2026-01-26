import React, { useEffect, useState } from 'react';
import { getArticles } from '../../api/articleApi';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArchiveBoxIcon,
  EyeIcon,
  DocumentTextIcon,
  ChevronUpDownIcon,
  ArrowPathIcon,
  QuestionMarkCircleIcon,
  TagIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';

const ListeArticle = () => {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Fetch articles
  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await getArticles();
      const data = await response.json();
      console.log('Articles récupérés:', data); // Pour debugging
      setArticles(data || []);
      setFilteredArticles(data || []);
    } catch (err) {
      setError('Erreur lors du chargement des articles');
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // Handle search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredArticles(articles);
    } else {
      const filtered = articles.filter(article =>
        article.articleNom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.refe?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.categorie?.categorieName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.unite?.uniteName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredArticles(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, articles]);

  // Handle sort
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    const sorted = [...filteredArticles].sort((a, b) => {
      let aValue, bValue;
      
      // Handle nested object sorting (categorie, unite)
      if (key.includes('.')) {
        const [parent, child] = key.split('.');
        aValue = a[parent]?.[child];
        bValue = b[parent]?.[child];
      } else {
        aValue = a[key];
        bValue = b[key];
      }
      
      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredArticles(sorted);
    setSortConfig({ key, direction });
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredArticles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);

  // Stats
  const totalArticles = articles.length;
  const showingArticles = filteredArticles.length;

  // Format valorisation pour affichage
  const getValorisationBadge = (valorisation) => {
    const colors = {
      'FIFO': 'bg-blue-100 text-blue-800',
      'LIFO': 'bg-purple-100 text-purple-800',
      'CMUP': 'bg-green-100 text-green-800',
      'Standard': 'bg-gray-100 text-gray-800'
    };
    
    const colorClass = colors[valorisation] || 'bg-gray-100 text-gray-800';
    return (
      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
        {valorisation}
      </span>
    );
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
            <QuestionMarkCircleIcon className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Erreur</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchArticles}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center mx-auto"
          >
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg">
                <ArchiveBoxIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Liste des Articles</h1>
                <p className="text-gray-600">
                  {totalArticles} articles au total • {showingArticles} correspondants
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={fetchArticles}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              >
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Actualiser
              </button>

              <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg hover:opacity-90 transition-all flex items-center">
                <PlusIcon className="w-4 h-4 mr-2" />
                Nouvel Article
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, référence, catégorie, unité..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center w-full">
                <FunnelIcon className="w-4 h-4 mr-2" />
                Filtres
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {currentItems.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        onClick={() => handleSort('refe')}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                      >
                        <div className="flex items-center space-x-1">
                          <DocumentTextIcon className="w-4 h-4" />
                          <span>Référence</span>
                          <ChevronUpDownIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('articleNom')}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                      >
                        <div className="flex items-center space-x-1">
                          <span>Nom de l'article</span>
                          <ChevronUpDownIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th
                        onClick={() => handleSort('categorie.categorieName')}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                      >
                        <div className="flex items-center space-x-1">
                          <TagIcon className="w-4 h-4" />
                          <span>Catégorie</span>
                          <ChevronUpDownIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('unite.uniteName')}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                      >
                        <div className="flex items-center space-x-1">
                          <ScaleIcon className="w-4 h-4" />
                          <span>Unité</span>
                          <ChevronUpDownIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valorisation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.map((article) => (
                      <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="p-2 bg-emerald-50 rounded-lg mr-3">
                              <DocumentTextIcon className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                              <span className="font-semibold text-gray-900">{article.refe}</span>
                              <p className="text-xs text-gray-500">ID: {article.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900">{article.articleNom}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-600 line-clamp-2 max-w-xs">
                            {article.description || 'Aucune description'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {article.categorie ? (
                            <div className="flex items-center space-x-2">
                              <div className="p-1 bg-blue-50 rounded">
                                <TagIcon className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <span className="text-sm text-gray-900">{article.categorie.categorieName}</span>
                                {article.categorie.description && (
                                  <p className="text-xs text-gray-500 truncate max-w-[150px]">
                                    {article.categorie.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Non catégorisé</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {article.unite ? (
                            <div className="flex items-center space-x-2">
                              <div className="p-1 bg-purple-50 rounded">
                                <ScaleIcon className="w-4 h-4 text-purple-600" />
                              </div>
                              <div>
                                <span className="text-sm text-gray-900">{article.unite.uniteName}</span>
                                <p className="text-xs text-gray-500">{article.unite.abreviation}</p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Aucune unité</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {getValorisationBadge(article.valorisation)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button
                              title="Voir les détails"
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            >
                              <EyeIcon className="w-5 h-5" />
                            </button>
                            <button
                              title="Modifier"
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                              title="Supprimer"
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="border-t border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Affichage de <span className="font-semibold">{indexOfFirstItem + 1}</span> à{' '}
                      <span className="font-semibold">
                        {Math.min(indexOfLastItem, filteredArticles.length)}
                      </span>{' '}
                      sur <span className="font-semibold">{filteredArticles.length}</span> articles
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-2 rounded-lg border ${
                          currentPage === 1
                            ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Précédent
                      </button>
                      
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-10 h-10 rounded-lg ${
                            currentPage === i + 1
                              ? 'bg-emerald-600 text-white'
                              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-2 rounded-lg border ${
                          currentPage === totalPages
                            ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Suivant
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <ArchiveBoxIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucun article trouvé</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {searchTerm ? 'Aucun article ne correspond à votre recherche.' : 'Commencez par ajouter votre premier article.'}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-4 px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  Réinitialiser la recherche
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListeArticle;