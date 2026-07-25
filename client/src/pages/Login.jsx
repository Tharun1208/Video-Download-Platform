import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import {
    MdVisibility,
    MdVisibilityOff,
} from "react-icons/md";

import Button from "../components/common/Button";
import { APP_NAME } from "../utils/constants";
import { loginUser } from "../api/authApi";

function Login() {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const response = await loginUser(formData);

            if (response.data.success) {

                // Save JWT Token
                localStorage.setItem("token", response.data.token);

                // Save User Details
                localStorage.setItem(
                    "user",
                    JSON.stringify(response.data.user)
                );

                alert("✅ Login Successful!");

                navigate("/dashboard");
            }

        } catch (error) {

            alert(
                error.response?.data?.message || "❌ Login Failed"
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-5">

            <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 text-white transition-all duration-300 hover:border-blue-500 hover:shadow-blue-500/20">

                <div className="text-center mb-8">

                    <h1 className="text-4xl font-bold">
                        {APP_NAME}
                    </h1>

                    <p className="text-gray-400 mt-3">
                        Welcome Back 👋
                    </p>

                    <p className="text-gray-500 text-sm mt-1">
                        Login to continue to your account.
                    </p>

                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

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
                            className="w-full mt-2 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 outline-none transition-all duration-300 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />

                    </div>

                    <div>

                        <label className="text-sm text-gray-300">
                            Password
                        </label>

                        <div className="relative">

                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                required
                                className="w-full mt-2 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 outline-none transition-all duration-300 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-6 text-gray-400 hover:text-blue-400 transition-all duration-300 hover:scale-110 active:scale-95"
                            >
                                {showPassword ? (
                                    <MdVisibilityOff size={22} />
                                ) : (
                                    <MdVisibility size={22} />
                                )}
                            </button>

                        </div>

                    </div>

                    <div className="flex justify-end">

                        <button
                            type="button"
                            className="text-sm text-blue-500 hover:text-blue-400 transition-colors"
                        >
                            Forgot Password?
                        </button>

                    </div>

                    <Button
                        type="submit"
                        icon={<LogIn size={20} />}
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </Button>

                </form>

                <p className="text-center text-gray-400 mt-8">

                    Don't have an account?

                    <Link
                        to="/register"
                        className="ml-2 text-blue-500 hover:text-blue-400 transition-colors"
                    >
                        Register
                    </Link>

                </p>

            </div>

        </div>
    );
}

export default Login;