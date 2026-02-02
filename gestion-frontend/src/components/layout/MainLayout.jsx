import { Outlet } from "react-router-dom";
import SideBar from "./SideBar";
import AIChatWidget from "../common/AIChatWidget";

const MainLayout = () => {
    return (
        <div className="flex" style={ { height:'100vh'} }>
            <SideBar />
            <div className="min-h-screen max-h-full bg-gradient-to-br from-gray-50 to-gray-100 p-6 overflow-y-scroll flex-1">
                <Outlet />
            </div>
            <AIChatWidget />
        </div>
    )
};

export default MainLayout