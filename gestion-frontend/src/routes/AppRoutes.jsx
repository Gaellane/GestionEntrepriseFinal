import { Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import ProformaAchatSaisie from "../pages/achat/ProformaAchatSaisie";
import ProtectedRoute from "./ProtectedRoutes";
import MainLayout from "../components/layout/MainLayout";
import Unauthorized from "../pages/auth/Unauthorized";
import HomePage from "../pages/HomePage";


//achat , articele 
import ListeArticle from "../pages/article/ListeArticle";

const AppRoutes = () => {
    return (
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />          
          <Route path='/' element={<ProtectedRoute> <MainLayout /> </ProtectedRoute>}>
            <Route path="/home" element={<HomePage />} />          
            <Route path="/achats/proforma" element={<ProformaAchatSaisie />} />
            <Route path="/vente/proforma" element={<ProformaAchatSaisie />} />
            <Route path="/articles">
              <Route index element={<ListeArticle />} />
            </Route>
          </Route>
          

        </Routes>
    )
};

export default AppRoutes;