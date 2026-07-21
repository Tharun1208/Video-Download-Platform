import React, { useState } from "react";
import { Download, X, Crown } from "lucide-react";


function DownloadButton({ video }) {


    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");


    // Temporary user details
    const userPlan = "Free";
    const downloadsToday = 1;



    const handleDownload = () => {


        if (userPlan === "Free" && downloadsToday >= 1) {


            setMessage(
                "Daily download limit reached. Upgrade to Premium for more downloads."
            );


            setShowPopup(true);

            return;

        }



        setMessage(
            "Your download has started successfully."
        );


        setShowPopup(true);


    };




    return (

        <>


            <button

                onClick={handleDownload}

                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg transition"

            >


                <Download size={20} />


                Download


            </button>







            {
                showPopup &&


                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">





                    <div className="bg-gray-900 border border-gray-800 text-white rounded-2xl p-6 w-96 shadow-xl">





                        <div className="flex justify-between items-center">



                            <h2 className="text-xl font-bold">

                                Download Status

                            </h2>





                            <button

                                onClick={() => setShowPopup(false)}

                                className="text-gray-400 hover:text-white"

                            >


                                <X size={22} />


                            </button>



                        </div>







                        <div className="mt-5 text-gray-300">


                            {

                                message.includes("Upgrade")

                                &&

                                <div className="flex items-center gap-2 text-yellow-400 mb-3">

                                    <Crown size={18} />

                                    Premium Required

                                </div>

                            }



                            <p>

                                {message}

                            </p>


                        </div>







                        <button

                            onClick={() => setShowPopup(false)}

                            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition"

                        >


                            OK


                        </button>






                    </div>





                </div>



            }




        </>

    )

}


export default DownloadButton;