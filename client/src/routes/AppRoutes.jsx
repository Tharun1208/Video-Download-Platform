import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import LoginOtp from "../pages/LoginOtp";
import Register from "../pages/Register";
import EditProfile from "../pages/EditProfile";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";

import DashboardLayout from "../components/layout/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";

import Dashboard from "../pages/Dashboard";
import Videos from "../pages/Videos";
import VideoDetails from "../pages/VideoDetails";
import PexelsVideo from "../pages/PexelsVideo";
import Downloads from "../pages/Downloads";
import Profile from "../pages/Profile";
import Subscription from "../pages/Subscription";
import Settings from "../pages/Settings";
import Notifications from "../pages/Notifications";
import PaymentHistory from "../pages/PaymentHistory";

// Watch Party
import CreateParty from "../pages/watchparty/CreateParty";
import JoinParty from "../pages/watchparty/JoinParty";
import WatchRoom from "../pages/watchparty/WatchRoom";

import NotFound from "../pages/NotFound";

function AppRoutes() {
  return (
    <Routes>

      {/* ================= PUBLIC ================= */}

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/login-otp"
        element={<LoginOtp />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/reset-password/:token"
        element={<ResetPassword />}
      />

      {/* ================= PROTECTED ================= */}

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >

        {/* Dashboard */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* Videos */}

        <Route
          path="/browse-videos"
          element={<Videos />}
        />

        <Route
          path="/videos"
          element={<Videos />}
        />

        {/* MongoDB / YouTube Video */}

        <Route
          path="/video/:id"
          element={<VideoDetails />}
        />

        {/* Pexels Video */}

        <Route
          path="/pexels-video"
          element={<PexelsVideo />}
        />

        {/* Downloads */}

        <Route
          path="/downloads"
          element={<Downloads />}
        />

        {/* Profile */}

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/edit-profile"
          element={<EditProfile />}
        />

        {/* Subscription */}

        <Route
          path="/subscription"
          element={<Subscription />}
        />

        <Route
          path="/payment-history"
          element={<PaymentHistory />}
        />

        {/* Settings */}

        <Route
          path="/settings"
          element={<Settings />}
        />

        {/* Notifications */}

        <Route
          path="/notifications"
          element={<Notifications />}
        />

      </Route>

      {/* ================= WATCH PARTY ================= */}

      <Route
        path="/watch-party/create"
        element={<CreateParty />}
      />

      <Route
        path="/watch-party/create/:videoId"
        element={<CreateParty />}
      />

      <Route
        path="/watch-party/join"
        element={<JoinParty />}
      />

      <Route
        path="/watch-party/room/:roomCode"
        element={<WatchRoom />}
      />

      {/* ================= 404 CATCH-ALL ================= */}
      <Route
        path="*"
        element={<NotFound />}
      />

    </Routes>
  );
}

export default AppRoutes;