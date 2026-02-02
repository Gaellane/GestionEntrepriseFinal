import { useEffect, useState } from 'react';
import stockKpiApi from '../../api/stockKpiApi';
import stockApi from '../../api/stock';
import {
  CubeIcon,
  BuildingOfficeIcon,
  TagIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XCircleIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowsUpDownIcon,
  InformationCircleIcon,
  ExclamationCircleIcon,
  ChartPieIcon,
  EyeIcon,
  EyeSlashIcon,
  DocumentArrowDownIcon,
  TableCellsIcon
} from '@heroicons/react/24/outline';

function formatNumber(v) {
  if (v == null) return '-';
  return Number(v).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Composant Pie Chart amélioré
function PieChart({ data, size = 300 }) {
  const entries = Object.keys(data).map(k => ({ key: k, value: data[k] })).filter(e => e.value > 0);
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-64 h-64 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4">
          <ChartPieIcon className="w-16 h-16 text-gray-400" />
        </div>
        <p className="text-gray-500 text-center">Aucune donnée disponible<br />pour le graphique</p>
      </div>
    );
  }

  // Tri par valeur décroissante
  entries.sort((a, b) => b.value - a.value);
  
  // Garder les 6 plus grandes catégories et regrouper les autres
  const topCategories = entries.slice(0, 6);
  const otherCategories = entries.slice(6);
  
  const otherValue = otherCategories.reduce((sum, item) => sum + item.value, 0);
  if (otherValue > 0) {
    topCategories.push({ key: 'Autres', value: otherValue });
  }

  const totalValue = topCategories.reduce((sum, item) => sum + item.value, 0);
  
  // Palette de couleurs modernes
  const colors = [
    '#10B981', // Émeraude
    '#3B82F6', // Bleu
    '#F59E0B', // Ambre
    '#EF4444', // Rouge
    '#8B5CF6', // Violet
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#84CC16', // Lime
    '#6366F1', // Indigo
    '#EC4899', // Rose
  ];

  let angle = -90; // Commence en haut
  const r = size / 2;
  const cx = r;
  const cy = r;
  const strokeWidth = 2;

  const paths = topCategories.map((item, i) => {
    const percentage = (item.value / totalValue) * 100;
    const angleDelta = (item.value / totalValue) * 360;
    const start = angle;
    const end = angle + angleDelta;
    const large = angleDelta > 180 ? 1 : 0;

    const rad = (a) => (Math.PI * a) / 180;
    const x1 = cx + r * Math.cos(rad(start));
    const y1 = cy + r * Math.sin(rad(start));
    const x2 = cx + r * Math.cos(rad(end));
    const y2 = cy + r * Math.sin(rad(end));

    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    angle = end;

    return {
      d,
      color: colors[i % colors.length],
      key: item.key,
      value: item.value,
      percentage,
      startAngle: start,
      endAngle: end,
    };
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-center mb-4">
        <div className="relative">
          <svg width={size} height={size} className="block">
            {paths.map((p, i) => (
              <g key={i}>
                <path
                  d={p.d}
                  fill={p.color}
                  stroke="#FFFFFF"
                  strokeWidth={strokeWidth}
                  className="transition-all duration-300 hover:opacity-90 cursor-pointer"
                />
                {/* Effet de survol */}
                <path
                  d={p.d}
                  fill="transparent"
                  stroke="transparent"
                  strokeWidth={strokeWidth * 6}
                  className="cursor-pointer hover:stroke-gray-200"
                />
              </g>
            ))}
            {/* Centre du donut */}
            <circle cx={cx} cy={cy} r={r * 0.4} fill="white" />
            <text
              x={cx}
              y={cy - 10}
              textAnchor="middle"
              className="text-2xl font-bold fill-gray-800"
            >
              {totalValue.toLocaleString()}
            </text>
            <text
              x={cx}
              y={cy + 15}
              textAnchor="middle"
              className="text-sm fill-gray-600"
            >
              Total
            </text>
          </svg>
        </div>
      </div>

      {/* Légende détaillée */}
      <div className="mt-6 space-y-2">
        {paths.map((p, i) => (
          <div key={i} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: p.color }}
              ></div>
              <div>
                <span className="font-medium text-gray-700">{p.key}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ 
                        width: `${p.percentage}%`,
                        backgroundColor: p.color
                      }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 w-12 text-right">
                    {p.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-800">{p.value.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ArticlesRemaining() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [list, setList] = useState([]);
  const [depots, setDepots] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ depotId: '', categoryId: '', search: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'quantiteRestante', direction: 'desc' });
  const [stats, setStats] = useState({ totalArticles: 0, totalQuantity: 0, averageQuantity: 0 });
  const [showChart, setShowChart] = useState(true);

  useEffect(() => {
    loadFormOptions();
    fetchList();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [list]);

  const loadFormOptions = async () => {
    try {
      const depRes = await stockApi.getFormData();
      const depData = depRes && (depRes.data || depRes.payload || depRes);
      setDepots(depData && depData.depots ? depData.depots : (depRes.depots || []));
    } catch (e) {
      console.error('Failed load depots', e);
    }
    try {
      const catRes = await stockKpiApi.getCategories();
      const catData = catRes && catRes.data ? catRes.data : catRes;
      setCategories(Array.isArray(catData) ? catData : []);
    } catch (e) {
      console.error('Failed load categories', e);
    }
  };

  const fetchList = async (customFilters = filters) => {
    setLoading(true);
    setError(null);
    try {
      const res = await stockKpiApi.getArticlesRemaining(customFilters);
      const data = res && res.data ? res.data : res;
      const sortedData = Array.isArray(data) ? sortData(data, sortConfig) : [];
      setList(sortedData);
    } catch (e) {
      setError(e.message || String(e));
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (list.length === 0) {
      setStats({ totalArticles: 0, totalQuantity: 0, averageQuantity: 0 });
      return;
    }

    const totalQuantity = list.reduce((sum, item) => {
      return sum + (parseFloat(item.quantiteRestante) || 0);
    }, 0);

    const averageQuantity = totalQuantity / list.length;

    setStats({
      totalArticles: list.length,
      totalQuantity,
      averageQuantity
    });
  };

  const handleFilterChange = (field, value) => {
    const updated = { ...filters, [field]: value };
    setFilters(updated);
    fetchList(updated);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    const updated = { ...filters, search: value };
    setFilters(updated);
    if (value.length === 0 || value.length > 2) {
      fetchList(updated);
    }
  };

  const clearFilters = () => {
    const cleared = { depotId: '', categoryId: '', search: '' };
    setFilters(cleared);
    fetchList(cleared);
  };

  const sortData = (data, config) => {
    return [...data].sort((a, b) => {
      let aVal = a[config.key];
      let bVal = b[config.key];

      if (config.key === 'quantiteRestante') {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      }

      if (aVal < bVal) return config.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return config.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    const config = { key, direction };
    setSortConfig(config);
    const sorted = sortData(list, config);
    setList(sorted);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowsUpDownIcon className="w-4 h-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUpIcon className="w-4 h-4 text-indigo-600" />
      : <ChevronDownIcon className="w-4 h-4 text-indigo-600" />;
  };

  const getQuantityColor = (quantity) => {
    const qty = parseFloat(quantity) || 0;
    if (qty === 0) return 'text-red-500 bg-red-50';
    if (qty < 10) return 'text-amber-500 bg-amber-50';
    return 'text-emerald-500 bg-emerald-50';
  };

  const getQuantityBadge = (quantity) => {
    const qty = parseFloat(quantity) || 0;
    let status = '';
    
    if (qty === 0) status = 'Épuisé';
    else if (qty < 5) status = 'Faible';
    else if (qty < 20) status = 'Moyen';
    else status = 'Bon';
    
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${getQuantityColor(quantity)}`}>
        {status}
      </span>
    );
  };

  // Fonctions d'export
  const exportToPDF = () => {
    const element = document.createElement('a');
    const content = generatePDFContent();
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    element.href = url;
    element.download = `niveaux-stock-${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(url);
  };

  const generatePDFContent = () => {
    const currentDate = new Date().toLocaleDateString('fr-FR');
    const filteredStats = {
      depot: depots.find(d => d.id === parseInt(filters.depotId))?.depotName || 'Tous les dépôts',
      category: categories.find(c => c.id === parseInt(filters.categoryId))?.categorieName || 'Toutes les catégories',
      search: filters.search || 'Aucun filtre de recherche'
    };

    let tableRows = list.map((item, index) => `
      <tr style="${index % 2 === 0 ? 'background-color: #f9fafb;' : ''}">
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.articleNom || `Article ${item.articleId}`}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.articleRef || '-'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.categoryName || '-'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">${formatNumber(item.quantiteRestante)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
          <span style="padding: 4px 8px; border-radius: 12px; font-size: 12px; ${
            parseFloat(item.quantiteRestante) === 0 ? 'background-color: #fef2f2; color: #dc2626;' :
            parseFloat(item.quantiteRestante) < 10 ? 'background-color: #fef3c7; color: #d97706;' :
            'background-color: #ecfdf5; color: #059669;'
          }">
            ${
              parseFloat(item.quantiteRestante) === 0 ? 'Épuisé' :
              parseFloat(item.quantiteRestante) < 5 ? 'Faible' :
              parseFloat(item.quantiteRestante) < 20 ? 'Moyen' : 'Bon'
            }
          </span>
        </td>
      </tr>`).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Niveaux de Stock - ${currentDate}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #374151; }
        .header { border-bottom: 3px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; }
        .title { color: #1f2937; font-size: 28px; font-weight: bold; margin: 0; }
        .subtitle { color: #6b7280; font-size: 16px; margin-top: 5px; }
        .filters { background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; text-align: center; }
        .stat-value { font-size: 24px; font-weight: bold; color: #4f46e5; }
        .stat-label { color: #6b7280; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background-color: #4f46e5; color: white; padding: 12px 8px; text-align: left; font-weight: 600; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="title">📊 Niveaux de Stock</h1>
        <p class="subtitle">Rapport généré le ${currentDate}</p>
      </div>
      
      <div class="filters">
        <h3>Filtres appliqués:</h3>
        <p><strong>Dépôt:</strong> ${filteredStats.depot}</p>
        <p><strong>Catégorie:</strong> ${filteredStats.category}</p>
        <p><strong>Recherche:</strong> ${filteredStats.search}</p>
      </div>

      <div class="stats">
        <div class="stat-card">
          <div class="stat-value">${stats.totalArticles}</div>
          <div class="stat-label">Articles total</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${formatNumber(stats.totalQuantity)}</div>
          <div class="stat-label">Quantité totale</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${formatNumber(stats.averageQuantity)}</div>
          <div class="stat-label">Moyenne par article</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Article</th>
            <th>Référence</th>
            <th>Catégorie</th>
            <th style="text-align: right;">Quantité</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>

      <div class="footer">
        <p>Rapport généré automatiquement - ${list.length} articles listés</p>
      </div>
    </body>
    </html>`;
  };

  const exportToExcel = () => {
    // Export Excel (CSV) — uniquement le tableau de liste
    if (!list || list.length === 0) {
      alert('Aucune donnée à exporter');
      return;
    }

    const headers = ['Article', 'Référence', 'Catégorie', 'Quantité Restante', 'Statut'];
    const rows = list.map(item => {
      const statut = parseFloat(item.quantiteRestante) === 0 ? 'Épuisé' :
        parseFloat(item.quantiteRestante) < 5 ? 'Faible' :
        parseFloat(item.quantiteRestante) < 20 ? 'Moyen' : 'Bon';

      return [
        item.articleNom || `Article ${item.articleId}`,
        item.articleRef || '-',
        item.categoryName || '-',
        (parseFloat(item.quantiteRestante) || 0).toString(),
        statut
      ];
    });

    const csvArray = [headers, ...rows];
    const csvContent = csvArray.map(row => row.map(cell => {
      const cellStr = String(cell || '');
      return cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')
        ? `"${cellStr.replace(/"/g, '""')}"`
        : cellStr;
    }).join(',')).join('\n');

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `niveaux-stock-table-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Agrégation pour le pie chart
  const aggregation = {};
  list.forEach(row => {
    const cat = row.categoryName || 'Non catégorisé';
    const qty = Number(row.quantiteRestante || 0);
    aggregation[cat] = (aggregation[cat] || 0) + qty;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <CubeIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Niveaux de Stock</h1>
                <p className="text-gray-600 mt-1">Analyse des quantités restantes par article et catégorie</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Boutons d'export */}
              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg transform hover:scale-105"
                title="Exporter en PDF"
              >
                <DocumentArrowDownIcon className="w-5 h-5" />
                PDF
              </button>
              
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg transform hover:scale-105"
                title="Exporter en Excel"
              >
                <TableCellsIcon className="w-5 h-5" />
                Excel
              </button>
              
              <button
                onClick={() => setShowChart(!showChart)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {showChart ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                {showChart ? 'Masquer graphique' : 'Afficher graphique'}
              </button>
            </div>
          </div>

          {/* Cartes de statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total articles</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalArticles}</p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <CubeIcon className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Quantité totale</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">
                    {formatNumber(stats.totalQuantity)}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <ChartBarIcon className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Moyenne par article</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {formatNumber(stats.averageQuantity)}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <ChartBarIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FunnelIcon className="w-5 h-5" />
              Filtres
            </h2>
            {(filters.depotId || filters.categoryId || filters.search) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <XCircleIcon className="w-4 h-4" />
                Réinitialiser
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Recherche */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MagnifyingGlassIcon className="w-4 h-4" />
                Recherche
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.search}
                  onChange={handleSearchChange}
                  placeholder="Nom ou référence..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Dépôt */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <BuildingOfficeIcon className="w-4 h-4" />
                Dépôt
              </label>
              <select
                value={filters.depotId}
                onChange={e => handleFilterChange('depotId', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
              >
                <option value="">Tous les dépôts</option>
                {depots.map(d => (
                  <option key={d.id} value={d.id}>{d.depotName}</option>
                ))}
              </select>
            </div>

            {/* Catégorie */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <TagIcon className="w-4 h-4" />
                Catégorie
              </label>
              <select
                value={filters.categoryId}
                onChange={e => handleFilterChange('categoryId', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
              >
                <option value="">Toutes les catégories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.categorieName}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Contenu principal avec graphique */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tableau - 2/3 de l'espace */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden h-full">
              {/* En-tête du tableau */}
              <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-lg font-semibold text-gray-800">Liste des articles</h2>
              </div>

              {/* États de chargement et erreur */}
              {loading && (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-3"></div>
                  <p className="text-gray-600">Chargement des données...</p>
                </div>
              )}

              {error && (
                <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-2 text-red-700 mb-2">
                    <ExclamationCircleIcon className="w-5 h-5" />
                    <p className="font-medium">Erreur</p>
                  </div>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Contenu du tableau */}
              {!loading && !error && (
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('articleNom')}
                        >
                          <div className="flex items-center gap-1">
                            Article
                            {getSortIcon('articleNom')}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                        >
                          Référence
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                        >
                          Catégorie
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('quantiteRestante')}
                        >
                          <div className="flex items-center gap-1">
                            Quantité restante
                            {getSortIcon('quantiteRestante')}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                        >
                          Statut
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {list.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center justify-center text-gray-400">
                              <CubeIcon className="w-12 h-12 mb-3" />
                              <p className="text-lg font-medium text-gray-500">Aucun article trouvé</p>
                              <p className="text-sm mt-1">Ajustez vos filtres pour afficher les résultats</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        list.map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                  <CubeIcon className="w-4 h-4 text-gray-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{row.articleNom || `Article ${row.articleId}`}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {row.articleRef || '-'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <TagIcon className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-700">{row.categoryName || '-'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span className={`text-lg font-bold ${getQuantityColor(row.quantiteRestante).split(' ')[0]}`}>
                                  {formatNumber(row.quantiteRestante)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getQuantityBadge(row.quantiteRestante)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pied de tableau */}
              {!loading && !error && list.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <p>Affichage de {list.length} article{list.length > 1 ? 's' : ''}</p>
                    <p>Quantité totale: <span className="font-semibold text-emerald-600">{formatNumber(stats.totalQuantity)}</span></p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Graphique - 1/3 de l'espace */}
          {showChart && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 h-full">
                <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <ChartPieIcon className="w-5 h-5" />
                      Répartition par catégorie
                    </h2>
                    <span className="text-sm text-gray-500">
                      {Object.keys(aggregation).length} catégorie{Object.keys(aggregation).length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <PieChart data={aggregation} size={250} />
                  
                  {/* Informations supplémentaires */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Quantité totale:</span>
                        <span className="font-semibold text-gray-800">{formatNumber(stats.totalQuantity)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Articles avec stock:</span>
                        <span className="font-semibold text-gray-800">
                          {list.filter(item => (parseFloat(item.quantiteRestante) || 0) > 0).length} / {list.length}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 pt-2">
                        Cliquez sur le graphique pour plus de détails
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Informations générales */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Légende des statuts</h3>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-sm text-gray-600">Bon stock (  20 et plus)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span className="text-sm text-gray-600">Stock moyen (5-20)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="text-sm text-gray-600">Stock faible ( moins de 5)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gray-300"></span>
                <span className="text-sm text-gray-600">Épuisé (0)</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Informations</h3>
            <p className="text-sm text-gray-600">
              Les données sont actualisées en temps réel. Utilisez les filtres pour affiner votre recherche et visualiser la répartition du stock par catégorie.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}