import { Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import ProformaAchatSaisie from "../pages/achat/ProformaAchatSaisie";

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


//achat , articele 
import ListeArticle from "../pages/article/ListeArticle";

const AppRoutes = () => {
    return (
        <Routes>

          <Route path='/' element={<Login />} />
          <Route path='/achat' element={<ProformaAchatSaisie />} />
          <Route path='/demande' element={<ProformaAchatSaisie />} />

          {/* Stock group */}
          <Route path='/stock' element={<MvtStockSaisie />} />
          <Route path='/stock/:type' element={<MvtStockSaisie />} />

          <Route path='/login' element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />          
          <Route path='/' element={<ProtectedRoute> <MainLayout /> </ProtectedRoute>}>
            <Route path="/home" element={<HomePage />} />          
            <Route path="/achats/proforma" element={<ProformaAchatSaisie />} />
            <Route path="/vente/proforma" element={<ProformaAchatSaisie />} />

            <Route path="/articles">
              <Route index element={<ListeArticle />} />
            </Route>
            <Route path="/achats">
              <Route path="saisie" element={<AchatSaisie />} />
              <Route path="demandes" element={<AchatList />} />
            </Route>

            <Route path="/stock/inventaires" element={<DemandeInventaires/>} />
            <Route path="/inventaire/mes-demandes" element={<DemandeInventaires/>} />
            <Route path="/inventaire/form/:id" element={<InventaireForm/>} />
            <Route path="/inventaire/perform/:id" element={<InventairePerform/>} />
            <Route path="/stock/dashboard" element={<DashboardRespMagasin/>} />
            <Route path="/stock/ajustements" element={<AjustementStock/>} />
            <Route path="/stock/articles-remaining" element={<ArticlesRemaining/>} />
            
          </Route>
          

        </Routes>
    )
};

export default AppRoutes;