import { Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import ProformaAchatSaisie from "../pages/achat/ProformaAchatSaisie";

const AppRoutes = () => {
    return (
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/achat' element={<ProformaAchatSaisie />} />
            <Route path='/demande' element={<ProformaAchatSaisie />} />
          <Route />

        </Routes>
    )
};

export default AppRoutes;