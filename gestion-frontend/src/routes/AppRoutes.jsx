import { Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import ProformaAchatSaisie from "../pages/achat/ProformaAchatSaisie";
import Stock from "../pages/stock/Stock";

const AppRoutes = () => {
    return (
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/achat' element={<ProformaAchatSaisie />} />
          <Route path='/demande' element={<ProformaAchatSaisie />} />

          {/* Stock group */}
          <Route path='/stock' element={<Stock />} />

        </Routes>
    )
};

export default AppRoutes;