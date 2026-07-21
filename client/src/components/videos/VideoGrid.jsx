import React from "react";
import VideoCard from "../dashboard/VideoCard.jsx";



const videos = [

    {
        id: 1,
        title: "React Full Course",
        category: "Frontend",
        duration: "5 Hours",
        premium: false
    },

    {
        id: 2,
        title: "Node JS Masterclass",
        category: "Backend",
        duration: "3 Hours",
        premium: true
    },

    {
        id: 3,
        title: "MongoDB Complete Guide",
        category: "Database",
        duration: "2 Hours",
        premium: true
    },

    {
        id: 4,
        title: "Python Programming",
        category: "Programming",
        duration: "4 Hours",
        premium: false
    },

    {
        id: 5,
        title: "Artificial Intelligence Basics",
        category: "AI",
        duration: "6 Hours",
        premium: true
    },

    {
        id: 6,
        title: "Full Stack MERN Development",
        category: "Full Stack",
        duration: "8 Hours",
        premium: true
    }

];





function VideoGrid() {


    return (


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">



            {

                videos.map((video) => (


                    <VideoCard

                        key={video.id}

                        video={video}

                    />


                ))


            }



        </div>


    )

}


export default VideoGrid;