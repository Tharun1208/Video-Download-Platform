import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import EditProfile from "../pages/EditProfile.jsx";
import DashboardLayout from "../components/layout/DashboardLayout.jsx";

import Dashboard from "../pages/Dashboard.jsx";
import Videos from "../pages/Videos.jsx";
import VideoDetails from "../pages/VideoDetails.jsx";
import Downloads from "../pages/Downloads.jsx";
import Profile from "../pages/Profile.jsx";
import Subscription from "../pages/Subscription.jsx";
import Settings from "../pages/Settings.jsx";
import Notifications from "../pages/Notifications.jsx";

function AppRoutes(){

return (

<Routes>


{/* Public Pages */}

<Route path="/" element={<Home/>}/>

<Route path="/login" element={<Login/>}/>

<Route path="/register" element={<Register/>}/>

<Route path="/edit-profile" element={<EditProfile />} />

{/* Pages with Sidebar + Navbar */}

<Route element={<DashboardLayout/>}>

<Route path="/notifications" element={<Notifications/>}/>
<Route 
path="/dashboard" 
element={<Dashboard/>}
/>


<Route 
path="/videos" 
element={<Videos/>}
/>


<Route 
path="/video/:id" 
element={<VideoDetails/>}
/>


<Route 
path="/downloads" 
element={<Downloads/>}
/>


<Route 
path="/profile" 
element={<Profile/>}
/>


<Route 
path="/subscription" 
element={<Subscription/>}
/>

<Route 
path="/settings" 
element={<Settings/>}
/>


</Route>


</Routes>

)

}


export default AppRoutes;