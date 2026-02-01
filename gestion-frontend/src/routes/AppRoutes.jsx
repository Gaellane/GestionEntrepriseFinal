import { Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";

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

const AppRoutes = () => {
    return (
        <Routes>

          <Route path='/' element={<Login />} />
          <Route path='/achat' element={<ProformaSaisie />} />
          <Route path='/demande' element={<ProformaSaisie />} />

          {/* Stock group */}
          <Route path='/stock' element={<MvtStockSaisie />} />
          <Route path='/stock/:type' element={<MvtStockSaisie />} />

          <Route path='/login' element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />          
          <Route path='/' element={<ProtectedRoute> <MainLayout /> </ProtectedRoute>}>
            <Route path="/home" element={<HomePage />} />          
          

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

            <Route path="/stock/inventaires" element={<DemandeInventaires/>} />
            <Route path="/inventaire/mes-demandes" element={<DemandeInventaires/>} />
            <Route path="/inventaire/form/:id" element={<InventaireForm/>} />
            <Route path="/inventaire/perform/:id" element={<InventairePerform/>} />
            <Route path="/stock/dashboard" element={<DashboardRespMagasin/>} />
            <Route path="/stock/ajustements" element={<AjustementStock/>} />
            <Route path="/stock/articles-remaining" element={<ArticlesRemaining/>} />
            
            <Route path="/admin/audit-logs" element={<AuditLogs/>} />
            <Route path="/admin/roles-attribution" element={<RolesAssignment/>} />
            <Route path="/admin/roles-validation" element={<RolesValidation/>} />

        
          
          </Route>
          

        </Routes>
    )
};

export default AppRoutes;