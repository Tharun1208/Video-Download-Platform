import React from "react";
import Sidebar from "./Sidebar.jsx";
import Navbar from "./Navbar.jsx";
import { Outlet } from "react-router-dom";


function DashboardLayout() {


    return (

        <div className="flex min-h-screen bg-gray-950 text-white">



            {/* Sidebar */}

            <Sidebar />





            {/* Main Content */}

            <div className="flex-1">





                {/* Navbar */}

                <Navbar />







                {/* Page Content */}

                <main className="p-6 bg-gray-950 min-h-screen">


                    <Outlet />


                </main>





            </div>





        </div>

    )

}


export default DashboardLayout;