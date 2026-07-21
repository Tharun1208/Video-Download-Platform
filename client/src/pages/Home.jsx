import React from "react";
import { Link } from "react-router-dom";
import Button from "../components/common/Button";
import Footer from "../components/layout/Footer";
import { APP_NAME } from "../utils/constants";
import {
    Play,
    Download,
    ShieldCheck,
    Crown,
    Users
} from "lucide-react";


function Home() {

    return (

        <div className="min-h-screen bg-gray-950 text-white">


            {/* Navbar */}

            <nav className="flex items-center justify-between px-8 py-5">

                <h1 className="text-2xl font-bold">{APP_NAME}</h1>


                <div className="space-x-4">

                    <Link to="/login">
                        <Button variant="outline">
                            Login
                        </Button>
                    </Link>


                    <Link to="/register">
                        <Button>
                            Get Started
                        </Button>
                    </Link>

                </div>


            </nav>



            {/* Hero Section */}

            {/* Hero Section */}

<section className="flex flex-col items-center justify-center text-center px-6 py-24">



  <h2 className="text-6xl font-extrabold max-w-5xl leading-tight">

    Watch Download
    <br />

    <span className="text-blue-500 transition-all duration-300 hover:text-blue-400 hover:translate-x-1">

      Stream Securely Anywhere.

    </span>
    

  </h2>

  <p className="mt-8 text-gray-400 max-w-3xl text-xl leading-8">

    VideoVault lets you stream and download videos securely with
    subscription-based download limits, premium content, and a
    seamless viewing experience from any device.

  </p>
    <span className="bg-blue-600/20 text-blue-400 px-4 py-2 rounded-full border border-blue-600 mb-6">

    🚀 Secure Video Streaming Platform

  </span>

  <div className="mt-10 flex flex-wrap justify-center gap-5">

    <Link to="/register">

      <Button
        icon={<Play size={20} />}
        size="lg"
      >
        Get Started
      </Button>

    </Link>

    <Link to="/subscription">

      <Button
        variant="outline"
        icon={<Crown size={20} />}
        size="lg"
      >
        Explore Plans
      </Button>

    </Link>

  </div>

</section>


            {/* Features */}

            <section className="grid md:grid-cols-3 gap-6 px-10 pb-20">


                <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/20 cursor-pointer">

                    <Download
                        className="text-blue-500 transition-all duration-300 hover:text-blue-400 hover:translate-x-1"
                        size={35}
                    />


                    <h3 className="text-xl font-semibold mt-4">

                        Controlled Downloads

                    </h3>


                    <p className="text-gray-400 mt-2">

                        Download videos based on your subscription plan.

                    </p>


                </div>



                <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/20 cursor-pointer">

                    <ShieldCheck
                        className="text-green-500"
                        size={35}
                    />


                    <h3 className="text-xl font-semibold mt-4">

                        Secure Platform

                    </h3>


                    <p className="text-gray-400 mt-2">

                        Your downloads and account data are protected.

                    </p>


                </div>



                <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/20 cursor-pointer">

                    <Users
                        className="text-purple-500"
                        size={35}
                    />


                    <h3 className="text-xl font-semibold mt-4">

                        Premium Experience

                    </h3>


                    <p className="text-gray-400 mt-2">

                        Upgrade plans and unlock more downloads.

                    </p>


                </div>


            </section>



            {/* Pricing Preview */}

            <section className="px-10 pb-20">


                <h2 className="text-3xl font-bold text-center mb-10">

                    Choose Your Plan

                </h2>



                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">


                    <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/20">

                        <h3 className="text-2xl font-bold">

                            Free

                        </h3>


                        <p className="text-4xl font-bold mt-4">

                            ₹0

                        </p>


                        <ul className="mt-5 text-gray-400 space-y-2">

                            <li>✔ Watch Videos</li>

                            <li>✔ 1 Download Per Day</li>

                            <li>✔ Basic Access</li>

                        </ul>


                    </div>




                     <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/40">


                        <h3 className="text-2xl font-bold">

                            Premium

                        </h3>


                        <p className="text-4xl font-bold mt-4">

                            ₹299

                        </p>


                        <ul className="mt-5 space-y-2">

                            <li>✔ Multiple Downloads</li>

                            <li>✔ Premium Videos</li>

                            <li>✔ Download History</li>

                        </ul>


                    </div>


                </div>


            </section>




            {/* Footer */}

            <Footer />



        </div>

    )

}


export default Home;