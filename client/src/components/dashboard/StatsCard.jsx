import React from "react";


function StatsCard({title,value}){

return(

<div className="bg-gray-900 border border-gray-800 rounded-xl p-6 transition-all duration-300 hover:-translate-y-2 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/20 cursor-pointer">


<p className="text-gray-400">

{title}

</p>



<h2 className="text-3xl font-bold mt-3 text-white">

{value}

</h2>



</div>

)

}


export default StatsCard;