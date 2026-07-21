import React from "react";


const downloads = [

{
title:"React Full Course",
date:"18 July 2026",
status:"Completed"
},

{
title:"Node JS Masterclass",
date:"17 July 2026",
status:"Completed"
},

{
title:"MongoDB Tutorial",
date:"16 July 2026",
status:"Completed"
}

];



function RecentDownloads(){


return(

<div className="bg-gray-900 border border-gray-800 rounded-xl p-6 transition-all duration-300 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/20">



<div className="flex justify-between items-center mb-5">


<h2 className="text-xl font-bold text-white">

Recent Downloads

</h2>



<button className="text-blue-500 hover:text-blue-400">

View All

</button>


</div>






<div className="space-y-4">


{

downloads.map((item,index)=>(


<div

key={index}

className="flex items-center justify-between border-b border-gray-800 pb-3 rounded-lg px-2 py-2 transition-all duration-300 hover:bg-gray-800"

>



<div>


<h3 className="font-semibold text-white">

{item.title}

</h3>



<p className="text-sm text-gray-400">

{item.date}

</p>


</div>





<span className="bg-green-900 text-green-400 px-3 py-1 rounded-full text-sm">

{item.status}

</span>




</div>


))

}



</div>



</div>

)

}


export default RecentDownloads;