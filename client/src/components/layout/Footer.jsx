import React from "react";
import { Link } from "react-router-dom";
import {
  Globe,
  Mail,
  ExternalLink
} from "lucide-react";
import Logo from "../common/Logo";

function Footer() {
  return (
    <footer className="theme-card border-t theme-border theme-text-secondary mt-16 transition-colors duration-300">

      <div className="max-w-7xl mx-auto px-8 py-12">

        <div className="grid md:grid-cols-3 gap-10">

          {/* Logo */}

          <div>

            <Logo asLink={true} size="md" />

            <p className="mt-4 leading-7 theme-text-secondary">

              A secure video streaming and controlled download platform.
              Watch videos anywhere while managing downloads according to
              your subscription plan.

            </p>

          </div>

          {/* Quick Links */}

          <div>

            <h3 className="theme-text font-semibold text-lg mb-4">

              Quick Links

            </h3>

            <div className="flex flex-col gap-3">

              <Link to="/" className="hover:text-blue-500 theme-text-secondary">

                Home

              </Link>

              <Link to="/login" className="hover:text-blue-500 theme-text-secondary">

                Login

              </Link>

              <Link to="/register" className="hover:text-blue-500 theme-text-secondary">

                Register

              </Link>

              <Link to="/subscription" className="hover:text-blue-500 theme-text-secondary">

                Subscription

              </Link>

            </div>

          </div>

          {/* Contact */}

          <div>

            <h3 className="theme-text font-semibold text-lg mb-4">

              Contact

            </h3>

            <div className="space-y-4">

              <div className="flex items-center gap-3">

                <Mail size={18} />

                support@streamvault.com

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

        <div className="border-t theme-border mt-10 pt-6 text-center theme-text-muted">

          © 2026 StreamVault. All Rights Reserved.

        </div>

      </div>

    </footer>
  );
}

export default Footer;