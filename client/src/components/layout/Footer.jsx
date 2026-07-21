import React from "react";
import { Link } from "react-router-dom";
import {
  Globe,
  Mail,
  ExternalLink
} from "lucide-react";

function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-gray-800 text-gray-400 mt-16">

      <div className="max-w-7xl mx-auto px-8 py-12">

        <div className="grid md:grid-cols-3 gap-10">

          {/* Logo */}

          <div>

            <h2 className="text-2xl font-bold text-blue-500">

              VideoVault

            </h2>

            <p className="mt-4 leading-7">

              A secure video streaming and controlled download platform.
              Watch videos anywhere while managing downloads according to
              your subscription plan.

            </p>

          </div>

          {/* Quick Links */}

          <div>

            <h3 className="text-white font-semibold text-lg mb-4">

              Quick Links

            </h3>

            <div className="flex flex-col gap-3">

              <Link to="/" className="hover:text-blue-500">

                Home

              </Link>

              <Link to="/login" className="hover:text-blue-500">

                Login

              </Link>

              <Link to="/register" className="hover:text-blue-500">

                Register

              </Link>

              <Link to="/subscription" className="hover:text-blue-500">

                Subscription

              </Link>

            </div>

          </div>

          {/* Contact */}

          <div>

            <h3 className="text-white font-semibold text-lg mb-4">

              Contact

            </h3>

            <div className="space-y-4">

              <div className="flex items-center gap-3">

                <Mail size={18} />

                support@videovault.com

              </div>

              <div className="flex items-center gap-3">

                <Globe size={18} />

                GitHub

              </div>

              <div className="flex items-center gap-3">

                <ExternalLink size={18} />

                LinkedIn

              </div>

            </div>

          </div>

        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center">

          © 2026 VideoVault. All Rights Reserved.

        </div>

      </div>

    </footer>
  );
}

export default Footer;