import { Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import ProformaAchatSaisie from "../pages/achat/ProformaAchatSaisie";
import ClientList from "../pages/vente/ClientList";
import ClientForm from "../pages/vente/ClientForm";
import ClientDetail from "../pages/vente/ClientDetail";
import TarificationList from "../pages/vente/TarificationList";
import TarificationHistorique from "../pages/vente/TarificationHistorique";
import ProformaVenteList from "../pages/vente/ProformaVenteList";
import ProformaVenteForm from "../pages/vente/ProformaVenteForm";
import ProformaVenteDetail from "../pages/vente/ProformaVenteDetail";
import VenteList from "../pages/vente/VenteList";
import VenteForm from "../pages/vente/VenteForm";
import VenteDetail from "../pages/vente/VenteDetail";
import ConfigurationList from "../pages/configuration/ConfigurationList";

import MvtStockSaisie from "../pages/stock/MvtStockSaisie";
import ProtectedRoute from "./ProtectedRoutes";
import MainLayout from "../components/layout/MainLayout";
import Unauthorized from "../pages/auth/Unauthorized";
import HomePage from "../pages/HomePage";
import DemandeInventaires from "../pages/inventaire/DemandeInventaires";
import InventaireForm from "../pages/inventaire/InventaireForm";
import InventairePerform from "../pages/inventaire/InventairePerform";
import DashboardRespMagasin from "../pages/stock/DashboardRespMagasin";
import AjustementStock from "../pages/stock/AjustementStock";
import ArticlesRemaining from "../pages/stock/ArticlesRemaining";
import AchatSaisie from "../pages/achat/AchatSaisie";
import AchatList from "../pages/achat/AchatList";
import AchatFiche from "../pages/achat/AchatFiche";
import AuditLogs from "../pages/admin/AuditLogs";
import RolesAssignment from "../pages/admin/RolesAssignment";
import RolesValidation from "../pages/admin/RolesValidation";
import DemandeProforma from "../pages/achat/DemandeProforma";
import ProformaSaisie from "../pages/achat/ProformaSaisie";
import LivraisonSaisie from "../pages/achat/LivraisonSaisie";
import ReceptionSaisie from "../pages/achat/ReceptionSaisie";
import AchatKpiDashboard from "../pages/achat/AchatKpiDashboard";

import { TruckIcon } from "@heroicons/react/24/solid";
//achat , articele 
import ListeArticle from "../pages/article/ListeArticle";

// Livraison
import LivraisonList from "../pages/livraison/LivraisonList";
import LivraisonForm from "../pages/livraison/LivraisonForm";
import LivraisonDetail from "../pages/livraison/LivraisonDetail";

// Reporting / KPI
import DashboardKpi from "../pages/kpi/DashboardKpi";
import ExportVentes from "../pages/kpi/ExportVentes";

// Caisse
import CaisseMouvementGeneralForm from "../pages/caisse/CaisseMouvementGeneralForm";
import EncaissementVenteForm from "../pages/caisse/EncaissementVenteForm";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path='/login' element={<Login />} />
      <Route path="/" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* Routes non protégées pour le stock (legacy) */}
      <Route path='/achat' element={<ProformaAchatSaisie />} />
      <Route path='/demande' element={<ProformaAchatSaisie />} />
      <Route path='/stock' element={<MvtStockSaisie />} />
      <Route path='/stock/:type' element={<MvtStockSaisie />} />

      {/* Routes protégées */}
      <Route path='/' element={<ProtectedRoute> <MainLayout /> </ProtectedRoute>}>
        {/* Accueil */}
        <Route path="/home" element={<HomePage />} />
        
        {/* Articles */}
        <Route path="/articles" element={<ListeArticle />} />
        
        {/* Achats */}
        <Route path="/achats/saisie" element={<AchatSaisie />} />
        <Route path="/achats/demandes" element={<AchatList />} />
        <Route path="/achats/proforma" element={<ProformaAchatSaisie />} />
        <Route path="/achats/fiche/:id" element={<AchatFiche />} />

        {/* Ventes et Clients */}
        <Route path="/clients" element={<ClientList />} />
        <Route path="/clients/create" element={<ClientForm />} />
        <Route path="/clients/edit/:id" element={<ClientForm />} />
        <Route path="/clients/:id" element={<ClientDetail />} />

        {/* Tarification */}
        <Route path="/tarification" element={<TarificationList />} />
        <Route path="/tarification/historique/:articleEntityId" element={<TarificationHistorique />} />

        {/* Pro-formas de vente */}
        <Route path="/proforma-ventes" element={<ProformaVenteList />} />
        <Route path="/proforma-ventes/nouveau" element={<ProformaVenteForm />} />
        <Route path="/proforma-ventes/:id" element={<ProformaVenteDetail />} />
        <Route path="/proforma-ventes/:id/modifier" element={<ProformaVenteForm />} />
        <Route path="/vente/proforma" element={<ProformaAchatSaisie />} />

        {/* Commandes clients (ventes) */}
        <Route path="/ventes" element={<VenteList />} />
        <Route path="/ventes/nouveau" element={<VenteForm />} />
        <Route path="/ventes/nouveau/transformation" element={<VenteForm />} />
        <Route path="/ventes/from-proforma/:proformaId" element={<VenteForm />} />
        <Route path="/ventes/:id" element={<VenteDetail />} />
        <Route path="/ventes/:id/modifier" element={<VenteForm />} />

        {/* Livraisons */}
        <Route path="/livraison/liste" element={<LivraisonList />} />
        <Route path="/livraison/enregistrement" element={<LivraisonForm />} />
        <Route path="/livraison/:id" element={<LivraisonDetail />} />

        {/* Caisse */}
        <Route path="/caisse/mouvements/creer" element={<CaisseMouvementGeneralForm />} />
        <Route path="/caisse/mouvements/encaisser" element={<EncaissementVenteForm />} />

        {/* Reporting / KPI */}
        <Route path="/reporting/dashboard" element={<DashboardKpi />} />
        <Route path="/reporting/export" element={<ExportVentes />} />

        {/* Stock et Inventaire */}
        <Route path="/stock/dashboard" element={<DashboardRespMagasin/>} />
        <Route path="/stock/ajustements" element={<AjustementStock/>} />
        <Route path="/stock/articles-remaining" element={<ArticlesRemaining/>} />
        <Route path="/stock/inventaires" element={<DemandeInventaires/>} />
        <Route path="/stock/1" element={<MvtStockSaisie />} />
        <Route path="/stock/2" element={<MvtStockSaisie />} />
        <Route path="/stock/transfer" element={<MvtStockSaisie />} />

        {/* Inventaire */}
        <Route path="/inventaire/mes-demandes" element={<DemandeInventaires/>} />
        <Route path="/inventaire/form/new" element={<InventaireForm/>} />
        <Route path="/inventaire/form/:id" element={<InventaireForm/>} />
        <Route path="/inventaire/perform/:id" element={<InventairePerform/>} />

        {/* Configuration */}
        <Route path="/configurations" element={<ConfigurationList />} />

        {/* Administration */}
        <Route path="/admin/audit-logs" element={<AuditLogs/>} />
        <Route path="/admin/roles-attribution" element={<RolesAssignment/>} />
        <Route path="/admin/roles-validation" element={<RolesValidation/>} />
        
        <Route path="/articles">
          <Route index element={<ListeArticle />} />
        </Route>
        <Route path="/achats">
          <Route path="saisie" element={<AchatSaisie />} />
          <Route path="demandes" element={<AchatList />} />
          <Route path="fiche/:id" element={<AchatFiche />} />
          <Route path="commande/saisie/:id" element={<DemandeProforma />} />
          <Route path="proforma/saisie/:achatId/:fournisseurId" element={<ProformaSaisie />} />
          <Route path="livraison/saisie/:achatId" element={<LivraisonSaisie />} />
          <Route path="livraison/reception/:achatId" element={<ReceptionSaisie />} />
          <Route path="kpi" element={<AchatKpiDashboard />} />
        </Route>

      </Route>
    </Routes>
  )
};

export default AppRoutes;