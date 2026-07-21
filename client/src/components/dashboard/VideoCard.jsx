import React from "react";
import DownloadButton from "../videos/DownloadButton";
import { Link } from "react-router-dom";
import {
    Play,
    Crown
} from "lucide-react";


function VideoCard({ video = {} }) {


    return (

        <div className="group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/20">


            {/* Thumbnail */}

            <div className="h-44 bg-gray-800 flex items-center justify-center relative">


                <span className="text-gray-400">

                    Thumbnail

                </span>





                {
                    video.premium &&

                    <div className="absolute top-3 right-3 bg-yellow-500 text-black px-3 py-1 rounded-full flex items-center gap-1 text-sm font-semibold">

                        <Crown size={15} />

                        Premium

                    </div>

                }


            </div>







            <div className="p-5">


                <h2 className="text-xl font-bold text-white">

                    {video.title}

                </h2>





                <p className="text-gray-400 mt-2">

                    {video.category}

                </p>





                <p className="text-sm text-gray-500 mt-1">

                    Duration: {video.duration}

                </p>







                <div className="flex gap-3 mt-5">





                    <Link

                        to={`/video/${video.id}`}

                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"

                    >


                        <Play size={18} />

                        Watch


                    </Link>







                    <DownloadButton

                        video={video}

                    />





                </div>





            </div>





        </div>

    )

}


export default VideoCard;