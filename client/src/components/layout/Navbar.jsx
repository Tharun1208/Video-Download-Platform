import React, { useState } from "react";
import {
    Search,
    Bell,
    ChevronDown,
    User,
    Settings,
    LogOut
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";


function Navbar() {

    const [open, setOpen] = useState(false);

    const navigate = useNavigate();


    const logout = () => {

        localStorage.removeItem("token");

        navigate("/login");

    };



    return (

        <header className="h-16 bg-gray-950 border-b border-gray-800 flex items-center justify-between px-6">





            {/* Search */}

            <div className="flex items-center bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 w-96">


                <Search

                    size={20}

                    className="text-gray-400"

                />



                <input

                    type="text"

                    placeholder="Search videos..."

                    className="bg-transparent text-white placeholder-gray-500 outline-none px-3 w-full"

                />


            </div>







            {/* Right Section */}

            <div className="flex items-center gap-6">






                {/* Notification */}

                <Link
                    to="/notifications"
                    className="relative text-gray-300 hover:text-white"
                >

                    <Bell size={22} />

                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">

                        3

                    </span>

                </Link>






                {/* Profile */}

                <div className="relative">



                    <button

                        onClick={() => setOpen(!open)}

                        className="flex items-center gap-3 text-white"

                    >




                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold">

                            T

                        </div>






                        <div className="hidden md:block text-left">


                            <p className="font-semibold">

                                Tharun

                            </p>



                            <p className="text-xs text-gray-400">

                                Premium User

                            </p>



                        </div>





                        <ChevronDown size={18} />





                    </button>









                    {/* Dropdown */}


                    {

                        open && (


                            <div className="absolute right-0 mt-3 w-52 bg-gray-900 border border-gray-800 shadow-xl rounded-xl p-3 z-50">






                                <Link

                                    to="/profile"

                                    className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg"

                                >

                                    <User size={18} />

                                    Profile

                                </Link>







                                <Link

                                    to="/settings"

                                    className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg"

                                >

                                    <Settings size={18} />

                                    Settings

                                </Link>







                                <button

                                    onClick={logout}

                                    className="w-full flex items-center gap-3 px-3 py-2 text-red-500 hover:bg-red-950 rounded-lg"

                                >


                                    <LogOut size={18} />

                                    Logout


                                </button>






                            </div>


                        )


                    }





                </div>






            </div>






        </header>

    )

}


export default Navbar;