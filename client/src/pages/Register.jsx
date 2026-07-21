import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";

import Button from "../components/common/Button";
import { APP_NAME } from "../utils/constants";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    plan: "free",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(formData);

    // Backend registration will be connected later

    localStorage.setItem("token", "demo-token");

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-5">

      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 text-white transition-all duration-300 hover:border-blue-500 hover:shadow-blue-500/20">

        <div className="text-center mb-8">

          <h1 className="text-4xl font-bold">
            {APP_NAME}
          </h1>

          <p className="text-gray-400 mt-3">
            Create Your Account 🚀
          </p>

          <p className="text-gray-500 text-sm mt-1">
            Join VideoVault and start watching today.
          </p>

        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          <div>

            <label className="text-sm text-gray-300">
              Full Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              className="w-full mt-2 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 outline-none transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />

          </div>

          <div>

            <label className="text-sm text-gray-300">
              Email Address
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              className="w-full mt-2 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 outline-none transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />

          </div>

          <div>

            <label className="text-sm text-gray-300">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              required
              className="w-full mt-2 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 outline-none transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />

          </div>

          <div>

            <label className="text-sm text-gray-300">
              Select Plan
            </label>

            <select
              name="plan"
              value={formData.plan}
              onChange={handleChange}
              className="w-full mt-2 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white outline-none transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="free">
                Free Plan
              </option>

              <option value="premium">
                Premium Plan
              </option>
            </select>

          </div>

          <Button
            type="submit"
            icon={<UserPlus size={20} />}
            className="w-full"
          >
            Create Account
          </Button>

        </form>

        <p className="text-center text-gray-400 mt-8">

          Already have an account?

          <Link
            to="/login"
            className="ml-2 text-blue-500 hover:text-blue-400 transition-colors"
          >
            Login
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Register;